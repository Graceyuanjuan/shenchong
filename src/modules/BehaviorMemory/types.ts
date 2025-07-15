/**
 * BehaviorMemory模块的类型定义
 */

export interface BehaviorRecord {
  id: string;
  timestamp: number;
  behaviorName: string;
  action: string;
  emotion: string;
  pluginName: string;
  context: Record<string, any>;
  outcome: 'success' | 'failure' | 'partial';
  metadata?: Record<string, any>;
  tags?: string[];
}

export interface BehaviorRecordFilter {
  behaviorName?: string;
  action?: string;
  emotion?: string;
  pluginName?: string;
  timeRange?: {
    start: number;
    end: number;
  };
  tags?: string[];
  outcome?: 'success' | 'failure' | 'partial';
}

export interface BehaviorMemoryConfig {
  maxRecords: number;
  enablePersistence: boolean;
  storageKey: string;
  cleanupInterval: number;
}

export interface BehaviorReplayItem {
  record: BehaviorRecord;
  delay: number;
}

export interface BehaviorReplayOptions {
  speedMultiplier?: number;
  filterCriteria?: BehaviorRecordFilter;
  maxItems?: number;
}

export interface BehaviorPattern {
  id: string;
  patternType: string;
  frequency: number;
  confidence: number;
  conditions: Record<string, any>;
  outcomes: Record<string, number>;
}

export interface BehaviorMemoryState {
  totalRecords: number;
  patterns: BehaviorPattern[];
  lastCleanup: number;
  memoryUsage: number;
}

// Legacy types for backward compatibility
export interface BehaviorMemoryEntry extends BehaviorRecord {}
export interface MemorySearchCriteria extends BehaviorRecordFilter {}
export interface MemoryConfig extends BehaviorMemoryConfig {}