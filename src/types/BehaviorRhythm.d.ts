/**
 * 行为节奏类型定义
 * Behavior Rhythm Type Definitions
 */

// 节奏模式类型
export type RhythmMode = 'steady' | 'pulse' | 'sequence' | 'adaptive' | 'sync';

// 节奏模式常量
export declare const RhythmMode: {
  readonly STEADY: 'steady';       // 稳定节拍 - 固定间隔
  readonly PULSE: 'pulse';         // 脉冲节拍 - 心跳式变化
  readonly SEQUENCE: 'sequence';   // 序列节拍 - 预设节拍序列
  readonly ADAPTIVE: 'adaptive';   // 自适应节拍 - 根据情绪调整
  readonly SYNC: 'sync';          // 同步节拍 - 与外部事件同步
};

// 节拍强度类型
export type RhythmIntensity = 'low' | 'medium' | 'high' | 'burst';

// 节拍强度常量
export declare const RhythmIntensity: {
  readonly LOW: 'low';           // 低强度：300-500ms
  readonly MEDIUM: 'medium';     // 中强度：200-300ms  
  readonly HIGH: 'high';         // 高强度：100-200ms
  readonly BURST: 'burst';        // 爆发：50-100ms
};

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
  tickCount: number;
  config: RhythmConfig;
}

// 默认节奏配置
export interface DefaultRhythmSettings {
  [key: string]: RhythmConfig;
}

// 节奏管理器接口
export interface IRhythmManager {
  // 核心方法
  setRhythmMode(mode: RhythmMode, config?: Partial<RhythmConfig>): void;
  tick(callback: RhythmTickCallback): void;
  start(): void;
  stop(): void;
  pause(): void;
  resume(): void;
  
  // 状态查询
  getCurrentState(): RhythmState;
  isActive(): boolean;
  getCurrentMode(): RhythmMode;
  
  // 事件监听
  onRhythmChange(listener: RhythmStateListener): void;
  offRhythmChange(listener: RhythmStateListener): void;
  
  // 高级功能
  syncWithExternal(source: string, interval: number): void;
  adaptToEmotion(emotionIntensity: number): void;
}
