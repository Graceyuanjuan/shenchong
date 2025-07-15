/**
 * 行为记忆集成器
 * 提供高级的行为记忆管理和集成功能
 */

import { BehaviorRecord, BehaviorRecordFilter, BehaviorMemoryConfig } from './types';
import { BehaviorMemory } from './BehaviorMemory';
import { BehaviorMemoryAnalyzer, AnalysisReport } from './BehaviorMemoryAnalyzer';

export class BehaviorMemoryIntegrator {
  private memory: BehaviorMemory;
  private analyzer: BehaviorMemoryAnalyzer;
  private cleanupTimer?: any; // Using any instead of NodeJS.Timeout for broader compatibility

  constructor(config?: Partial<BehaviorMemoryConfig>) {
    this.memory = BehaviorMemory.getInstance(config);
    this.analyzer = new BehaviorMemoryAnalyzer(this.memory);
  }

  /**
   * 初始化集成器
   */
  async initialize(): Promise<void> {
    // 启动定期清理
    this.startCleanupTimer();
    
    // 可以在这里添加其他初始化逻辑
    console.log('BehaviorMemoryIntegrator initialized');
  }

  /**
   * 记录行为
   */
  recordBehavior(
    behaviorName: string,
    action: string,
    emotion: string,
    pluginName: string,
    context: Record<string, any> = {},
    outcome: 'success' | 'failure' | 'partial' = 'success',
    metadata?: Record<string, any>
  ): string {
    return this.memory.addRecord({
      behaviorName,
      action,
      emotion,
      pluginName,
      context,
      outcome,
      metadata
    });
  }

  /**
   * 获取历史上下文
   */
  getHistoryContext(
    action: string,
    emotion: string,
    maxRecords: number = 10
  ): BehaviorRecord[] {
    return this.memory.search({
      action,
      emotion
    }).slice(0, maxRecords);
  }

  /**
   * 搜索行为记录
   */
  searchRecords(filter: BehaviorRecordFilter): BehaviorRecord[] {
    return this.memory.search(filter);
  }

  /**
   * 获取特定行为的成功率
   */
  getBehaviorSuccessRate(behaviorName: string): number {
    const records = this.memory.search({ behaviorName });
    if (records.length === 0) return 0;
    
    const successCount = records.filter(r => r.outcome === 'success').length;
    return successCount / records.length;
  }

  /**
   * 获取情绪相关的行为统计
   */
  getEmotionBehaviorStats(emotion: string): {
    totalRecords: number;
    behaviors: Record<string, number>;
    successRate: number;
  } {
    const records = this.memory.search({ emotion });
    const behaviors: Record<string, number> = {};
    
    for (const record of records) {
      behaviors[record.behaviorName] = (behaviors[record.behaviorName] || 0) + 1;
    }
    
    const successCount = records.filter(r => r.outcome === 'success').length;
    const successRate = records.length > 0 ? successCount / records.length : 0;
    
    return {
      totalRecords: records.length,
      behaviors,
      successRate
    };
  }

  /**
   * 生成调试报告
   */
  generateDebugReport(): AnalysisReport {
    return this.analyzer.generateReport();
  }

  /**
   * 清理记忆
   */
  cleanup(): void {
    this.memory.cleanup();
  }

  /**
   * 获取记忆统计
   */
  getMemoryStats(): {
    totalRecords: number;
    uniqueBehaviors: number;
    uniqueEmotions: number;
    timespan: { start: number; end: number } | null;
  } {
    const allRecords = this.memory.getAllRecords();
    
    if (allRecords.length === 0) {
      return {
        totalRecords: 0,
        uniqueBehaviors: 0,
        uniqueEmotions: 0,
        timespan: null
      };
    }

    const behaviors = new Set(allRecords.map(r => r.behaviorName));
    const emotions = new Set(allRecords.map(r => r.emotion));
    const timestamps = allRecords.map(r => r.timestamp);
    
    return {
      totalRecords: allRecords.length,
      uniqueBehaviors: behaviors.size,
      uniqueEmotions: emotions.size,
      timespan: {
        start: Math.min(...timestamps),
        end: Math.max(...timestamps)
      }
    };
  }

  /**
   * 导出记忆数据
   */
  exportMemoryData(): BehaviorRecord[] {
    return this.memory.getAllRecords();
  }

  /**
   * 导入记忆数据
   */
  importMemoryData(records: BehaviorRecord[]): void {
    for (const record of records) {
      this.memory.addRecord({
        behaviorName: record.behaviorName,
        action: record.action,
        emotion: record.emotion,
        pluginName: record.pluginName,
        context: record.context,
        outcome: record.outcome,
        metadata: record.metadata,
        tags: record.tags
      });
    }
  }

  /**
   * 销毁集成器
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
  }

  private startCleanupTimer(): void {
    // 定期清理，默认每5分钟
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }
}