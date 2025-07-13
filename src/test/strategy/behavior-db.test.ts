/**
 * T5-A | BehaviorDB 单元测试与集成测试
 * 验证持久化、热加载、导入导出功能
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { BehaviorDB, BehaviorStrategySchema, RhythmMode, validateStrategy, ValidationResult } from '../../modules/strategy/BehaviorDB';
import { PetState, EmotionType } from '../../types';

// Jest 测试用例
describe('BehaviorDB T5-A', () => {
  test('validateStrategy should work correctly', () => {
    const validStrategy = {
      name: 'test',
      state: 'idle' as any,
      emotion: 'happy' as any,
      actions: ['blink']
    };
    
    const result = validateStrategy(validStrategy);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('validateStrategy should detect invalid strategy', () => {
    const invalidStrategy = {
      name: '',
      state: 'invalid' as any,
      emotion: 'invalid' as any,
      actions: []
    };
    
    const result = validateStrategy(invalidStrategy);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});

/**
 * T5-A 测试套件类
 */
class BehaviorDBTestSuite {
  private testDb: BehaviorDB;
  private testDir: string;
  private testResults: Map<string, boolean> = new Map();

  constructor() {
    this.testDir = path.join(process.cwd(), '.test-temp');
    this.testDb = new BehaviorDB(path.join(this.testDir, 'test-strategies.json'));
  }

  /**
   * 运行所有测试
   */
  async runAllTests(): Promise<void> {
    console.log('🧪 ===== T5-A BehaviorDB 测试开始 =====\n');

    try {
      // 1. 基础功能测试
      await this.testBasicOperations();
      
      // 2. 验证功能测试
      await this.testValidation();
      
      // 3. 热加载测试
      await this.testHotLoading();
      
      // 4. 导入导出测试
      await this.testImportExport();
      
      // 5. 异常处理测试
      await this.testErrorHandling();
      
      // 6. 集成测试
      await this.testIntegration();

      // 输出测试结果
      this.printTestResults();
      
    } catch (error) {
      console.error('❌ 测试执行失败:', error);
    } finally {
      await this.cleanup();
    }
  }

  /**
   * 测试基础操作
   */
  async testBasicOperations(): Promise<void> {
    console.log('📝 测试1: 基础数据库操作');
    
    try {
      // 初始化测试
      await this.testDb.initialize();
      console.log('  ✅ 数据库初始化成功');
      this.testResults.set('db_init', true);
      
      // 创建测试策略
      const testStrategy: BehaviorStrategySchema = {
        name: 'test_strategy_idle_calm',
        state: PetState.Idle,
        emotion: EmotionType.Calm,
        actions: ['test_action_1', 'test_action_2'],
        rhythm: RhythmMode.BACKGROUND,
        priority: 5,
        metadata: {
          test: true,
          description: '测试策略'
        }
      };

      // 测试保存策略
      await this.testDb.saveStrategies([testStrategy]);
      console.log('  ✅ 策略保存成功');
      this.testResults.set('save_strategy', true);

      // 测试加载策略
      const loadedStrategies = await this.testDb.loadStrategies();
      if (loadedStrategies.length === 1 && loadedStrategies[0].name === testStrategy.name) {
        console.log('  ✅ 策略加载成功');
        this.testResults.set('load_strategy', true);
      } else {
        throw new Error('加载的策略数据不匹配');
      }

      // 测试获取匹配策略
      const matchingStrategies = await this.testDb.getMatchingStrategies(PetState.Idle, EmotionType.Calm);
      if (matchingStrategies.length === 1) {
        console.log('  ✅ 策略匹配功能正常');
        this.testResults.set('strategy_matching', true);
      } else {
        throw new Error('策略匹配结果不正确');
      }

    } catch (error) {
      console.log('  ❌ 基础操作测试失败:', error);
      this.testResults.set('basic_operations', false);
    }
    
    console.log('');
  }

  /**
   * 测试验证功能
   */
  async testValidation(): Promise<void> {
    console.log('📝 测试2: 策略验证功能');
    
    try {
      // 测试有效策略
      const validStrategy: BehaviorStrategySchema = {
        name: 'valid_test_strategy',
        state: PetState.Hover,
        emotion: EmotionType.Curious,
        actions: ['action1', 'action2'],
        rhythm: RhythmMode.RESPONSIVE,
        priority: 3
      };

      const validResult = validateStrategy(validStrategy);
      if (validResult.valid) {
        console.log('  ✅ 有效策略验证通过');
        this.testResults.set('valid_strategy_validation', true);
      } else {
        throw new Error('有效策略验证失败');
      }

      // 测试无效策略
      const invalidStrategy = {
        name: '', // 空名称
        state: 'InvalidState', // 无效状态
        emotion: EmotionType.Happy,
        actions: [], // 空动作数组
        priority: 'invalid' // 无效优先级类型
      } as any;

      const invalidResult = validateStrategy(invalidStrategy);
      if (!invalidResult.valid && invalidResult.errors.length > 0) {
        console.log('  ✅ 无效策略正确识别');
        this.testResults.set('invalid_strategy_validation', true);
      } else {
        throw new Error('无效策略验证失败');
      }

      // 测试保存无效策略
      try {
        await this.testDb.saveStrategies([invalidStrategy]);
        this.testResults.set('invalid_strategy_rejection', false);
      } catch (error) {
        console.log('  ✅ 无效策略保存被正确拒绝');
        this.testResults.set('invalid_strategy_rejection', true);
      }

    } catch (error) {
      console.log('  ❌ 验证功能测试失败:', error);
      this.testResults.set('validation', false);
    }
    
    console.log('');
  }

  /**
   * 测试热加载功能
   */
  async testHotLoading(): Promise<void> {
    console.log('📝 测试3: 热加载功能');
    
    try {
      let hotLoadTriggered = false;
      
      // 注册热加载监听器
      this.testDb.onHotReload('test_listener', () => {
        hotLoadTriggered = true;
      });

      // 创建新策略并热加载
      const hotLoadStrategy: BehaviorStrategySchema = {
        name: 'hot_load_test',
        state: PetState.Awaken,
        emotion: EmotionType.Excited,
        actions: ['hot_action_1', 'hot_action_2'],
        rhythm: RhythmMode.ACTIVE,
        priority: 8
      };

      await this.testDb.hotLoadStrategy(hotLoadStrategy);
      
      // 验证热加载是否触发
      if (hotLoadTriggered) {
        console.log('  ✅ 热加载监听器正确触发');
        this.testResults.set('hot_load_listener', true);
      }

      // 验证策略是否已加载
      const strategies = await this.testDb.loadStrategies();
      const foundStrategy = strategies.find(s => s.name === 'hot_load_test');
      
      if (foundStrategy) {
        console.log('  ✅ 热加载策略成功添加');
        this.testResults.set('hot_load_strategy', true);
      } else {
        throw new Error('热加载策略未找到');
      }

      // 测试策略更新
      const updatedStrategy = { ...hotLoadStrategy, priority: 9 };
      await this.testDb.hotLoadStrategy(updatedStrategy);
      
      const updatedStrategies = await this.testDb.loadStrategies();
      const updatedFound = updatedStrategies.find(s => s.name === 'hot_load_test');
      
      if (updatedFound && updatedFound.priority === 9) {
        console.log('  ✅ 热加载策略更新成功');
        this.testResults.set('hot_load_update', true);
      } else {
        throw new Error('热加载策略更新失败');
      }

    } catch (error) {
      console.log('  ❌ 热加载功能测试失败:', error);
      this.testResults.set('hot_loading', false);
    }
    
    console.log('');
  }

  /**
   * 测试导入导出功能
   */
  async testImportExport(): Promise<void> {
    console.log('📝 测试4: 导入导出功能');
    
    try {
      // 准备测试数据
      const exportStrategies: BehaviorStrategySchema[] = [
        {
          name: 'export_test_1',
          state: PetState.Idle,
          emotion: EmotionType.Calm,
          actions: ['export_action_1'],
          priority: 1
        },
        {
          name: 'export_test_2',
          state: PetState.Control,
          emotion: EmotionType.Focused,
          actions: ['export_action_2'],
          priority: 2
        }
      ];

      await this.testDb.saveStrategies(exportStrategies);

      // 测试导出
      const exportPath = path.join(this.testDir, 'export-test.json');
      await this.testDb.exportStrategies(exportPath);
      
      const exportExists = await fs.access(exportPath).then(() => true).catch(() => false);
      if (exportExists) {
        console.log('  ✅ 策略导出成功');
        this.testResults.set('export_strategies', true);
      }

      // 测试导入
      const importPath = path.join(this.testDir, 'import-test.json');
      const importData = {
        strategies: [
          {
            name: 'import_test_1',
            state: PetState.Hover,
            emotion: EmotionType.Curious,
            actions: ['import_action_1'],
            priority: 3
          }
        ]
      };

      await fs.writeFile(importPath, JSON.stringify(importData, null, 2));
      await this.testDb.importStrategies(importPath, false);
      
      const importedStrategies = await this.testDb.loadStrategies();
      const foundImported = importedStrategies.find(s => s.name === 'import_test_1');
      
      if (foundImported) {
        console.log('  ✅ 策略导入成功');
        this.testResults.set('import_strategies', true);
      }

      // 测试合并导入
      const mergeData = {
        strategies: [
          {
            name: 'merge_test_1',
            state: PetState.Awaken,
            emotion: EmotionType.Happy,
            actions: ['merge_action_1'],
            priority: 4
          }
        ]
      };

      const mergePath = path.join(this.testDir, 'merge-test.json');
      await fs.writeFile(mergePath, JSON.stringify(mergeData, null, 2));
      await this.testDb.importStrategies(mergePath, true);
      
      const mergedStrategies = await this.testDb.loadStrategies();
      const foundMerged = mergedStrategies.find(s => s.name === 'merge_test_1');
      const foundExisting = mergedStrategies.find(s => s.name === 'import_test_1');
      
      if (foundMerged && foundExisting) {
        console.log('  ✅ 策略合并导入成功');
        this.testResults.set('merge_import', true);
      }

    } catch (error) {
      console.log('  ❌ 导入导出功能测试失败:', error);
      this.testResults.set('import_export', false);
    }
    
    console.log('');
  }

  /**
   * 测试异常处理
   */
  async testErrorHandling(): Promise<void> {
    console.log('📝 测试5: 异常处理');
    
    try {
      // 测试导入不存在的文件
      try {
        await this.testDb.importStrategies('/non/existent/path.json');
        this.testResults.set('import_error_handling', false);
      } catch (error) {
        console.log('  ✅ 导入不存在文件错误处理正确');
        this.testResults.set('import_error_handling', true);
      }

      // 测试导入无效JSON
      const invalidJsonPath = path.join(this.testDir, 'invalid.json');
      await fs.writeFile(invalidJsonPath, 'invalid json content');
      
      try {
        await this.testDb.importStrategies(invalidJsonPath);
        this.testResults.set('invalid_json_handling', false);
      } catch (error) {
        console.log('  ✅ 无效JSON错误处理正确');
        this.testResults.set('invalid_json_handling', true);
      }

      // 测试热加载无效策略
      const invalidHotStrategy = {
        name: '',
        state: 'invalid',
        actions: []
      } as any;

      try {
        await this.testDb.hotLoadStrategy(invalidHotStrategy);
        this.testResults.set('hot_load_error_handling', false);
      } catch (error) {
        console.log('  ✅ 热加载无效策略错误处理正确');
        this.testResults.set('hot_load_error_handling', true);
      }

    } catch (error) {
      console.log('  ❌ 异常处理测试失败:', error);
      this.testResults.set('error_handling', false);
    }
    
    console.log('');
  }

  /**
   * 测试与BehaviorScheduler集成
   */
  async testIntegration(): Promise<void> {
    console.log('📝 测试6: 集成测试');
    
    try {
      // 测试数据库状态
      const status = await this.testDb.getStatus();
      
      if (status.isInitialized && status.totalStrategies > 0) {
        console.log('  ✅ 数据库状态正常');
        this.testResults.set('db_status', true);
      }

      // 测试备份功能
      const backupPath = await this.testDb.createBackup();
      const backupExists = await fs.access(backupPath).then(() => true).catch(() => false);
      
      if (backupExists) {
        console.log('  ✅ 备份功能正常');
        this.testResults.set('backup_functionality', true);
      }

      // 测试多状态多情绪匹配
      const testStrategies: BehaviorStrategySchema[] = [
        {
          name: 'multi_test_1',
          state: PetState.Idle,
          emotion: EmotionType.Calm,
          actions: ['multi_action_1'],
          priority: 1
        },
        {
          name: 'multi_test_2',
          state: PetState.Idle,
          emotion: EmotionType.Calm,
          actions: ['multi_action_2'],
          priority: 2
        }
      ];

      await this.testDb.saveStrategies(testStrategies);
      const multiMatches = await this.testDb.getMatchingStrategies(PetState.Idle, EmotionType.Calm);
      
      if (multiMatches.length >= 2) {
        console.log('  ✅ 多策略匹配功能正常');
        this.testResults.set('multi_strategy_matching', true);
      }

    } catch (error) {
      console.log('  ❌ 集成测试失败:', error);
      this.testResults.set('integration', false);
    }
    
    console.log('');
  }

  /**
   * 打印测试结果
   */
  private printTestResults(): void {
    console.log('📊 ===== T5-A 测试结果汇总 =====');
    
    const totalTests = this.testResults.size;
    const passedTests = Array.from(this.testResults.values()).filter(result => result).length;
    const failedTests = totalTests - passedTests;
    
    console.log(`总测试数: ${totalTests}`);
    console.log(`通过测试: ${passedTests}`);
    console.log(`失败测试: ${failedTests}`);
    console.log(`成功率: ${((passedTests / totalTests) * 100).toFixed(1)}%\n`);
    
    // 详细结果
    for (const [testName, result] of this.testResults) {
      const status = result ? '✅' : '❌';
      console.log(`${status} ${testName}`);
    }
    
    if (failedTests === 0) {
      console.log('\n🎉 所有T5-A测试通过！BehaviorDB模块功能正常！');
    } else {
      console.log(`\n⚠️ 有 ${failedTests} 个测试失败，请检查相关功能。`);
    }
    
    console.log('\n🎯 T5-A任务验证点检查:');
    console.log(`✅ 本地策略读写: ${this.testResults.get('save_strategy') && this.testResults.get('load_strategy') ? '通过' : '失败'}`);
    console.log(`✅ 非法策略检测: ${this.testResults.get('invalid_strategy_rejection') ? '通过' : '失败'}`);
    console.log(`✅ 热加载切换: ${this.testResults.get('hot_load_strategy') ? '通过' : '失败'}`);
    console.log(`✅ 多策略合并: ${this.testResults.get('merge_import') ? '通过' : '失败'}`);
  }

  /**
   * 清理测试环境
   */
  private async cleanup(): Promise<void> {
    try {
      await this.testDb.destroy();
      await fs.rm(this.testDir, { recursive: true, force: true });
      console.log('\n🧹 测试环境清理完成');
    } catch (error) {
      console.log('⚠️ 测试环境清理失败:', error);
    }
  }
}

/**
 * 运行T5-A测试
 */
export async function runT5ATests(): Promise<void> {
  const testSuite = new BehaviorDBTestSuite();
  await testSuite.runAllTests();
}

// 如果直接运行此文件
if (typeof require !== 'undefined' && require.main === module) {
  runT5ATests().catch(console.error);
}
