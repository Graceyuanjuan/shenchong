/**
 * T5-C | RhythmContext - 节奏上下文类型定义
 * 用于节奏动态适配的上下文信息
 */

import { EmotionType, PetState } from '../index';

// 时间段枚举
export enum TimeOfDay {
  Morning = 'morning',      // 6:00-12:00
  Afternoon = 'afternoon',  // 12:00-18:00
  Evening = 'evening',      // 18:00-22:00
  Night = 'night'          // 22:00-6:00
}

// 用户交互统计
export interface UserInteractionStats {
  totalInteractions: number;
  averageInterval: number;     // 平均交互间隔 (ms)
  recentFrequency: number;     // 最近5分钟交互频率 (次/分钟)
  continuousIdleTime: number;  // 连续空闲时间 (ms)
  lastInteractionTime: number; // 最后交互时间戳
  interactionPattern: 'burst' | 'steady' | 'sparse' | 'idle'; // 交互模式
}

// 用户活跃度等级
export enum UserActivityLevel {
  Inactive = 'inactive',     // 非活跃 - 长时间无操作
  Low = 'low',              // 低活跃 - 偶尔交互
  Medium = 'medium',        // 中等活跃 - 正常使用
  High = 'high',            // 高活跃 - 频繁交互
  Burst = 'burst'           // 爆发式 - 短时间大量交互
}

// 节奏上下文接口
export interface RhythmContext {
  // 情绪信息
  currentEmotion: EmotionType;
  emotionIntensity: number;
  emotionDuration: number;    // 当前情绪持续时间 (ms)
  
  // 状态信息
  currentState: PetState;
  stateDuration: number;      // 当前状态持续时间 (ms)
  
  // 时间信息
  timeOfDay: TimeOfDay;
  timestamp: number;
  
  // 用户交互信息
  userStats: UserInteractionStats;
  activityLevel: UserActivityLevel;
  
  // 环境信息
  environmentContext?: {
    isWorkTime?: boolean;
    isQuietMode?: boolean;
    systemLoad?: number;       // 系统负载 0-1
    networkLatency?: number;   // 网络延迟 (ms)
  };
  
  // 自定义元数据
  metadata?: Record<string, any>;
}

// 节奏适配策略类型
export enum RhythmAdaptationStrategy {
  EmotionDriven = 'emotion_driven',       // 情绪驱动
  InteractionDriven = 'interaction_driven', // 交互驱动
  TimeDriven = 'time_driven',             // 时间驱动
  HybridDriven = 'hybrid_driven',         // 混合驱动
  SystemDriven = 'system_driven'          // 系统驱动
}

// 节奏适配决策结果
export interface RhythmAdaptationDecision {
  targetMode: 'steady' | 'pulse' | 'adaptive';  // 目标节奏模式
  targetBPM?: number;                            // 目标BPM
  intensity?: number;                            // 强度调整 0-1
  duration?: number;                             // 持续时间 (ms)
  transitionType: 'immediate' | 'smooth' | 'gradual'; // 过渡方式
  reason: string;                                // 决策原因
  confidence: number;                            // 决策置信度 0-1
  metadata?: Record<string, any>;
}

// 节奏感知规则接口
export interface RhythmAwarenessRule {
  id: string;
  name: string;
  priority: number;                              // 优先级 1-10
  strategy: RhythmAdaptationStrategy;
  condition: (context: RhythmContext) => boolean;
  action: (context: RhythmContext) => RhythmAdaptationDecision;
  enabled: boolean;
  cooldownMs?: number;                           // 冷却时间
  lastTriggered?: number;                        // 上次触发时间
}

// 节奏适配配置
export interface RhythmAdaptationConfig {
  enabled: boolean;
  updateIntervalMs: number;                      // 检查间隔
  debounceMs: number;                           // 防抖时间
  maxAdaptationsPerMinute: number;              // 每分钟最大适配次数
  enableLogging: boolean;
  strategies: RhythmAdaptationStrategy[];       // 启用的策略
  rules: RhythmAwarenessRule[];                // 感知规则
}

// 节奏适配历史记录
export interface RhythmAdaptationHistory {
  timestamp: number;
  fromMode: string;
  toMode: string;
  decision: RhythmAdaptationDecision;
  context: Partial<RhythmContext>;
  success: boolean;
  actualDuration?: number;
}

// 辅助函数：获取当前时间段
export function getCurrentTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  
  if (hour >= 6 && hour < 12) {
    return TimeOfDay.Morning;
  } else if (hour >= 12 && hour < 18) {
    return TimeOfDay.Afternoon;
  } else if (hour >= 18 && hour < 22) {
    return TimeOfDay.Evening;
  } else {
    return TimeOfDay.Night;
  }
}

// 辅助函数：计算用户活跃度等级
export function calculateActivityLevel(stats: UserInteractionStats): UserActivityLevel {
  const { recentFrequency, continuousIdleTime, interactionPattern } = stats;
  
  // 如果连续空闲超过10分钟，为非活跃
  if (continuousIdleTime > 10 * 60 * 1000) {
    return UserActivityLevel.Inactive;
  }
  
  // 根据交互模式和频率判断
  switch (interactionPattern) {
    case 'burst':
      return UserActivityLevel.Burst;
    case 'steady':
      return recentFrequency > 5 ? UserActivityLevel.High : UserActivityLevel.Medium;
    case 'sparse':
      return UserActivityLevel.Low;
    case 'idle':
    default:
      return UserActivityLevel.Inactive;
  }
}

// 辅助函数：分析交互模式
export function analyzeInteractionPattern(
  interactions: Array<{ timestamp: number }>,
  windowMs: number = 5 * 60 * 1000 // 5分钟窗口
): UserInteractionStats['interactionPattern'] {
  const now = Date.now();
  const recentInteractions = interactions.filter(
    i => now - i.timestamp <= windowMs
  );
  
  if (recentInteractions.length === 0) {
    return 'idle';
  }
  
  const frequency = (recentInteractions.length / windowMs) * 60 * 1000; // 每分钟次数
  
  if (frequency > 10) {
    return 'burst';
  } else if (frequency > 2) {
    return 'steady';
  } else {
    return 'sparse';
  }
}
