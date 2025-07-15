/**
 * T5-A | BehaviorDB - 行为策略持久化与热加载核心模块
 * 使用原生fs实现，避免复杂的第三方依赖问题
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { PetState, EmotionType } from '../../types';

// 行为策略核心接口（符合T5-A任务卡要求）
export interface BehaviorStrategySchema {
  name: string;
  state: PetState;
  emotion: EmotionType;
  actions: string[];
  rhythm?: RhythmMode;
  priority?: number;
  metadata?: Record<string, any>;
}

// 节拍模式枚举
export enum RhythmMode {
  IDLE = 'idle',
  ACTIVE = 'active', 
  RESPONSIVE = 'responsive',
  BACKGROUND = 'background'
}

// 验证结果接口
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * 验证策略结构和数据有效性
 */
export function validateStrategy(strategy: BehaviorStrategySchema): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 必需字段验证
  if (!strategy.name || typeof strategy.name !== 'string') {
    errors.push('策略名称不能为空且必须是字符串');
  }

  if (!strategy.state) {
    errors.push('策略状态不能为空');
  } else if (!Object.values(PetState).includes(strategy.state)) {
    errors.push(`无效的状态值: ${strategy.state}`);
  }

  if (!strategy.emotion) {
    errors.push('策略情绪不能为空');
  } else if (!Object.values(EmotionType).includes(strategy.emotion)) {
    errors.push(`无效的情绪值: ${strategy.emotion}`);
  }

  if (!strategy.actions || !Array.isArray(strategy.actions)) {
    errors.push('策略动作必须是数组');
  } else if (strategy.actions.length === 0) {
    warnings.push('策略动作数组为空');
  }

  // 可选字段验证
  if (strategy.rhythm && !Object.values(RhythmMode).includes(strategy.rhythm)) {
    errors.push(`无效的节奏模式: ${strategy.rhythm}`);
  }

  if (strategy.priority !== undefined) {
    if (typeof strategy.priority !== 'number') {
      errors.push('优先级必须是数字');
    } else if (strategy.priority < 0 || strategy.priority > 100) {
      warnings.push('优先级建议在0-100范围内');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

// 数据库结构
export interface DatabaseSchema {
  strategies: BehaviorStrategySchema[];
  metadata: {
    version: string;
    lastUpdated: string;
    totalStrategies: number;
  };
}

// 默认数据库结构
const defaultData: DatabaseSchema = {
  strategies: [],
  metadata: {
    version: '1.0.0',
    lastUpdated: new Date().toISOString(),
    totalStrategies: 0
  }
};

/**
 * T5-A BehaviorDB 核心类
 * 使用原生fs实现策略持久化、热加载、导入导出功能
 */
export class BehaviorDB {
  private dbPath: string;
  private configPath: string;
  private isInitialized: boolean = false;
  private watchers: Map<string, () => void> = new Map();
  private cache: DatabaseSchema = { ...defaultData };

  constructor(dbPath?: string) {
    this.configPath = path.join(process.cwd(), '.config', 'strategies');
    this.dbPath = dbPath || path.join(this.configPath, 'behavior-strategies.json');

    console.log('🗄️ BehaviorDB 初始化:', {
      dbPath: this.dbPath,
      configPath: this.configPath
    });
  }

  /**
   * 初始化数据库
   */
  async initialize(): Promise<void> {
    try {
      // 确保配置目录存在
      await fs.mkdir(this.configPath, { recursive: true });
      
      // 读取或创建数据库文件
      await this.loadFromFile();

      this.isInitialized = true;
      console.log('✅ BehaviorDB 初始化完成:', {
        totalStrategies: this.cache.strategies.length,
        version: this.cache.metadata.version
      });
    } catch (error) {
      console.error('❌ BehaviorDB 初始化失败:', error);
      throw error;
    }
  }

  /**
   * 从文件加载数据
   */
  private async loadFromFile(): Promise<void> {
    try {
      const data = await fs.readFile(this.dbPath, 'utf8');
      this.cache = JSON.parse(data);
    } catch (error) {
      // 文件不存在，使用默认数据
      this.cache = { ...defaultData };
      await this.saveToFile();
    }
  }

  /**
   * 保存数据到文件
   */
  private async saveToFile(): Promise<void> {
    try {
      const data = JSON.stringify(this.cache, null, 2);
      await fs.writeFile(this.dbPath, data, 'utf8');
    } catch (error) {
      console.error('❌ 保存数据库文件失败:', error);
      throw error;
    }
  }

  /**
   * 加载所有策略
   */
  async loadStrategies(): Promise<BehaviorStrategySchema[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    await this.loadFromFile();
    const strategies = this.cache.strategies || [];
    
    console.log(`📚 加载策略: ${strategies.length} 个`);
    return [...strategies];
  }

  /**
   * 保存策略列表
   */
  async saveStrategies(strategies: BehaviorStrategySchema[]): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // 验证所有策略
    for (const strategy of strategies) {
      const validation = validateStrategy(strategy);
      if (!validation.valid) {
        throw new Error(`策略验证失败 "${strategy.name}": ${validation.errors.join(', ')}`);
      }
    }

    // 更新缓存
    this.cache.strategies = strategies;
    this.cache.metadata = {
      ...this.cache.metadata,
      lastUpdated: new Date().toISOString(),
      totalStrategies: strategies.length
    };

    await this.saveToFile();
    console.log(`💾 保存策略: ${strategies.length} 个`);

    // 触发热加载回调
    this.triggerHotReload();
  }

  /**
   * 热加载单个策略
   */
  async hotLoadStrategy(strategy: BehaviorStrategySchema): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // 验证策略
    const validation = validateStrategy(strategy);
    if (!validation.valid) {
      throw new Error(`策略热加载验证失败: ${validation.errors.join(', ')}`);
    }

    await this.loadFromFile();
    
    // 查找是否已存在同名策略
    const existingIndex = this.cache.strategies.findIndex((s: BehaviorStrategySchema) => s.name === strategy.name);
    
    if (existingIndex >= 0) {
      // 更新现有策略
      this.cache.strategies[existingIndex] = strategy;
      console.log(`🔄 热更新策略: ${strategy.name}`);
    } else {
      // 添加新策略
      this.cache.strategies.push(strategy);
      console.log(`🔥 热加载新策略: ${strategy.name}`);
    }

    // 更新元数据
    this.cache.metadata = {
      ...this.cache.metadata,
      lastUpdated: new Date().toISOString(),
      totalStrategies: this.cache.strategies.length
    };

    await this.saveToFile();
    this.triggerHotReload();
  }

  /**
   * 从文件导入策略
   */
  async importStrategies(filePath: string, merge: boolean = false): Promise<void> {
    try {
      console.log(`📥 开始导入策略: ${filePath}`);
      
      const fileContent = await fs.readFile(filePath, 'utf8');
      const importedData = JSON.parse(fileContent);
      
      let importedStrategies: BehaviorStrategySchema[] = [];
      
      // 处理不同的导入格式
      if (Array.isArray(importedData)) {
        importedStrategies = importedData;
      } else if (importedData.strategies && Array.isArray(importedData.strategies)) {
        importedStrategies = importedData.strategies;
      } else {
        throw new Error('无效的策略文件格式');
      }

      // 验证所有导入的策略
      for (const strategy of importedStrategies) {
        const validation = validateStrategy(strategy);
        if (!validation.valid) {
          throw new Error(`导入策略验证失败 "${strategy.name}": ${validation.errors.join(', ')}`);
        }
      }

      if (merge) {
        // 合并模式：与现有策略合并
        const currentStrategies = await this.loadStrategies();
        const mergedStrategies = [...currentStrategies];
        
        for (const newStrategy of importedStrategies) {
          const existingIndex = mergedStrategies.findIndex((s: BehaviorStrategySchema) => s.name === newStrategy.name);
          if (existingIndex >= 0) {
            mergedStrategies[existingIndex] = newStrategy;
          } else {
            mergedStrategies.push(newStrategy);
          }
        }
        
        await this.saveStrategies(mergedStrategies);
        console.log(`✅ 合并导入完成: ${importedStrategies.length} 个策略`);
      } else {
        // 替换模式：完全替换现有策略
        await this.saveStrategies(importedStrategies);
        console.log(`✅ 替换导入完成: ${importedStrategies.length} 个策略`);
      }
    } catch (error) {
      console.error('❌ 策略导入失败:', error);
      throw error;
    }
  }

  /**
   * 导出策略到文件
   */
  async exportStrategies(filePath: string, prettify: boolean = true): Promise<void> {
    try {
      console.log(`📤 开始导出策略: ${filePath}`);
      
      const strategies = await this.loadStrategies();
      
      const exportData = {
        metadata: {
          exportTime: new Date().toISOString(),
          version: this.cache.metadata.version || '1.0.0',
          totalStrategies: strategies.length
        },
        strategies
      };

      const content = prettify 
        ? JSON.stringify(exportData, null, 2)
        : JSON.stringify(exportData);

      // 确保导出目录存在
      const exportDir = path.dirname(filePath);
      await fs.mkdir(exportDir, { recursive: true });
      
      await fs.writeFile(filePath, content, 'utf8');
      console.log(`✅ 策略导出完成: ${strategies.length} 个策略 → ${filePath}`);
    } catch (error) {
      console.error('❌ 策略导出失败:', error);
      throw error;
    }
  }

  /**
   * 获取匹配的策略
   */
  async getMatchingStrategies(state: PetState, emotion: EmotionType): Promise<BehaviorStrategySchema[]> {
    const strategies = await this.loadStrategies();
    
    return strategies
      .filter(strategy => strategy.state === state && strategy.emotion === emotion)
      .sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }

  /**
   * 注册热加载监听器
   */
  onHotReload(name: string, callback: () => void): void {
    this.watchers.set(name, callback);
    console.log(`🔥 注册热加载监听器: ${name}`);
  }

  /**
   * 移除热加载监听器
   */
  offHotReload(name: string): void {
    this.watchers.delete(name);
    console.log(`🔥 移除热加载监听器: ${name}`);
  }

  /**
   * 触发热加载回调
   */
  private triggerHotReload(): void {
    for (const [name, callback] of Array.from(this.watchers.entries())) {
      try {
        callback();
        console.log(`🔥 触发热加载回调: ${name}`);
      } catch (error) {
        console.error(`❌ 热加载回调执行失败 ${name}:`, error);
      }
    }
  }

  /**
   * 创建备份
   */
  async createBackup(): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(this.configPath, 'backups', `backup-${timestamp}.json`);
    
    await fs.mkdir(path.dirname(backupPath), { recursive: true });
    
    const strategies = await this.loadStrategies();
    const backupData = {
      timestamp: new Date().toISOString(),
      strategies
    };
    
    await fs.writeFile(backupPath, JSON.stringify(backupData, null, 2), 'utf8');
    console.log(`📋 创建备份: ${backupPath}`);
    
    return backupPath;
  }

  /**
   * 获取数据库状态
   */
  async getStatus(): Promise<{
    isInitialized: boolean;
    dbPath: string;
    totalStrategies: number;
    lastUpdated: string;
    version: string;
  }> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    return {
      isInitialized: this.isInitialized,
      dbPath: this.dbPath,
      totalStrategies: this.cache.metadata.totalStrategies || 0,
      lastUpdated: this.cache.metadata.lastUpdated || '',
      version: this.cache.metadata.version || '1.0.0'
    };
  }

  /**
   * 销毁数据库连接
   */
  async destroy(): Promise<void> {
    this.watchers.clear();
    this.isInitialized = false;
    console.log('🗄️ BehaviorDB 已销毁');
  }
}

// 导出核心接口和函数（符合T5-A任务卡接口草案）
export async function loadStrategies(): Promise<BehaviorStrategySchema[]> {
  const db = new BehaviorDB();
  return await db.loadStrategies();
}

export async function saveStrategies(strategies: BehaviorStrategySchema[]): Promise<void> {
  const db = new BehaviorDB();
  await db.saveStrategies(strategies);
}

export async function hotLoadStrategy(strategy: BehaviorStrategySchema): Promise<void> {
  const db = new BehaviorDB();
  await db.hotLoadStrategy(strategy);
}

export async function importStrategies(filePath: string): Promise<void> {
  const db = new BehaviorDB();
  await db.importStrategies(filePath);
}

export async function exportStrategies(filePath: string): Promise<void> {
  const db = new BehaviorDB();
  await db.exportStrategies(filePath);
}
