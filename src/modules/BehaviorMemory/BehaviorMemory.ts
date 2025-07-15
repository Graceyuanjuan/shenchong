/**
 * 行为记忆核心类
 * 负责存储、检索和管理宠物的行为记忆数据
 */

import { BehaviorRecord, BehaviorRecordFilter, BehaviorMemoryConfig } from './types';

export class BehaviorMemory {
  private static instance: BehaviorMemory | null = null;
  private records: Map<string, BehaviorRecord> = new Map();
  private config: BehaviorMemoryConfig;

  constructor(config: Partial<BehaviorMemoryConfig> = {}) {
    this.config = {
      maxRecords: 1000,
      enablePersistence: true,
      storageKey: 'behavior_memory_records',
      cleanupInterval: 5 * 60 * 1000,
      ...config
    };
  }

  static getInstance(config?: Partial<BehaviorMemoryConfig>): BehaviorMemory {
    if (!BehaviorMemory.instance) {
      BehaviorMemory.instance = new BehaviorMemory(config);
    }
    return BehaviorMemory.instance;
  }

  /**
   * 添加行为记录
   */
  addRecord(record: Omit<BehaviorRecord, 'id' | 'timestamp'>): string {
    const id = this.generateId();
    const behaviorRecord: BehaviorRecord = {
      id,
      timestamp: Date.now(),
      ...record
    };

    this.records.set(id, behaviorRecord);
    this.maintainMemorySize();
    this.saveToPersistence();
    return id;
  }

  /**
   * 获取记录
   */
  getRecord(id: string): BehaviorRecord | undefined {
    return this.records.get(id);
  }

  /**
   * 搜索记录
   */
  search(criteria: BehaviorRecordFilter): BehaviorRecord[] {
    const results: BehaviorRecord[] = [];
    
    for (const record of Array.from(this.records.values())) {
      if (this.matchesCriteria(record, criteria)) {
        results.push(record);
      }
    }

    return results.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * 获取所有记录
   */
  getAllRecords(): BehaviorRecord[] {
    return Array.from(this.records.values())
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * 清理过期记录
   */
  cleanup(): void {
    if (this.records.size > this.config.maxRecords) {
      const recordsToRemove = this.records.size - this.config.maxRecords;
      const sortedRecords = Array.from(this.records.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp);
      
      for (let i = 0; i < recordsToRemove; i++) {
        this.records.delete(sortedRecords[i][0]);
      }
    }
    
    this.saveToPersistence();
  }

  /**
   * 持久化存储
   */
  private saveToPersistence(): void {
    if (this.config.enablePersistence && typeof localStorage !== 'undefined') {
      try {
        const data = Array.from(this.records.entries());
        localStorage.setItem(this.config.storageKey, JSON.stringify(data));
      } catch (error) {
        console.warn('Failed to save behavior memory to persistence:', error);
      }
    }
  }

  /**
   * 从持久化存储加载
   */
  private loadFromPersistence(): void {
    if (this.config.enablePersistence && typeof localStorage !== 'undefined') {
      try {
        const data = localStorage.getItem(this.config.storageKey);
        if (data) {
          const records = JSON.parse(data) as [string, BehaviorRecord][];
          this.records = new Map(records);
        }
      } catch (error) {
        console.warn('Failed to load behavior memory from persistence:', error);
      }
    }
  }

  private generateId(): string {
    return `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private matchesCriteria(record: BehaviorRecord, criteria: BehaviorRecordFilter): boolean {
    if (criteria.behaviorName && record.behaviorName !== criteria.behaviorName) {
      return false;
    }
    
    if (criteria.action && record.action !== criteria.action) {
      return false;
    }
    
    if (criteria.emotion && record.emotion !== criteria.emotion) {
      return false;
    }
    
    if (criteria.pluginName && record.pluginName !== criteria.pluginName) {
      return false;
    }
    
    if (criteria.timeRange) {
      if (record.timestamp < criteria.timeRange.start || record.timestamp > criteria.timeRange.end) {
        return false;
      }
    }
    
    if (criteria.tags && criteria.tags.length > 0) {
      const hasMatchingTag = criteria.tags.some(tag => record.tags?.includes(tag));
      if (!hasMatchingTag) {
        return false;
      }
    }
    
    if (criteria.outcome && record.outcome !== criteria.outcome) {
      return false;
    }
    
    return true;
  }

  private maintainMemorySize(): void {
    if (this.records.size > this.config.maxRecords) {
      this.cleanup();
    }
  }
}
