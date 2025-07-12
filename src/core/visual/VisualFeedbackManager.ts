/**
 * T4-C: 视觉反馈管理器
 * 
 * 负责行为策略执行后触发视觉反馈（动画、动效提示），
 * 以及视觉状态变化驱动行为节奏与情绪变化的双向反馈机制
 */

import { RefObject } from 'react';
import { EmotionType, PetState } from '../../types';

// 视觉提示类型
export enum VisualCueType {
  WAVE = 'wave',                    // 摆动
  NOD = 'nod',                      // 点头
  IDLE_PULSE = 'idlePulse',         // 空闲脉动
  EXPRESSION_SHIFT = 'expressionShift', // 表情变化
  BOUNCE = 'bounce',                // 弹跳
  GLOW = 'glow',                    // 发光
  SHAKE = 'shake',                  // 震动
  FADE = 'fade',                    // 淡化
  SPIN = 'spin',                    // 旋转
  TILT = 'tilt'                     // 倾斜
}

// 节奏类型
export enum RhythmType {
  LOW_PULSE = 'low_pulse',          // 低频脉冲
  HIGH_FREQUENCY = 'high_frequency', // 高频率
  CALM_STEADY = 'calm_steady',      // 平静稳定
  EXCITED_BURST = 'excited_burst',  // 兴奋爆发
  ADAPTIVE = 'adaptive'             // 自适应
}

// 视觉反馈配置
export interface VisualFeedbackConfig {
  cueType: VisualCueType;
  duration: number;                 // 动画持续时间 (ms)
  intensity: 'low' | 'medium' | 'high';
  delay?: number;                   // 延迟时间 (ms)
  easing?: 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
  repeat?: number;                  // 重复次数
  emotion?: EmotionType;            // 关联情绪
  metadata?: Record<string, any>;   // 扩展数据
}

// 视觉状态
export interface VisualState {
  currentCue?: VisualCueType;
  isAnimating: boolean;
  emotion: EmotionType;
  intensity: number;                // 0-1
  rhythm: RhythmType;
  animationStartTime?: number;
  queuedCues: VisualFeedbackConfig[];
}

// 节奏同步回调
export type RhythmSyncCallback = (rhythm: RhythmType, context?: any) => void;

// 视觉反馈事件
export interface VisualFeedbackEvent {
  type: 'visual_triggered' | 'rhythm_changed' | 'emotion_shifted' | 'animation_completed';
  cueType?: VisualCueType;
  rhythm?: RhythmType;
  emotion?: EmotionType;
  timestamp: number;
  metadata?: any;
}

/**
 * 视觉反馈管理器类
 */
export class VisualFeedbackManager {
  private componentRef?: RefObject<any>;
  private visualState: VisualState;
  private rhythmCallbacks: Set<RhythmSyncCallback> = new Set();
  private eventListeners: Map<string, Function[]> = new Map();
  private animationQueue: VisualFeedbackConfig[] = [];
  private isProcessingQueue: boolean = false;
  
  // 节奏映射配置
  private emotionToRhythm: Map<EmotionType, RhythmType> = new Map([
    [EmotionType.Happy, RhythmType.HIGH_FREQUENCY],
    [EmotionType.Excited, RhythmType.EXCITED_BURST],
    [EmotionType.Calm, RhythmType.CALM_STEADY],
    [EmotionType.Sleepy, RhythmType.LOW_PULSE],
    [EmotionType.Focused, RhythmType.ADAPTIVE],
    [EmotionType.Curious, RhythmType.HIGH_FREQUENCY]
  ]);

  // 情绪到视觉提示映射
  private emotionToCue: Map<EmotionType, VisualCueType[]> = new Map([
    [EmotionType.Happy, [VisualCueType.BOUNCE, VisualCueType.GLOW]],
    [EmotionType.Excited, [VisualCueType.SHAKE, VisualCueType.SPIN]],
    [EmotionType.Calm, [VisualCueType.IDLE_PULSE, VisualCueType.FADE]],
    [EmotionType.Sleepy, [VisualCueType.NOD, VisualCueType.FADE]],
    [EmotionType.Focused, [VisualCueType.TILT, VisualCueType.GLOW]],
    [EmotionType.Curious, [VisualCueType.WAVE, VisualCueType.BOUNCE]]
  ]);

  constructor() {
    this.visualState = {
      isAnimating: false,
      emotion: EmotionType.Calm,
      intensity: 0.5,
      rhythm: RhythmType.CALM_STEADY,
      queuedCues: []
    };
    
    console.log('🎨 VisualFeedbackManager 初始化完成');
  }

  /**
   * 绑定组件引用
   */
  public bindComponent(ref: RefObject<any>): void {
    this.componentRef = ref;
    console.log('🎨 [Visual] 组件引用已绑定');
    
    // 如果组件有暴露的方法，可以直接调用
    if (ref.current && typeof ref.current.setAnimationState === 'function') {
      console.log('🎨 [Visual] 检测到组件动画控制接口');
    }
  }

  /**
   * 触发视觉提示
   */
  public triggerVisualCue(type: VisualCueType, config?: Partial<VisualFeedbackConfig>): void {
    const fullConfig: VisualFeedbackConfig = {
      cueType: type,
      duration: config?.duration || this.getDefaultDuration(type),
      intensity: config?.intensity || 'medium',
      delay: config?.delay || 0,
      easing: config?.easing || 'ease-in-out',
      repeat: config?.repeat || 1,
      emotion: config?.emotion || this.visualState.emotion,
      metadata: config?.metadata || {}
    };

    console.log(`🎨 [Visual] 触发视觉提示: ${type} (强度: ${fullConfig.intensity}, 时长: ${fullConfig.duration}ms)`);

    // 添加到队列
    this.animationQueue.push(fullConfig);
    
    // 更新视觉状态
    this.visualState.currentCue = type;
    this.visualState.isAnimating = true;
    this.visualState.animationStartTime = Date.now();

    // 处理队列
    this.processAnimationQueue();

    // 触发事件
    this.emitEvent({
      type: 'visual_triggered',
      cueType: type,
      timestamp: Date.now(),
      metadata: fullConfig
    });

    // 执行实际的视觉反馈
    this.executeVisualCue(fullConfig);
  }

  /**
   * 与情绪同步
   */
  public syncWithEmotion(emotion: EmotionType, intensity: number = 0.7): void {
    console.log(`🎨 [Visual] 情绪同步: ${emotion} (强度: ${intensity})`);
    
    const previousEmotion = this.visualState.emotion;
    this.visualState.emotion = emotion;
    this.visualState.intensity = intensity;

    // 根据情绪更新节奏
    const newRhythm = this.emotionToRhythm.get(emotion) || RhythmType.ADAPTIVE;
    if (newRhythm !== this.visualState.rhythm) {
      this.changeRhythm(newRhythm);
    }

    // 触发情绪相关的视觉提示
    const emotionCues = this.emotionToCue.get(emotion);
    if (emotionCues && emotionCues.length > 0) {
      // 选择合适的视觉提示（根据强度）
      const cueIndex = Math.floor(intensity * emotionCues.length);
      const selectedCue = emotionCues[Math.min(cueIndex, emotionCues.length - 1)];
      
      this.triggerVisualCue(selectedCue, {
        emotion,
        intensity: intensity > 0.8 ? 'high' : intensity > 0.4 ? 'medium' : 'low',
        duration: Math.floor(1000 + intensity * 1000) // 1-2秒
      });
    }

    // 触发情绪变化事件
    this.emitEvent({
      type: 'emotion_shifted',
      emotion,
      timestamp: Date.now(),
      metadata: { previousEmotion, intensity }
    });
  }

  /**
   * 注册节奏同步回调
   */
  public onRhythmSync(callback: RhythmSyncCallback): void {
    this.rhythmCallbacks.add(callback);
    console.log(`🎨 [Visual] 注册节奏同步回调，当前回调数: ${this.rhythmCallbacks.size}`);
  }

  /**
   * 移除节奏同步回调
   */
  public offRhythmSync(callback: RhythmSyncCallback): void {
    this.rhythmCallbacks.delete(callback);
    console.log(`🎨 [Visual] 移除节奏同步回调，当前回调数: ${this.rhythmCallbacks.size}`);
  }

  /**
   * 改变节奏
   */
  public changeRhythm(rhythm: RhythmType, context?: any): void {
    if (rhythm === this.visualState.rhythm) return;

    const previousRhythm = this.visualState.rhythm;
    this.visualState.rhythm = rhythm;
    
    console.log(`🎨 [Visual] 节奏变化: ${previousRhythm} → ${rhythm}`);

    // 通知所有注册的回调
    this.rhythmCallbacks.forEach(callback => {
      try {
        callback(rhythm, context);
      } catch (error) {
        console.error('🎨 [Visual] 节奏同步回调执行错误:', error);
      }
    });

    // 触发节奏变化事件
    this.emitEvent({
      type: 'rhythm_changed',
      rhythm,
      timestamp: Date.now(),
      metadata: { previousRhythm, context }
    });
  }

  /**
   * 调度视觉反馈（从行为系统调用）
   */
  public dispatchVisualFeedback(type: VisualCueType, emotionContext?: {
    emotion: EmotionType;
    intensity: number;
    state?: PetState;
  }): void {
    console.log(`🎨 [Visual] 调度视觉反馈: ${type}`);

    if (emotionContext) {
      this.syncWithEmotion(emotionContext.emotion, emotionContext.intensity);
    }

    this.triggerVisualCue(type, {
      emotion: emotionContext?.emotion,
      intensity: emotionContext?.intensity ? 
                (emotionContext.intensity > 0.8 ? 'high' : 
                 emotionContext.intensity > 0.4 ? 'medium' : 'low') : 'medium'
    });
  }

  /**
   * 处理动画队列
   */
  private async processAnimationQueue(): Promise<void> {
    if (this.isProcessingQueue || this.animationQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.animationQueue.length > 0) {
      const config = this.animationQueue.shift();
      if (config) {
        await this.processAnimationConfig(config);
      }
    }

    this.isProcessingQueue = false;
  }

  /**
   * 处理单个动画配置
   */
  private async processAnimationConfig(config: VisualFeedbackConfig): Promise<void> {
    if (config.delay && config.delay > 0) {
      await this.sleep(config.delay);
    }

    for (let i = 0; i < (config.repeat || 1); i++) {
      await this.executeAnimationStep(config);
      
      if (i < (config.repeat || 1) - 1) {
        await this.sleep(100); // 重复间隔
      }
    }

    // 动画完成
    this.onAnimationComplete(config);
  }

  /**
   * 执行动画步骤
   */
  private async executeAnimationStep(config: VisualFeedbackConfig): Promise<void> {
    // 通过组件引用执行动画
    if (this.componentRef?.current) {
      const component = this.componentRef.current;
      
      if (typeof component.setAnimationState === 'function') {
        component.setAnimationState({
          isAnimating: true,
          animationType: this.mapCueToAnimationType(config.cueType),
          intensity: config.intensity
        });
      }

      if (typeof component.triggerBehavior === 'function') {
        component.triggerBehavior(`visual_${config.cueType}`, {
          config,
          timestamp: Date.now()
        });
      }
    }

    // 等待动画完成
    await this.sleep(config.duration);
  }

  /**
   * 执行视觉提示
   */
  private executeVisualCue(config: VisualFeedbackConfig): void {
    console.log(`🎨 [Visual] 执行视觉提示: ${config.cueType}`);

    // 直接控制组件状态
    if (this.componentRef?.current) {
      const component = this.componentRef.current;
      
      // 设置动画状态
      if (typeof component.setAnimationState === 'function') {
        component.setAnimationState({
          isAnimating: true,
          animationType: this.mapCueToAnimationType(config.cueType),
          intensity: config.intensity
        });

        // 动画结束后重置状态
        setTimeout(() => {
          if (component.setAnimationState) {
            component.setAnimationState({
              isAnimating: false,
              animationType: '',
              intensity: ''
            });
          }
        }, config.duration);
      }

      // 触发行为
      if (typeof component.applyBehavior === 'function') {
        component.applyBehavior(`visual_${config.cueType}`);
      }
    }
  }

  /**
   * 映射视觉提示到动画类型
   */
  private mapCueToAnimationType(cue: VisualCueType): string {
    const mapping: Record<VisualCueType, string> = {
      [VisualCueType.WAVE]: 'wave',
      [VisualCueType.NOD]: 'bounce',
      [VisualCueType.IDLE_PULSE]: 'pulse',
      [VisualCueType.EXPRESSION_SHIFT]: 'fade',
      [VisualCueType.BOUNCE]: 'bounce',
      [VisualCueType.GLOW]: 'glow',
      [VisualCueType.SHAKE]: 'shake',
      [VisualCueType.FADE]: 'fade',
      [VisualCueType.SPIN]: 'spin',
      [VisualCueType.TILT]: 'tilt'
    };

    return mapping[cue] || 'pulse';
  }

  /**
   * 获取默认持续时间
   */
  private getDefaultDuration(type: VisualCueType): number {
    const durations: Record<VisualCueType, number> = {
      [VisualCueType.WAVE]: 1000,
      [VisualCueType.NOD]: 500,
      [VisualCueType.IDLE_PULSE]: 2000,
      [VisualCueType.EXPRESSION_SHIFT]: 800,
      [VisualCueType.BOUNCE]: 600,
      [VisualCueType.GLOW]: 1500,
      [VisualCueType.SHAKE]: 400,
      [VisualCueType.FADE]: 1000,
      [VisualCueType.SPIN]: 800,
      [VisualCueType.TILT]: 600
    };

    return durations[type] || 1000;
  }

  /**
   * 动画完成回调
   */
  private onAnimationComplete(config: VisualFeedbackConfig): void {
    console.log(`🎨 [Visual] 动画完成: ${config.cueType}`);
    
    this.visualState.isAnimating = false;
    this.visualState.currentCue = undefined;

    // 触发完成事件
    this.emitEvent({
      type: 'animation_completed',
      cueType: config.cueType,
      timestamp: Date.now(),
      metadata: config
    });

    // 根据动画类型可能触发节奏反馈
    this.analyzeVisualStateForRhythmFeedback();
  }

  /**
   * 分析视觉状态并反馈到行为节奏
   */
  private analyzeVisualStateForRhythmFeedback(): void {
    const now = Date.now();
    const timeSinceLastAnimation = now - (this.visualState.animationStartTime || now);

    // 长时间空闲检测
    if (timeSinceLastAnimation > 10000) { // 10秒无动画
      console.log('🎨 [Visual] 检测到长时间空闲，触发低频脉冲节奏');
      this.changeRhythm(RhythmType.LOW_PULSE, { 
        reason: 'idle_detected', 
        idleTime: timeSinceLastAnimation 
      });
    }

    // 情绪低落检测
    if (this.visualState.emotion === EmotionType.Sleepy && this.visualState.intensity < 0.3) {
      console.log('🎨 [Visual] 检测到低落情绪，触发平静节奏');
      this.changeRhythm(RhythmType.CALM_STEADY, { 
        reason: 'low_emotion', 
        emotion: this.visualState.emotion,
        intensity: this.visualState.intensity 
      });
    }

    // 兴奋状态检测
    if ([EmotionType.Happy, EmotionType.Excited].includes(this.visualState.emotion) && 
        this.visualState.intensity > 0.7) {
      console.log('🎨 [Visual] 检测到高兴/兴奋状态，切换到高频率节奏');
      this.changeRhythm(RhythmType.HIGH_FREQUENCY, { 
        reason: 'excited_state', 
        emotion: this.visualState.emotion,
        intensity: this.visualState.intensity 
      });
    }
  }

  /**
   * 获取当前视觉状态
   */
  public getVisualState(): VisualState {
    return { ...this.visualState };
  }

  /**
   * 事件监听
   */
  public on(eventType: string, listener: (event: VisualFeedbackEvent) => void): void {
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
  private emitEvent(event: VisualFeedbackEvent): void {
    const listeners = this.eventListeners.get(event.type);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error(`🎨 [Visual] 事件监听器错误 ${event.type}:`, error);
        }
      });
    }
  }

  /**
   * 睡眠函数
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 清空动画队列
   */
  public clearAnimationQueue(): void {
    this.animationQueue = [];
    this.isProcessingQueue = false;
    console.log('🎨 [Visual] 动画队列已清空');
  }

  /**
   * 重置视觉状态
   */
  public reset(): void {
    this.clearAnimationQueue();
    this.visualState = {
      isAnimating: false,
      emotion: EmotionType.Calm,
      intensity: 0.5,
      rhythm: RhythmType.CALM_STEADY,
      queuedCues: []
    };
    console.log('🎨 [Visual] 视觉状态已重置');
  }

  /**
   * 销毁管理器
   */
  public destroy(): void {
    this.clearAnimationQueue();
    this.rhythmCallbacks.clear();
    this.eventListeners.clear();
    this.componentRef = undefined;
    console.log('🎨 VisualFeedbackManager 已销毁');
  }
}

// 导出工厂函数
export function createVisualFeedbackManager(): VisualFeedbackManager {
  return new VisualFeedbackManager();
}
