/**
 * 行为节奏类型定义和实现
 * Behavior Rhythm Type Definitions and Implementation
 */

// 节奏模式类型
export type RhythmMode = 'steady' | 'pulse' | 'sequence' | 'adaptive' | 'sync';

// 节拍强度类型
export type RhythmIntensity = 'low' | 'medium' | 'high' | 'burst';

// 节拍回调函数签名
export type RhythmTickCallback = (timestamp: number, interval: number) => void;

// 节奏状态监听器
export type RhythmStateListener = (mode: RhythmMode, config: RhythmConfig) => void;

// 节奏配置参数
export interface RhythmConfig {
  mode: RhythmMode;
  baseInterval: number;        // 基础间隔（毫秒）
  intensity: RhythmIntensity;  // 节拍强度
  variation: number;           // 变化幅度 (0-1)
  syncSource?: string;         // 同步源标识
  sequence?: number[];         // 序列模式的节拍数组
}

// 节奏状态信息
export interface RhythmState {
  isActive: boolean;
  currentMode: RhythmMode;
  currentInterval: number;
  lastTickTime: number;
  config: RhythmConfig;
}

// 行为节奏检测器结果
export interface RhythmDetectionResult {
  detected: boolean;
  confidence: number;          // 0-1 置信度
  suggestedMode: RhythmMode;
  suggestedIntensity: RhythmIntensity;
}

// 节奏管理器事件类型
export type RhythmManagerEvent = 
  | 'rhythm_started'
  | 'rhythm_stopped' 
  | 'rhythm_mode_changed'
  | 'rhythm_tick'
  | 'rhythm_sync_detected';

// 节奏管理器事件数据
export interface RhythmManagerEventData {
  event: RhythmManagerEvent;
  timestamp: number;
  data?: any;
}

// 同步节拍配置
export interface RhythmSyncConfig {
  sourceId: string;           // 同步源ID
  tolerance: number;          // 同步容差（毫秒）
  autoDetect: boolean;        // 是否自动检测
  threshold: number;          // 检测阈值 (0-1)
}

// 序列节拍配置
export interface RhythmSequenceConfig {
  pattern: number[];          // 节拍时间序列
  loop: boolean;              // 是否循环
  fadeIn?: number;            // 淡入时间
  fadeOut?: number;           // 淡出时间
}

// 提供常量的实际实现
export const RhythmMode = {
  STEADY: 'steady' as const,
  PULSE: 'pulse' as const,
  SEQUENCE: 'sequence' as const,
  ADAPTIVE: 'adaptive' as const,
  SYNC: 'sync' as const
} as const;

export const RhythmIntensity = {
  LOW: 'low' as const,
  MEDIUM: 'medium' as const,
  HIGH: 'high' as const,
  BURST: 'burst' as const
} as const;
