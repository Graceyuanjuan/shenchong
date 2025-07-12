/**
 * T5-A-2 | BehaviorDB核心模块
 * 策略持久化、热加载与版本管理
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';
import { 
  BehaviorDBSchema, 
  StrategyRecord, 
  StrategyValidationResult,
  StrategySnapshot,
  HotReloadConfig,
  StrategyIOOptions,
  StrategyExecutionStats,
  BEHAVIOR_DB_VERSION,
  createDefaultMetadata 
} from '../../schema/strategySchema';
import { PetState, EmotionType } from '../../types';

export class BehaviorDB {
  private dbPath: string;
  private backupPath: string;
  private snapshotsPath: string;
  private hotReloadConfig: HotReloadConfig;
  private watcherCallback?: (strategies: StrategyRecord[]) => void;
  private fileWatcher?: any;
  private cachedStrategies: StrategyRecord[] = [];
  private executionStats: Map<string, StrategyExecutionStats> = new Map();

  constructor(dbPath?: string) {
    this.dbPath = dbPath || path.join(process.cwd(), 'data', 'behavior-strategies.json');
    this.backupPath = path.join(path.dirname(this.dbPath), 'backups');
    this.snapshotsPath = path.join(path.dirname(this.dbPath), 'snapshots');
    
    this.hotReloadConfig = {
      enabled: true,
      watchPaths: [this.dbPath],
      debounceMs: 500,
      backupBeforeReload: true,
      validateBeforeReload: true
    };

    console.log('🗃️ BehaviorDB初始化:', {
      dbPath: this.dbPath,
      backupPath: this.backupPath,
      hotReload: this.hotReloadConfig.enabled
    });
  }

  /**
   * 初始化数据库
   */
  async initialize(): Promise<void> {
    try {
      // 确保目录存在
      await this.ensureDirectories();
      
      // 尝试加载现有数据库
      const dbExists = await this.fileExists(this.dbPath);
      if (!dbExists) {
        console.log('📁 创建新的策略数据库...');
        await this.createDefaultDatabase();
      }

      // 加载策略到缓存
      await this.loadStrategies();
      
      // 启动热加载监听
      if (this.hotReloadConfig.enabled) {
        await this.startHotReload();
      }

      console.log('✅ BehaviorDB初始化完成');
    } catch (error) {
      console.error('❌ BehaviorDB初始化失败:', error);
      throw error;
    }
  }

  /**
   * 加载所有策略
   */
  async loadStrategies(): Promise<StrategyRecord[]> {
    try {
      const dbSchema = await this.loadDatabase();
      this.cachedStrategies = dbSchema.strategies.filter((s: StrategyRecord) => s.enabled);
      
      console.log(`📚 加载策略数据: ${this.cachedStrategies.length}/${dbSchema.strategies.length} 个启用策略`);
      return [...this.cachedStrategies];
    } catch (error) {
      console.error('❌ 策略加载失败:', error);
      return [];
    }
  }

  /**
   * 获取缓存的策略列表
   */
  getCachedStrategies(): StrategyRecord[] {
    return [...this.cachedStrategies];
  }

  /**
   * 根据状态和情绪获取匹配的策略
   */
  getMatchingStrategies(state: PetState, emotion: EmotionType): StrategyRecord[] {
    return this.cachedStrategies.filter(strategy => {
      const conditions = strategy.conditions;
      const stateMatch = conditions.states.includes(state);
      const emotionMatch = conditions.emotions.includes(emotion);
      
      // 检查时间约束
      if (conditions.timeConstraints) {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentTime = currentHour * 60 + currentMinute;
        
        if (conditions.timeConstraints.startTime && conditions.timeConstraints.endTime) {
          const [startHour, startMin] = conditions.timeConstraints.startTime.split(':').map(Number);
          const [endHour, endMin] = conditions.timeConstraints.endTime.split(':').map(Number);
          const startTime = startHour * 60 + startMin;
          const endTime = endHour * 60 + endMin;
          
          if (currentTime < startTime || currentTime > endTime) {
            return false;
          }
        }
        
        if (conditions.timeConstraints.weekdays) {
          const currentWeekday = now.getDay() || 7; // Sunday = 7
          if (!conditions.timeConstraints.weekdays.includes(currentWeekday)) {
            return false;
          }
        }
      }
      
      return stateMatch && emotionMatch;
    });
  }

  /**
   * 保存单个策略
   */
  async saveStrategy(strategy: StrategyRecord): Promise<void> {
    try {
      // 验证策略
      const validation = this.validateStrategy(strategy);
      if (!validation.valid) {
        throw new Error(`策略验证失败: ${validation.errors.join(', ')}`);
      }

      const dbSchema = await this.loadDatabase();
      
      // 查找现有策略并更新，或添加新策略
      const existingIndex = dbSchema.strategies.findIndex((s: StrategyRecord) => s.id === strategy.id);
      if (existingIndex >= 0) {
        dbSchema.strategies[existingIndex] = {
          ...strategy,
          metadata: {
            ...strategy.metadata,
            updatedAt: new Date().toISOString()
          }
        };
        console.log(`🔄 更新策略: ${strategy.name} (${strategy.id})`);
      } else {
        dbSchema.strategies.push(strategy);
        console.log(`➕ 添加新策略: ${strategy.name} (${strategy.id})`);
      }

      // 更新数据库元数据
      dbSchema.lastUpdated = new Date().toISOString();
      dbSchema.metadata.totalStrategies = dbSchema.strategies.length;
      dbSchema.metadata.enabledStrategies = dbSchema.strategies.filter((s: StrategyRecord) => s.enabled).length;

      await this.saveDatabase(dbSchema);
      
      // 重新加载缓存
      await this.loadStrategies();
    } catch (error) {
      console.error('❌ 策略保存失败:', error);
      throw error;
    }
  }

  /**
   * 删除策略
   */
  async deleteStrategy(strategyId: string): Promise<boolean> {
    try {
      const dbSchema = await this.loadDatabase();
      const initialCount = dbSchema.strategies.length;
      
      dbSchema.strategies = dbSchema.strategies.filter((s: StrategyRecord) => s.id !== strategyId);
      
      if (dbSchema.strategies.length < initialCount) {
        dbSchema.lastUpdated = new Date().toISOString();
        dbSchema.metadata.totalStrategies = dbSchema.strategies.length;
        dbSchema.metadata.enabledStrategies = dbSchema.strategies.filter((s: StrategyRecord) => s.enabled).length;
        
        await this.saveDatabase(dbSchema);
        await this.loadStrategies();
        
        console.log(`🗑️ 删除策略: ${strategyId}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ 策略删除失败:', error);
      return false;
    }
  }

  /**
   * 批量替换策略（热加载）
   */
  async replaceStrategies(newStrategies: StrategyRecord[]): Promise<boolean> {
    try {
      // 创建备份
      if (this.hotReloadConfig.backupBeforeReload) {
        await this.createBackup();
      }

      // 验证所有策略
      if (this.hotReloadConfig.validateBeforeReload) {
        for (const strategy of newStrategies) {
          const validation = this.validateStrategy(strategy);
          if (!validation.valid) {
            throw new Error(`策略验证失败 ${strategy.id}: ${validation.errors.join(', ')}`);
          }
        }
      }

      const dbSchema = await this.loadDatabase();
      dbSchema.strategies = newStrategies;
      dbSchema.lastUpdated = new Date().toISOString();
      dbSchema.metadata.totalStrategies = newStrategies.length;
      dbSchema.metadata.enabledStrategies = newStrategies.filter(s => s.enabled).length;

      await this.saveDatabase(dbSchema);
      await this.loadStrategies();
      
      console.log(`🔄 热替换策略完成: ${newStrategies.length} 个策略`);
      
      // 通知监听器
      if (this.watcherCallback) {
        this.watcherCallback(this.cachedStrategies);
      }
      
      return true;
    } catch (error) {
      console.error('❌ 策略热替换失败:', error);
      return false;
    }
  }

  /**
   * 验证策略
   */
  validateStrategy(strategy: StrategyRecord): StrategyValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 必需字段验证
    if (!strategy.id || typeof strategy.id !== 'string') {
      errors.push('策略ID不能为空且必须是字符串');
    }
    
    if (!strategy.name || typeof strategy.name !== 'string') {
      errors.push('策略名称不能为空且必须是字符串');
    }

    if (typeof strategy.enabled !== 'boolean') {
      errors.push('enabled字段必须是布尔值');
    }

    // 条件验证
    if (!strategy.conditions) {
      errors.push('策略条件不能为空');
    } else {
      if (!Array.isArray(strategy.conditions.states) || strategy.conditions.states.length === 0) {
        errors.push('states字段必须是非空数组');
      }
      
      if (!Array.isArray(strategy.conditions.emotions) || strategy.conditions.emotions.length === 0) {
        errors.push('emotions字段必须是非空数组');
      }
    }

    // 动作验证
    if (!Array.isArray(strategy.actions) || strategy.actions.length === 0) {
      errors.push('actions字段必须是非空数组');
    } else {
      strategy.actions.forEach((action: any, index: number) => {
        if (!action.id || !action.type) {
          errors.push(`动作 ${index}: id和type字段不能为空`);
        }
      });
    }

    // 元数据验证
    if (!strategy.metadata) {
      warnings.push('缺少元数据信息');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      strategy: errors.length === 0 ? strategy : undefined
    };
  }

  /**
   * 创建快照
   */
  async createSnapshot(description?: string): Promise<StrategySnapshot> {
    const timestamp = new Date().toISOString();
    const snapshotId = `snapshot_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const snapshotFile = path.join(this.snapshotsPath, `${snapshotId}.json`);
    
    const dbSchema = await this.loadDatabase();
    const content = JSON.stringify(dbSchema, null, 2);
    const checksum = crypto.createHash('md5').update(content).digest('hex');
    
    await fs.writeFile(snapshotFile, content, 'utf8');
    
    const snapshot: StrategySnapshot = {
      id: snapshotId,
      timestamp,
      description: description || `快照 ${timestamp}`,
      strategiesCount: dbSchema.strategies.length,
      checksum,
      filePath: snapshotFile
    };
    
    console.log(`📸 创建策略快照: ${snapshot.id}`);
    return snapshot;
  }

  /**
   * 从快照恢复
   */
  async restoreFromSnapshot(snapshotId: string): Promise<boolean> {
    try {
      const snapshotFile = path.join(this.snapshotsPath, `${snapshotId}.json`);
      const exists = await this.fileExists(snapshotFile);
      
      if (!exists) {
        throw new Error(`快照文件不存在: ${snapshotId}`);
      }
      
      const content = await fs.readFile(snapshotFile, 'utf8');
      const dbSchema: BehaviorDBSchema = JSON.parse(content);
      
      // 创建当前状态备份
      await this.createBackup();
      
      // 恢复快照
      await this.saveDatabase(dbSchema);
      await this.loadStrategies();
      
      console.log(`🔄 从快照恢复策略: ${snapshotId}`);
      return true;
    } catch (error) {
      console.error('❌ 快照恢复失败:', error);
      return false;
    }
  }

  /**
   * 记录策略执行统计
   */
  recordExecution(strategyId: string, executionTime: number, success: boolean, error?: string): void {
    let stats = this.executionStats.get(strategyId);
    
    if (!stats) {
      stats = {
        strategyId,
        executionCount: 0,
        lastExecuted: '',
        averageExecutionTime: 0,
        successRate: 1.0,
        errorCount: 0
      };
      this.executionStats.set(strategyId, stats);
    }
    
    stats.executionCount++;
    stats.lastExecuted = new Date().toISOString();
    
    // 更新平均执行时间
    stats.averageExecutionTime = (stats.averageExecutionTime * (stats.executionCount - 1) + executionTime) / stats.executionCount;
    
    if (success) {
      stats.successRate = (stats.successRate * (stats.executionCount - 1) + 1) / stats.executionCount;
    } else {
      stats.errorCount++;
      stats.successRate = (stats.successRate * (stats.executionCount - 1)) / stats.executionCount;
      stats.lastError = error;
    }
  }

  /**
   * 获取策略执行统计
   */
  getExecutionStats(strategyId?: string): StrategyExecutionStats[] {
    if (strategyId) {
      const stats = this.executionStats.get(strategyId);
      return stats ? [stats] : [];
    }
    
    return Array.from(this.executionStats.values());
  }

  /**
   * 启动热加载监听
   */
  private async startHotReload(): Promise<void> {
    if (typeof window !== 'undefined') {
      // 浏览器环境，跳过文件监听
      return;
    }

    try {
      const chokidar = require('chokidar');
      
      this.fileWatcher = chokidar.watch(this.hotReloadConfig.watchPaths, {
        persistent: true,
        ignoreInitial: true
      });

      let debounceTimer: NodeJS.Timeout;
      
      this.fileWatcher.on('change', (filePath: string) => {
        console.log(`📁 文件变化检测: ${filePath}`);
        
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(async () => {
          try {
            await this.loadStrategies();
            if (this.watcherCallback) {
              this.watcherCallback(this.cachedStrategies);
            }
            console.log('🔄 策略热加载完成');
          } catch (error) {
            console.error('❌ 热加载失败:', error);
          }
        }, this.hotReloadConfig.debounceMs);
      });

      console.log('👁️ 策略文件热加载监听已启动');
    } catch (error) {
      console.warn('⚠️ 热加载启动失败，可能在不支持的环境中:', (error as Error).message);
    }
  }

  /**
   * 设置策略变化监听器
   */
  onStrategiesChanged(callback: (strategies: StrategyRecord[]) => void): void {
    this.watcherCallback = callback;
  }

  /**
   * 私有方法：确保目录存在
   */
  private async ensureDirectories(): Promise<void> {
    const dirs = [
      path.dirname(this.dbPath),
      this.backupPath,
      this.snapshotsPath
    ];

    for (const dir of dirs) {
      try {
        await fs.access(dir);
      } catch {
        await fs.mkdir(dir, { recursive: true });
        console.log(`📁 创建目录: ${dir}`);
      }
    }
  }

  /**
   * 私有方法：创建默认数据库
   */
  private async createDefaultDatabase(): Promise<void> {
    const defaultDB: BehaviorDBSchema = {
      version: BEHAVIOR_DB_VERSION,
      lastUpdated: new Date().toISOString(),
      strategies: [],
      metadata: {
        totalStrategies: 0,
        enabledStrategies: 0,
        schemaVersion: '1.0.0',
        supportedStates: Object.values(PetState),
        supportedEmotions: Object.values(EmotionType)
      }
    };

    await this.saveDatabase(defaultDB);
  }

  /**
   * 私有方法：加载数据库
   */
  private async loadDatabase(): Promise<BehaviorDBSchema> {
    const content = await fs.readFile(this.dbPath, 'utf8');
    return JSON.parse(content);
  }

  /**
   * 私有方法：保存数据库
   */
  private async saveDatabase(dbSchema: BehaviorDBSchema): Promise<void> {
    const content = JSON.stringify(dbSchema, null, 2);
    await fs.writeFile(this.dbPath, content, 'utf8');
  }

  /**
   * 私有方法：创建备份
   */
  private async createBackup(): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(this.backupPath, `backup_${timestamp}.json`);
    
    const exists = await this.fileExists(this.dbPath);
    if (exists) {
      const content = await fs.readFile(this.dbPath, 'utf8');
      await fs.writeFile(backupFile, content, 'utf8');
      console.log(`💾 创建备份: ${backupFile}`);
    }
    
    return backupFile;
  }

  /**
   * 私有方法：检查文件是否存在
   */
  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 销毁BehaviorDB实例
   */
  async destroy(): Promise<void> {
    if (this.fileWatcher) {
      await this.fileWatcher.close();
      console.log('🔇 文件监听器已关闭');
    }
    
    this.cachedStrategies = [];
    this.executionStats.clear();
    console.log('🗑️ BehaviorDB已销毁');
  }
}

// 默认导出BehaviorDB类
export default BehaviorDB;
