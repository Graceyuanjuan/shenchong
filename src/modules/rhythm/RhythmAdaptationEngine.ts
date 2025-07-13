/**
 * T5-C v1.1 | RhythmAdaptationEngine - 节奏动态适配引擎
 * 根据用户交互频率、当前情绪和状态等上下文信息，自动调整节奏模式
 */

import { PetState, EmotionType } from '../../types';
import { RhythmMode } from '../../types/BehaviorRhythm';

/**
 * 节奏适配引擎接口
 */
export interface RhythmAdaptationEngine {
  updateRhythmByContext(state: PetState, emotion: EmotionType, timestamp: number, isInteraction?: boolean): void;
  getCurrentRhythm(): RhythmMode;
}

/**
 * 交互统计信息
 */
interface InteractionStats {
  recentInteractionRate: number;  // 最近1分钟的交互次数/分钟
  idleTime: number;               // 连续空闲时间（秒）
  lastInteractionTime: number;    // 最后交互时间戳
}

/**
 * 节奏适配配置
 */
interface AdaptationConfig {
  // 交互频率阈值
  highFrequencyThreshold: number;   // 高频交互阈值（次/分钟）
  lowFrequencyThreshold: number;    // 低频交互阈值（次/分钟）
  
  // 时间阈值
  idleTimeThreshold: number;        // 空闲时间阈值（秒）
  adaptiveTimeThreshold: number;    // 自适应模式时间阈值（秒）
  
  // 情绪历史分析
  emotionHistoryWindow: number;     // 情绪历史窗口大小
  
  // 节拍配置
  rhythmModeConfig: {
    [key in RhythmMode]: {
      priority: number;
      conditions: string[];
    }
  };
}

/**
 * 默认适配配置
 */
const DEFAULT_CONFIG: AdaptationConfig = {
  highFrequencyThreshold: 3,       // 每分钟3次以上为高频
  lowFrequencyThreshold: 1,        // 每分钟1次以下为低频
  idleTimeThreshold: 15,           // 15秒空闲阈值
  adaptiveTimeThreshold: 30,       // 30秒进入自适应模式
  emotionHistoryWindow: 10,        // 保留最近10个情绪状态
  
  rhythmModeConfig: {
    pulse: {
      priority: 4,
      conditions: ['excited_high_frequency', 'burst_interaction']
    },
    sequence: {
      priority: 3,
      conditions: ['calm_idle', 'sleepy_long_idle']
    },
    adaptive: {
      priority: 2,
      conditions: ['focused_moderate', 'curious_stable']
    },
    steady: {
      priority: 1,
      conditions: ['default_fallback']
    },
    sync: {
      priority: 5,
      conditions: ['special_sync_mode']
    }
  }
};

/**
 * 节奏动态适配引擎实现
 */
export class RhythmAdaptationEngineImpl implements RhythmAdaptationEngine {
  // 内部状态变量
  private emotionHistory: EmotionType[] = [];
  private interactionTimestamps: number[] = [];
  private currentRhythm: RhythmMode = 'steady';
  
  // 配置和统计
  private config: AdaptationConfig;
  private lastUpdateTime: number = 0;
  
  constructor(config?: Partial<AdaptationConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    console.log('🎵 [RhythmAdaptationEngine] 节奏适配引擎初始化完成');
  }

  /**
   * 根据上下文更新节奏模式
   */
  /**
   * 根据上下文信息更新节奏模式
   * @param state 宠物状态
   * @param emotion 情绪类型
   * @param timestamp 时间戳
   * @param isInteraction 是否为实际用户交互（默认true，设为false时仅用于状态检查）
   */
  public updateRhythmByContext(state: PetState, emotion: EmotionType, timestamp: number, isInteraction: boolean = true): void {
    // 先计算交互统计（基于当前历史，在更新之前）
    const stats = this.calculateInteractionStats(timestamp);
    
    // 确定新的节奏模式
    const newRhythm = this.determineRhythmMode(state, emotion, stats, timestamp);
    
    // 只有在实际交互时才更新交互历史
    if (isInteraction) {
      this.updateInteractionHistory(timestamp);
    }
    
    // 总是更新情绪历史
    this.updateEmotionHistory(emotion);
    
    // 更新当前节奏
    if (newRhythm !== this.currentRhythm) {
      console.log(`🎵 [RhythmAdaptationEngine] 节奏切换: ${this.currentRhythm} → ${newRhythm}`);
      this.currentRhythm = newRhythm;
    }
    
    this.lastUpdateTime = timestamp;
  }

  /**
   * 获取当前节奏模式
   */
  public getCurrentRhythm(): RhythmMode {
    return this.currentRhythm;
  }

  /**
   * 更新交互历史记录
   */
  private updateInteractionHistory(timestamp: number): void {
    this.interactionTimestamps.push(timestamp);
    
    // 保留最近2分钟的交互记录
    const twoMinutesAgo = timestamp - 2 * 60 * 1000;
    this.interactionTimestamps = this.interactionTimestamps.filter(
      time => time > twoMinutesAgo
    );
  }

  /**
   * 更新情绪历史记录
   */
  private updateEmotionHistory(emotion: EmotionType): void {
    this.emotionHistory.push(emotion);
    
    // 保持固定窗口大小
    if (this.emotionHistory.length > this.config.emotionHistoryWindow) {
      this.emotionHistory.shift();
    }
  }

  /**
   * 计算交互统计信息
   */
  private calculateInteractionStats(currentTime: number): InteractionStats {
    const oneMinuteAgo = currentTime - 60 * 1000;
    const recentInteractions = this.interactionTimestamps.filter(
      time => time > oneMinuteAgo
    );
    
    const lastInteractionTime = this.interactionTimestamps.length > 0 
      ? this.interactionTimestamps[this.interactionTimestamps.length - 1]
      : currentTime - 60 * 1000;
    
    const idleTime = (currentTime - lastInteractionTime) / 1000;
    
    // 简化交互率计算：直接使用最近1分钟内的交互次数
    const recentInteractionRate = recentInteractions.length;
    
    return {
      recentInteractionRate, // 最近1分钟内的交互次数
      idleTime,
      lastInteractionTime
    };
  }

  /**
   * 根据规则确定节奏模式
   */
  private determineRhythmMode(
    state: PetState, 
    emotion: EmotionType, 
    stats: InteractionStats,
    timestamp: number
  ): RhythmMode {
    // 策略规则实现（优先级从高到低）
    
    // 1. 爆发式交互（短时间内大量交互）→ pulse 模式（最高优先级）
    if (stats.recentInteractionRate >= this.config.highFrequencyThreshold * 2) {
      return 'pulse';
    }
    
    // 2. 高频交互 + 兴奋情绪 → pulse 模式
    if (emotion === EmotionType.Excited && stats.recentInteractionRate >= this.config.highFrequencyThreshold) {
      return 'pulse';
    }
    
    // 3. 专注情绪 → adaptive 模式（优先级高于其他条件）
    if (emotion === EmotionType.Focused) {
      return 'adaptive';
    }
    
    // 4. 好奇情绪 + 适度交互 → adaptive 模式
    if (emotion === EmotionType.Curious && 
        stats.recentInteractionRate >= this.config.lowFrequencyThreshold &&
        stats.recentInteractionRate <= this.config.highFrequencyThreshold) {
      return 'adaptive';
    }
    
    // 5. 快乐情绪 + 中等交互频率 → adaptive 模式
    if (emotion === EmotionType.Happy && 
        stats.recentInteractionRate >= this.config.lowFrequencyThreshold) {
      return 'adaptive';
    }
    
    // 6. 困倦情绪 + 有交互历史 + 短时间空闲 → sequence 模式（特殊情况）
    if (emotion === EmotionType.Sleepy && 
        this.interactionTimestamps.length > 0 && 
        stats.idleTime > this.config.idleTimeThreshold / 2) {
      return 'sequence';
    }
    
    // 7. 困倦情绪（其他情况）→ steady 模式（安抚情绪）
    if (emotion === EmotionType.Sleepy) {
      return 'steady';
    }
    
    // 8. 平静情绪 + 长时间空闲 → sequence 模式
    if (emotion === EmotionType.Calm && stats.idleTime > this.config.idleTimeThreshold) {
      return 'sequence';
    }
    
    // 9. 默认回退到 steady 模式
    return 'steady';
  }

  /**
   * 获取当前统计信息（用于调试）
   */
  public getStats(): { emotion: EmotionType[], interactions: number, currentRhythm: RhythmMode } {
    return {
      emotion: [...this.emotionHistory],
      interactions: this.interactionTimestamps.length,
      currentRhythm: this.currentRhythm
    };
  }

  /**
   * 重置引擎状态
   */
  public reset(): void {
    this.emotionHistory = [];
    this.interactionTimestamps = [];
    this.currentRhythm = 'steady';
    this.lastUpdateTime = 0;
  }

  /**
   * 销毁引擎
   */
  public destroy(): void {
    this.reset();
  }
}

/**
 * 创建节奏适配引擎实例
 */
export function createRhythmAdaptationEngine(config?: Partial<AdaptationConfig>): RhythmAdaptationEngine {
  return new RhythmAdaptationEngineImpl(config);
}

/**
 * 默认配置导出
 */
export { DEFAULT_CONFIG as DefaultAdaptationConfig };
