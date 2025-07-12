/**
 * T5-A-1 | 策略Schema定义
 * BehaviorDB策略结构类型定义与验证
 */

import { PetState, EmotionType } from '../types';

// 策略行为动作定义
export interface StrategyAction {
  id: string;                    // 动作唯一标识
  type: string;                  // 动作类型 (play_gesture, show_tooltip, plugin_trigger, etc.)
  name: string;                  // 动作显示名称
  delay?: number;                // 延迟执行时间(ms)
  duration?: number;             // 持续时间(ms)
  priority?: number;             // 优先级 (1-10, 数字越大优先级越高)
  params?: Record<string, any>;  // 动作参数
  conditions?: {                 // 执行条件
    timeRange?: [number, number]; // 时间范围 [start, end] (小时)
    userActivity?: string;        // 用户活动状态
    systemState?: string;         // 系统状态要求
  };
}

// 策略触发条件
export interface StrategyConditions {
  states: PetState[];           // 匹配的状态列表
  emotions: EmotionType[];      // 匹配的情绪列表
  priority?: number;            // 策略优先级
  weight?: number;              // 策略权重 (0-1)
  cooldown?: number;            // 冷却时间(ms)
  maxExecutions?: number;       // 最大执行次数
  timeConstraints?: {           // 时间约束
    startTime?: string;         // 开始时间 "HH:mm"
    endTime?: string;           // 结束时间 "HH:mm"
    weekdays?: number[];        // 工作日限制 [1-7]
  };
}

// 策略元数据
export interface StrategyMetadata {
  version: string;              // 策略版本号
  author?: string;              // 策略作者
  description?: string;         // 策略描述
  tags?: string[];              // 策略标签
  createdAt: string;            // 创建时间 ISO string
  updatedAt: string;            // 更新时间 ISO string
  deprecated?: boolean;         // 是否已废弃
  dependencies?: string[];      // 依赖的其他策略ID
}

// 完整策略记录定义
export interface StrategyRecord {
  id: string;                   // 策略唯一标识
  name: string;                 // 策略显示名称
  description?: string;         // 策略描述
  enabled: boolean;             // 是否启用
  conditions: StrategyConditions; // 触发条件
  actions: StrategyAction[];    // 执行动作列表
  metadata: StrategyMetadata;   // 策略元数据
}

// 策略数据库结构
export interface BehaviorDBSchema {
  version: string;              // 数据库版本
  lastUpdated: string;          // 最后更新时间
  strategies: StrategyRecord[]; // 策略记录列表
  metadata: {
    totalStrategies: number;
    enabledStrategies: number;
    schemaVersion: string;
    supportedStates: PetState[];
    supportedEmotions: EmotionType[];
  };
}

// 策略验证结果
export interface StrategyValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  strategy?: StrategyRecord;
}

// 策略导入/导出选项
export interface StrategyIOOptions {
  format: 'json' | 'yaml' | 'js';
  compression?: boolean;
  encryption?: boolean;
  backup?: boolean;
  merge?: boolean;              // 是否与现有策略合并
}

// 策略快照信息
export interface StrategySnapshot {
  id: string;
  timestamp: string;
  description?: string;
  strategiesCount: number;
  checksum: string;             // 内容校验和
  filePath: string;             // 快照文件路径
}

// 策略热加载配置
export interface HotReloadConfig {
  enabled: boolean;
  watchPaths: string[];         // 监听的文件路径
  debounceMs: number;           // 防抖延迟
  backupBeforeReload: boolean;  // 重载前是否备份
  validateBeforeReload: boolean; // 重载前是否验证
}

// 预定义策略类型
export enum StrategyType {
  STATE_DRIVEN = 'state_driven',     // 状态驱动策略
  EMOTION_DRIVEN = 'emotion_driven', // 情绪驱动策略
  TIME_BASED = 'time_based',         // 时间基础策略
  EVENT_TRIGGERED = 'event_triggered', // 事件触发策略
  USER_INTERACTIVE = 'user_interactive', // 用户交互策略
  SYSTEM_AUTOMATIC = 'system_automatic'  // 系统自动策略
}

// 策略执行统计
export interface StrategyExecutionStats {
  strategyId: string;
  executionCount: number;
  lastExecuted: string;
  averageExecutionTime: number;
  successRate: number;
  errorCount: number;
  lastError?: string;
}

// 类型已通过interface导出，无需重复导出

// 导出常量
export const BEHAVIOR_DB_VERSION = '1.0.0';
export const STRATEGY_SCHEMA_VERSION = '1.0.0';

// 默认策略条件
export const DEFAULT_STRATEGY_CONDITIONS: Partial<StrategyConditions> = {
  priority: 5,
  weight: 1.0,
  cooldown: 1000,
  maxExecutions: -1  // -1 表示无限制
};

// 默认策略元数据
export const createDefaultMetadata = (): StrategyMetadata => ({
  version: '1.0.0',
  author: 'SaintGrid System',
  description: '',
  tags: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  deprecated: false,
  dependencies: []
});
