/**
 * T5-A-4 | BehaviorDB测试套件
 * 测试策略加载、更新、错误处理等功能
 */

import fs from 'fs/promises';
import path from 'path';
import { BehaviorDB } from '../core/db/BehaviorDB';
import { BehaviorDBAdapter } from '../core/db/BehaviorDBAdapter';
import { StrategyRecord, createDefaultMetadata } from '../schema/strategySchema';
import { PetState, EmotionType } from '../types';

describe('BehaviorDB Test Suite', () => {
  let testDataPath: string;
  let behaviorDB: BehaviorDB;
  let dbAdapter: BehaviorDBAdapter;

  beforeAll(async () => {
    testDataPath = path.join(process.cwd(), 'test-data');
    console.log('🧪 BehaviorDB测试套件初始化');
    
    // 创建测试目录
    try {
      await fs.mkdir(testDataPath, { recursive: true });
    } catch (error) {
      // 目录可能已存在
    }
  });

  afterAll(async () => {
    // 清理测试数据
    try {
      await fs.rm(testDataPath, { recursive: true, force: true });
    } catch (error) {
      console.warn('⚠️ 清理测试数据失败:', error);
    }
  });

  beforeEach(() => {
    const testDbPath = path.join(testDataPath, `test-db-${Date.now()}.json`);
    behaviorDB = new BehaviorDB(testDbPath);
    dbAdapter = new BehaviorDBAdapter(testDbPath);
  });

  describe('基础操作测试', () => {
    test('应该能够初始化数据库', async () => {
      await expect(behaviorDB.initialize()).resolves.not.toThrow();
    });

    test('应该能够保存和加载策略', async () => {
      await behaviorDB.initialize();
      
      const testStrategy: StrategyRecord = {
        id: 'test_strategy_001',
        name: '测试策略',
        description: '这是一个测试策略',
        enabled: true,
        conditions: {
          states: [PetState.Idle],
          emotions: [EmotionType.Calm],
          priority: 5
        },
        actions: [{
          id: 'action_001',
          type: 'test_action',
          name: '测试动作'
        }],
        metadata: createDefaultMetadata()
      };

      // 保存策略
      await behaviorDB.saveStrategy(testStrategy);
      
      // 加载所有策略并查找测试策略
      const allStrategies = await behaviorDB.loadStrategies();
      const loadedStrategy = allStrategies.find(s => s.id === testStrategy.id);
      
      expect(loadedStrategy).toBeDefined();
      expect(loadedStrategy?.id).toBe(testStrategy.id);
      expect(loadedStrategy?.name).toBe(testStrategy.name);
    });

    test('应该能够更新策略', async () => {
      await behaviorDB.initialize();
      
      const testStrategy: StrategyRecord = {
        id: 'test_strategy_002',
        name: '原始策略',
        enabled: true,
        conditions: {
          states: [PetState.Idle],
          emotions: [EmotionType.Calm],
          priority: 5
        },
        actions: [{
          id: 'action_001',
          type: 'test_action',
          name: '测试动作'
        }],
        metadata: createDefaultMetadata()
      };

      await behaviorDB.saveStrategy(testStrategy);
      
      // 更新策略
      testStrategy.name = '更新后的策略';
      testStrategy.description = '这是更新后的描述';
      await behaviorDB.saveStrategy(testStrategy); // saveStrategy handles both create and update
      
      const allStrategies = await behaviorDB.loadStrategies();
      const updatedStrategy = allStrategies.find(s => s.id === testStrategy.id);
      
      expect(updatedStrategy?.name).toBe('更新后的策略');
      expect(updatedStrategy?.description).toBe('这是更新后的描述');
    });

    test('应该能够删除策略', async () => {
      await behaviorDB.initialize();
      
      const testStrategy: StrategyRecord = {
        id: 'test_strategy_003',
        name: '待删除策略',
        enabled: true,
        conditions: {
          states: [PetState.Idle],
          emotions: [EmotionType.Calm],
          priority: 5
        },
        actions: [{
          id: 'action_001',
          type: 'test_action',
          name: '测试动作'
        }],
        metadata: createDefaultMetadata()
      };

      await behaviorDB.saveStrategy(testStrategy);
      
      // 确认策略存在
      const beforeDelete = await behaviorDB.loadStrategies();
      expect(beforeDelete.find(s => s.id === testStrategy.id)).toBeDefined();
      
      // 删除策略
      const deleteResult = await behaviorDB.deleteStrategy(testStrategy.id);
      expect(deleteResult).toBe(true);
      
      // 确认策略已删除
      const afterDelete = await behaviorDB.loadStrategies();
      expect(afterDelete.find(s => s.id === testStrategy.id)).toBeUndefined();
    });
  });

  describe('数据库适配器测试', () => {
    test('应该能够获取所有策略', async () => {
      await dbAdapter.initialize();
      
      const strategies = await dbAdapter.getAllStrategies();
      expect(Array.isArray(strategies)).toBe(true);
    });

    test('应该能够保存和检索策略', async () => {
      await dbAdapter.initialize();
      
      const testStrategy: StrategyRecord = {
        id: 'adapter_test_001',
        name: '适配器测试策略',
        enabled: true,
        conditions: {
          states: [PetState.Hover],
          emotions: [EmotionType.Happy],
          priority: 7
        },
        actions: [{
          id: 'action_001',
          type: 'hover_action',
          name: '悬浮动作'
        }],
        metadata: createDefaultMetadata()
      };

      await dbAdapter.saveStrategy(testStrategy);
      const allStrategies = await dbAdapter.getAllStrategies();
      const retrieved = allStrategies.find(s => s.id === testStrategy.id);
      
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(testStrategy.id);
    });
  });

  describe('错误处理测试', () => {
    test('应该处理无效策略ID', async () => {
      await behaviorDB.initialize();
      
      const allStrategies = await behaviorDB.loadStrategies();
      const nonExistentStrategy = allStrategies.find(s => s.id === 'non_existent_id');
      expect(nonExistentStrategy).toBeUndefined();
    });

    test('应该处理文件系统错误', async () => {
      // 使用无效路径创建数据库
      const invalidDb = new BehaviorDB('/invalid/path/test.json');
      
      await expect(invalidDb.initialize()).rejects.toThrow();
    });
  });
});
