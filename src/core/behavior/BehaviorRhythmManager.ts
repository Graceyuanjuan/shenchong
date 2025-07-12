/**
 * T4-C: 行为节奏管理器
 * 
 * 管理行为执行的节奏和时序，支持视觉反馈的双向同步
 */

import { EmotionType, PetState } from '../../types';
import { BehaviorDefinition, BehaviorType } from '../BehaviorScheduler';
import { RhythmType, VisualCueType } from '../visual/VisualFeedbackManager';

// 行为节奏配置（特定于行为节奏管理器）
export interface BehaviorRhythmConfig {
  type: RhythmType;
  bpm: number;                      // 每分钟节拍数
  intensity: number;                // 强度 0-1
  pattern: number[];                // 节拍模式，如 [1, 0, 1, 0] 表示强弱强弱
  duration?: number;                // 持续时间 (ms)
  fadeIn?: number;                  // 淡入时间 (ms)
  fadeOut?: number;                 // 淡出时间 (ms)
}

// 行为节奏事件
export interface BehaviorRhythmEvent {
  type: 'beat' | 'pattern_change' | 'rhythm_sync' | 'feedback_triggered';
  rhythmType: RhythmType;
  beatNumber?: number;
  timestamp: number;
  metadata?: any;
}

// 节奏同步回调
export type RhythmSyncCallback = (rhythm: RhythmType, context?: any) => void;

// 行为反馈回调
export type BehaviorFeedbackCallback = (
  behaviorType: BehaviorType, 
  visualCue: VisualCueType, 
  context?: any
) => void;

/**
 * 行为节奏管理器类
 */
export class BehaviorRhythmManager {
  private currentRhythm: BehaviorRhythmConfig;
  private isActive: boolean = false;
  private beatTimer?: NodeJS.Timeout;
  private beatCount: number = 0;
  private rhythmSyncCallbacks: Set<RhythmSyncCallback> = new Set();
  private behaviorFeedbackCallbacks: Set<BehaviorFeedbackCallback> = new Set();
  private eventListeners: Map<string, Function[]> = new Map();

  // 预定义节奏配置
  private rhythmConfigs: Map<RhythmType, BehaviorRhythmConfig> = new Map([
    [RhythmType.LOW_PULSE, {
      type: RhythmType.LOW_PULSE,
      bpm: 60,
      intensity: 0.3,
      pattern: [1, 0, 0, 0],
      duration: 30000
    }],
    [RhythmType.HIGH_FREQUENCY, {
      type: RhythmType.HIGH_FREQUENCY,
      bpm: 140,
      intensity: 0.8,
      pattern: [1, 1, 1, 0],
      duration: 15000
    }],
    [RhythmType.CALM_STEADY, {
      type: RhythmType.CALM_STEADY,
      bpm: 80,
      intensity: 0.5,
      pattern: [1, 0, 1, 0],
      duration: 60000
    }],
    [RhythmType.EXCITED_BURST, {
      type: RhythmType.EXCITED_BURST,
      bpm: 160,
      intensity: 0.9,
      pattern: [1, 1, 0, 1],
      duration: 10000
    }],
    [RhythmType.ADAPTIVE, {
      type: RhythmType.ADAPTIVE,
      bpm: 100,
      intensity: 0.6,
      pattern: [1, 0, 1, 1],
      duration: 45000
    }]
  ]);

  // 行为到视觉提示的映射
  private behaviorToVisualCue: Map<BehaviorType, VisualCueType> = new Map([
    [BehaviorType.IDLE_ANIMATION, VisualCueType.IDLE_PULSE],
    [BehaviorType.HOVER_FEEDBACK, VisualCueType.WAVE],
    [BehaviorType.AWAKEN_RESPONSE, VisualCueType.BOUNCE],
    [BehaviorType.CONTROL_ACTIVATION, VisualCueType.GLOW],
    [BehaviorType.EMOTIONAL_EXPRESSION, VisualCueType.EXPRESSION_SHIFT],
    [BehaviorType.PLUGIN_TRIGGER, VisualCueType.SHAKE],
    [BehaviorType.USER_PROMPT, VisualCueType.NOD],
    [BehaviorType.ANIMATION_SEQUENCE, VisualCueType.SPIN],
    [BehaviorType.MOOD_TRANSITION, VisualCueType.FADE]
  ]);

  constructor() {
    this.currentRhythm = this.rhythmConfigs.get(RhythmType.CALM_STEADY)!;
    console.log('🎵 BehaviorRhythmManager 初始化完成');
  }

  /**
   * 启动节奏
   */
  public start(rhythmType: RhythmType = RhythmType.CALM_STEADY): void {
    if (this.isActive) {
      this.stop();
    }

    const config = this.rhythmConfigs.get(rhythmType);
    if (!config) {
      console.warn(`🎵 [Rhythm] 未找到节奏配置: ${rhythmType}`);
      return;
    }

    this.currentRhythm = config;
    this.isActive = true;
    this.beatCount = 0;

    console.log(`🎵 [Rhythm] 启动节奏: ${rhythmType} (BPM: ${config.bpm})`);

    this.startBeatLoop();

    // 触发节奏同步事件
    this.emitRhythmSync(rhythmType, { action: 'start', config });
  }

  /**
   * 停止节奏
   */
  public stop(): void {
    if (!this.isActive) return;

    this.isActive = false;
    this.beatCount = 0;

    if (this.beatTimer) {
      clearTimeout(this.beatTimer);
      this.beatTimer = undefined;
    }

    console.log(`🎵 [Rhythm] 停止节奏: ${this.currentRhythm.type}`);

    // 触发节奏同步事件
    this.emitRhythmSync(this.currentRhythm.type, { action: 'stop' });
  }

  /**
   * 切换节奏
   */
  public changeRhythm(rhythmType: RhythmType, smooth: boolean = true): void {
    console.log(`🎵 [Rhythm] 切换节奏: ${this.currentRhythm.type} → ${rhythmType}`);

    if (smooth && this.isActive) {
      // 平滑过渡
      this.smoothTransition(rhythmType);
    } else {
      // 直接切换
      this.stop();
      this.start(rhythmType);
    }

    // 触发节奏变化事件
    this.emitEvent({
      type: 'pattern_change',
      rhythmType,
      timestamp: Date.now(),
      metadata: { smooth, previousRhythm: this.currentRhythm.type }
    });
  }

  /**
   * 注册节奏同步回调
   */
  public onRhythmSync(callback: RhythmSyncCallback): void {
    this.rhythmSyncCallbacks.add(callback);
    console.log(`🎵 [Rhythm] 注册节奏同步回调，当前回调数: ${this.rhythmSyncCallbacks.size}`);
  }

  /**
   * 移除节奏同步回调
   */
  public offRhythmSync(callback: RhythmSyncCallback): void {
    this.rhythmSyncCallbacks.delete(callback);
  }

  /**
   * 注册行为反馈回调
   */
  public onBehaviorFeedback(callback: BehaviorFeedbackCallback): void {
    this.behaviorFeedbackCallbacks.add(callback);
    console.log(`🎵 [Rhythm] 注册行为反馈回调，当前回调数: ${this.behaviorFeedbackCallbacks.size}`);
  }

  /**
   * 移除行为反馈回调
   */
  public offBehaviorFeedback(callback: BehaviorFeedbackCallback): void {
    this.behaviorFeedbackCallbacks.delete(callback);
  }

  /**
   * 处理行为执行，触发相应的视觉反馈
   */
  public processBehavior(behavior: BehaviorDefinition, context?: {
    state: PetState;
    emotion: EmotionType;
    intensity: number;
  }): void {
    console.log(`🎵 [Rhythm] 处理行为: ${behavior.type}`);

    // 获取对应的视觉提示
    const visualCue = this.behaviorToVisualCue.get(behavior.type) || VisualCueType.IDLE_PULSE;

    // 触发行为反馈回调
    this.behaviorFeedbackCallbacks.forEach(callback => {
      try {
        callback(behavior.type, visualCue, {
          behavior,
          context,
          timestamp: Date.now()
        });
      } catch (error) {
        console.error('🎵 [Rhythm] 行为反馈回调执行错误:', error);
      }
    });

    // 根据行为类型调整节奏
    this.adjustRhythmByBehavior(behavior, context);

    // 触发反馈事件
    this.emitEvent({
      type: 'feedback_triggered',
      rhythmType: this.currentRhythm.type,
      timestamp: Date.now(),
      metadata: { behavior, visualCue, context }
    });
  }

  /**
   * 根据情绪调整节奏
   */
  public adjustRhythmByEmotion(emotion: EmotionType, intensity: number): void {
    let targetRhythm: RhythmType;

    // 根据情绪和强度选择节奏
    switch (emotion) {
      case EmotionType.Excited:
        targetRhythm = intensity > 0.7 ? RhythmType.EXCITED_BURST : RhythmType.HIGH_FREQUENCY;
        break;
      
      case EmotionType.Happy:
        targetRhythm = RhythmType.HIGH_FREQUENCY;
        break;
      
      case EmotionType.Calm:
        targetRhythm = RhythmType.CALM_STEADY;
        break;
      
      case EmotionType.Sleepy:
        targetRhythm = RhythmType.LOW_PULSE;
        break;
      
      case EmotionType.Focused:
        targetRhythm = RhythmType.ADAPTIVE;
        break;
      
      case EmotionType.Curious:
        targetRhythm = intensity > 0.6 ? RhythmType.HIGH_FREQUENCY : RhythmType.ADAPTIVE;
        break;
      
      default:
        targetRhythm = RhythmType.ADAPTIVE;
    }

    if (targetRhythm !== this.currentRhythm.type) {
      console.log(`🎵 [Rhythm] 情绪驱动节奏调整: ${emotion} (${intensity}) → ${targetRhythm}`);
      this.changeRhythm(targetRhythm, true);
    }
  }

  /**
   * 获取当前节奏信息
   */
  public getCurrentRhythm(): {
    type: RhythmType;
    config: BehaviorRhythmConfig;
    isActive: boolean;
    beatCount: number;
  } {
    return {
      type: this.currentRhythm.type,
      config: { ...this.currentRhythm },
      isActive: this.isActive,
      beatCount: this.beatCount
    };
  }

  /**
   * 启动节拍循环
   */
  private startBeatLoop(): void {
    const beatInterval = (60 / this.currentRhythm.bpm) * 1000; // ms per beat

    const beat = () => {
      if (!this.isActive) return;

      this.beatCount++;
      const patternIndex = (this.beatCount - 1) % this.currentRhythm.pattern.length;
      const beatStrength = this.currentRhythm.pattern[patternIndex];

      if (beatStrength > 0) {
        console.log(`🎵 [Rhythm] 节拍 ${this.beatCount} (强度: ${beatStrength}, 模式位置: ${patternIndex})`);
        
        // 触发节拍事件
        this.emitEvent({
          type: 'beat',
          rhythmType: this.currentRhythm.type,
          beatNumber: this.beatCount,
          timestamp: Date.now(),
          metadata: { strength: beatStrength, patternIndex }
        });
      }

      // 调度下一个节拍
      this.beatTimer = setTimeout(beat, beatInterval);
    };

    // 开始第一个节拍
    beat();
  }

  /**
   * 平滑过渡到新节奏
   */
  private smoothTransition(newRhythmType: RhythmType): void {
    const newConfig = this.rhythmConfigs.get(newRhythmType);
    if (!newConfig) return;

    // 逐渐调整 BPM
    const currentBPM = this.currentRhythm.bpm;
    const targetBPM = newConfig.bpm;
    const steps = 10;
    const bpmStep = (targetBPM - currentBPM) / steps;
    
    let currentStep = 0;
    const transition = () => {
      if (currentStep >= steps) {
        // 完成过渡
        this.currentRhythm = newConfig;
        console.log(`🎵 [Rhythm] 平滑过渡完成到: ${newRhythmType}`);
        return;
      }

      currentStep++;
      this.currentRhythm.bpm = Math.round(currentBPM + bpmStep * currentStep);
      
      setTimeout(transition, 200); // 每200ms调整一次
    };

    transition();
  }

  /**
   * 根据行为调整节奏
   */
  private adjustRhythmByBehavior(behavior: BehaviorDefinition, context?: {
    state: PetState;
    emotion: EmotionType;
    intensity: number;
  }): void {
    // 某些行为可能需要特定的节奏调整
    switch (behavior.type) {
      case BehaviorType.AWAKEN_RESPONSE:
        if (this.currentRhythm.type === RhythmType.LOW_PULSE) {
          this.changeRhythm(RhythmType.ADAPTIVE, true);
        }
        break;
      
      case BehaviorType.CONTROL_ACTIVATION:
        if (context?.emotion === EmotionType.Excited) {
          this.changeRhythm(RhythmType.HIGH_FREQUENCY, true);
        }
        break;
      
      case BehaviorType.EMOTIONAL_EXPRESSION:
        if (context) {
          this.adjustRhythmByEmotion(context.emotion, context.intensity);
        }
        break;
    }
  }

  /**
   * 触发节奏同步事件
   */
  private emitRhythmSync(rhythm: RhythmType, context?: any): void {
    this.rhythmSyncCallbacks.forEach(callback => {
      try {
        callback(rhythm, context);
      } catch (error) {
        console.error('🎵 [Rhythm] 节奏同步回调执行错误:', error);
      }
    });

    // 触发同步事件
    this.emitEvent({
      type: 'rhythm_sync',
      rhythmType: rhythm,
      timestamp: Date.now(),
      metadata: context
    });
  }

  /**
   * 事件监听
   */
  public on(eventType: string, listener: (event: BehaviorRhythmEvent) => void): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)!.push(listener);
  }

  /**
   * 移除事件监听
   */
  public off(eventType: string, listener: Function): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * 触发事件
   */
  private emitEvent(event: BehaviorRhythmEvent): void {
    const listeners = this.eventListeners.get(event.type);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error(`🎵 [Rhythm] 事件监听器错误 ${event.type}:`, error);
        }
      });
    }
  }

  /**
   * 重置节奏管理器
   */
  public reset(): void {
    this.stop();
    this.currentRhythm = this.rhythmConfigs.get(RhythmType.CALM_STEADY)!;
    console.log('🎵 [Rhythm] 节奏管理器已重置');
  }

  /**
   * 销毁节奏管理器
   */
  public destroy(): void {
    this.stop();
    this.rhythmSyncCallbacks.clear();
    this.behaviorFeedbackCallbacks.clear();
    this.eventListeners.clear();
    console.log('🎵 BehaviorRhythmManager 已销毁');
  }
}

// 导出工厂函数
export function createBehaviorRhythmManager(): BehaviorRhythmManager {
  return new BehaviorRhythmManager();
}
