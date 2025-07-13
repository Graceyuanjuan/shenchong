/**
 * T3-C: 节奏控制器
 * 
 * 负责管理行为执行的多段节奏处理
 * 包括动画帧率控制、等待/暂停调度、节拍同步等
 */

import { BehaviorDefinition, BehaviorType } from './BehaviorScheduler';
import { PetState, EmotionType } from '../types';
// T5-C: 集成节奏适配管理器
import { RhythmAdaptationManager, createRhythmAdaptationManager } from '../modules/rhythm/RhythmAdaptationManager';
import { RhythmContext, RhythmAdaptationDecision } from '../types/rhythm/RhythmContext';

// Node.js 环境的 requestAnimationFrame polyfill
const isNodeEnv = typeof window === 'undefined';
const requestAnimationFrame = isNodeEnv 
  ? (callback: FrameRequestCallback) => setTimeout(callback, 16.67) // ~60fps
  : (window as any).requestAnimationFrame;
const cancelAnimationFrame = isNodeEnv
  ? (id: any) => clearTimeout(id)
  : (window as any).cancelAnimationFrame;

// 节奏模式
export enum RhythmMode {
  CONTINUOUS = 'continuous',     // 连续模式
  PULSE = 'pulse',              // 脉冲模式
  SEQUENCE = 'sequence',        // 序列模式
  ADAPTIVE = 'adaptive',        // 自适应模式
  SYNCED = 'synced'            // 同步模式
}

// 节拍配置
export interface BeatConfig {
  bpm: number;                  // 每分钟节拍数
  beatDivision: number;         // 节拍细分 (1, 2, 4, 8)
  swing?: number;              // 摇摆系数 (0-1)
  accent?: number[];           // 重音节拍位置
}

// 帧控制配置
export interface FrameConfig {
  targetFPS: number;           // 目标帧率
  maxFrameTime: number;        // 最大帧时间 (ms)
  adaptiveFrameRate: boolean;  // 自适应帧率
  skipFrameThreshold: number;  // 跳帧阈值
}

// 节奏段定义
export interface RhythmSegment {
  id: string;
  duration: number;            // 段持续时间 (ms)
  mode: RhythmMode;
  beatConfig?: BeatConfig;
  frameConfig?: FrameConfig;
  behaviors: BehaviorDefinition[];
  transitions?: {
    fadeIn?: number;           // 淡入时间 (ms)
    fadeOut?: number;          // 淡出时间 (ms)
    nextSegment?: string;      // 下一段ID
  };
}

// 节奏执行状态
export interface RhythmExecutionState {
  currentSegment?: RhythmSegment;
  segmentStartTime: number;
  totalElapsedTime: number;
  currentBeat: number;
  frameCount: number;
  isPlaying: boolean;
  isPaused: boolean;
}

// 节奏同步事件
export interface RhythmSyncEvent {
  type: 'beat' | 'segment_start' | 'segment_end' | 'rhythm_complete';
  timestamp: number;
  segmentId?: string;
  beatNumber?: number;
  data?: any;
}

/**
 * 节奏控制器类
 */
export class RhythmController {
  private segments: Map<string, RhythmSegment> = new Map();
  private executionState: RhythmExecutionState;
  private animationFrameId?: number;
  private beatTimer?: NodeJS.Timeout;
  private eventListeners: Map<string, Function[]> = new Map();
  
  // T5-C: 节奏适配管理器
  private adaptationManager: RhythmAdaptationManager;
  private currentMode: string = 'pulse';
  private lastAdaptationTime: number = 0;
  
  // 性能监控
  private frameTimeHistory: number[] = [];
  private lastFrameTime: number = 0;
  private performanceMetrics = {
    averageFrameTime: 0,
    droppedFrames: 0,
    totalFrames: 0
  };

  constructor(adaptationConfig?: any) {
    this.executionState = {
      segmentStartTime: 0,
      totalElapsedTime: 0,
      currentBeat: 0,
      frameCount: 0,
      isPlaying: false,
      isPaused: false
    };
    
    // T5-C: 初始化节奏适配管理器
    this.adaptationManager = createRhythmAdaptationManager(adaptationConfig);
    this.setupAdaptationListeners();
    
    console.log('🎵 RhythmController 初始化完成，集成节奏适配能力');
  }

  /**
   * 添加节奏段
   */
  public addSegment(segment: RhythmSegment): void {
    this.segments.set(segment.id, segment);
    console.log(`🎵 [Rhythm] 添加节奏段: ${segment.id} (${segment.mode}, ${segment.duration}ms)`);
  }

  /**
   * 移除节奏段
   */
  public removeSegment(segmentId: string): void {
    this.segments.delete(segmentId);
    console.log(`🎵 [Rhythm] 移除节奏段: ${segmentId}`);
  }

  /**
   * 开始播放节奏段
   */
  public async playSegment(segmentId: string): Promise<void> {
    const segment = this.segments.get(segmentId);
    if (!segment) {
      throw new Error(`节奏段不存在: ${segmentId}`);
    }

    console.log(`🎵 [Rhythm] 开始播放节奏段: ${segmentId}`);
    
    this.executionState.currentSegment = segment;
    this.executionState.segmentStartTime = Date.now();
    this.executionState.currentBeat = 0;
    this.executionState.frameCount = 0;
    this.executionState.isPlaying = true;
    this.executionState.isPaused = false;

    // 触发段开始事件
    this.emitEvent({
      type: 'segment_start',
      timestamp: Date.now(),
      segmentId: segment.id
    });

    // 根据模式启动相应的控制循环
    await this.startRhythmLoop(segment);
  }

  /**
   * 暂停节奏控制
   */
  public pause(): void {
    console.log('🎵 [Rhythm] 暂停节奏控制');
    this.executionState.isPaused = true;
    this.stopLoops();
  }

  /**
   * 恢复节奏控制
   */
  public resume(): void {
    console.log('🎵 [Rhythm] 恢复节奏控制');
    this.executionState.isPaused = false;
    
    if (this.executionState.currentSegment) {
      this.startRhythmLoop(this.executionState.currentSegment);
    }
  }

  /**
   * 停止节奏控制
   */
  public stop(): void {
    console.log('🎵 [Rhythm] 停止节奏控制');
    this.executionState.isPlaying = false;
    this.executionState.isPaused = false;
    this.stopLoops();

    if (this.executionState.currentSegment) {
      this.emitEvent({
        type: 'segment_end',
        timestamp: Date.now(),
        segmentId: this.executionState.currentSegment.id
      });
    }

    this.executionState.currentSegment = undefined;
  }

  /**
   * 启动节奏循环
   */
  private async startRhythmLoop(segment: RhythmSegment): Promise<void> {
    switch (segment.mode) {
      case RhythmMode.CONTINUOUS:
        this.startContinuousLoop(segment);
        break;
      
      case RhythmMode.PULSE:
        this.startPulseLoop(segment);
        break;
      
      case RhythmMode.SEQUENCE:
        await this.startSequenceLoop(segment);
        break;
      
      case RhythmMode.ADAPTIVE:
        this.startAdaptiveLoop(segment);
        break;
      
      case RhythmMode.SYNCED:
        this.startSyncedLoop(segment);
        break;
    }
  }

  /**
   * 连续模式循环
   */
  private startContinuousLoop(segment: RhythmSegment): void {
    const frameConfig = segment.frameConfig || {
      targetFPS: 60,
      maxFrameTime: 16.67,
      adaptiveFrameRate: true,
      skipFrameThreshold: 33.33
    };

    const loop = () => {
      if (!this.executionState.isPlaying || this.executionState.isPaused) return;

      const now = Date.now();
      const frameTime = now - this.lastFrameTime;
      this.lastFrameTime = now;

      // 性能监控
      this.updatePerformanceMetrics(frameTime);

      // 检查段是否完成
      const elapsed = now - this.executionState.segmentStartTime;
      if (elapsed >= segment.duration) {
        this.completeSegment(segment);
        return;
      }

      // 执行帧处理
      this.processFrame(segment, frameTime);

      // 调度下一帧
      this.animationFrameId = requestAnimationFrame(loop);
    };

    this.lastFrameTime = Date.now();
    this.animationFrameId = requestAnimationFrame(loop);
  }

  /**
   * 脉冲模式循环
   */
  private startPulseLoop(segment: RhythmSegment): void {
    const beatConfig = segment.beatConfig || {
      bpm: 120,
      beatDivision: 4
    };

    const beatInterval = (60 / beatConfig.bpm) * 1000; // ms per beat
    let beatCount = 0;

    const pulseLoop = () => {
      if (!this.executionState.isPlaying || this.executionState.isPaused) return;

      beatCount++;
      this.executionState.currentBeat = beatCount;

      console.log(`🎵 [Rhythm] 节拍 ${beatCount} (BPM: ${beatConfig.bpm})`);

      // 触发节拍事件
      this.emitEvent({
        type: 'beat',
        timestamp: Date.now(),
        segmentId: segment.id,
        beatNumber: beatCount
      });

      // 在节拍上执行行为
      this.executeBehaviorsOnBeat(segment, beatCount);

      // 检查段是否完成
      const elapsed = Date.now() - this.executionState.segmentStartTime;
      if (elapsed >= segment.duration) {
        this.completeSegment(segment);
        return;
      }

      // 调度下一个节拍
      this.beatTimer = setTimeout(pulseLoop, beatInterval);
    };

    // 立即开始第一个节拍
    pulseLoop();
  }

  /**
   * 序列模式循环
   */
  private async startSequenceLoop(segment: RhythmSegment): Promise<void> {
    console.log(`🎵 [Rhythm] 开始序列执行: ${segment.behaviors.length} 个行为`);

    for (let i = 0; i < segment.behaviors.length; i++) {
      if (!this.executionState.isPlaying || this.executionState.isPaused) {
        break;
      }

      const behavior = segment.behaviors[i];
      console.log(`🎵 [Rhythm] 序列步骤 ${i + 1}: ${behavior.type}`);

      // 执行行为
      await this.executeBehavior(behavior);

      // 等待持续时间
      if (behavior.duration) {
        await this.sleep(behavior.duration);
      }
    }

    this.completeSegment(segment);
  }

  /**
   * 自适应模式循环
   */
  private startAdaptiveLoop(segment: RhythmSegment): void {
    // 自适应模式根据系统性能和情绪状态动态调整节奏
    const initialFPS = segment.frameConfig?.targetFPS || 60;
    let currentFPS = initialFPS;
    let adaptiveInterval = 1000 / currentFPS;

    const adaptiveLoop = () => {
      if (!this.executionState.isPlaying || this.executionState.isPaused) return;

      const now = Date.now();
      const frameTime = now - this.lastFrameTime;
      this.lastFrameTime = now;

      // 性能自适应
      if (frameTime > adaptiveInterval * 1.5) {
        // 性能不足，降低帧率
        currentFPS = Math.max(30, currentFPS - 5);
        adaptiveInterval = 1000 / currentFPS;
        console.log(`🎵 [Rhythm] 自适应降低帧率到 ${currentFPS} FPS`);
      } else if (frameTime < adaptiveInterval * 0.8 && currentFPS < initialFPS) {
        // 性能充足，提高帧率
        currentFPS = Math.min(initialFPS, currentFPS + 5);
        adaptiveInterval = 1000 / currentFPS;
        console.log(`🎵 [Rhythm] 自适应提高帧率到 ${currentFPS} FPS`);
      }

      // 处理帧
      this.processFrame(segment, frameTime);

      // 检查完成
      const elapsed = now - this.executionState.segmentStartTime;
      if (elapsed >= segment.duration) {
        this.completeSegment(segment);
        return;
      }

      // 调度下一帧
      setTimeout(adaptiveLoop, adaptiveInterval);
    };

    this.lastFrameTime = Date.now();
    adaptiveLoop();
  }

  /**
   * 同步模式循环
   */
  private startSyncedLoop(segment: RhythmSegment): void {
    // 同步模式与外部系统时钟同步
    const beatConfig = segment.beatConfig || { bpm: 120, beatDivision: 4 };
    const beatInterval = (60 / beatConfig.bpm) * 1000;
    
    // 计算下一个同步点
    const startTime = this.executionState.segmentStartTime;
    let nextBeatTime = startTime;

    const syncLoop = () => {
      if (!this.executionState.isPlaying || this.executionState.isPaused) return;

      const now = Date.now();
      
      if (now >= nextBeatTime) {
        this.executionState.currentBeat++;
        
        console.log(`🎵 [Rhythm] 同步节拍 ${this.executionState.currentBeat}`);
        
        this.emitEvent({
          type: 'beat',
          timestamp: now,
          segmentId: segment.id,
          beatNumber: this.executionState.currentBeat
        });

        this.executeBehaviorsOnBeat(segment, this.executionState.currentBeat);
        
        nextBeatTime += beatInterval;
      }

      // 检查完成
      if (now - startTime >= segment.duration) {
        this.completeSegment(segment);
        return;
      }

      // 高精度调度
      this.animationFrameId = requestAnimationFrame(syncLoop);
    };

    this.animationFrameId = requestAnimationFrame(syncLoop);
  }

  /**
   * 处理帧
   */
  private processFrame(segment: RhythmSegment, frameTime: number): void {
    this.executionState.frameCount++;
    
    // 帧级别的行为处理
    const frameBasedBehaviors = segment.behaviors.filter(b => 
      b.type === BehaviorType.ANIMATION_SEQUENCE || 
      b.type === BehaviorType.IDLE_ANIMATION
    );

    for (const behavior of frameBasedBehaviors) {
      // 简化的帧处理
      if (this.executionState.frameCount % 60 === 0) { // 每秒执行一次
        console.log(`🎵 [Rhythm] 帧处理: ${behavior.type}`);
      }
    }
  }

  /**
   * 在节拍上执行行为
   */
  private executeBehaviorsOnBeat(segment: RhythmSegment, beatNumber: number): void {
    const beatBehaviors = segment.behaviors.filter(b => {
      // 简单的节拍映射：每4拍执行一次
      return beatNumber % 4 === 1;
    });

    for (const behavior of beatBehaviors) {
      this.executeBehavior(behavior);
    }
  }

  /**
   * 执行单个行为
   */
  private async executeBehavior(behavior: BehaviorDefinition): Promise<void> {
    console.log(`🎵 [Rhythm] 执行行为: ${behavior.type} - ${behavior.message || ''}`);
    
    // 这里可以集成实际的行为执行系统
    // 例如调用 BehaviorScheduler 的执行方法
  }

  /**
   * 完成段执行
   */
  private completeSegment(segment: RhythmSegment): void {
    console.log(`🎵 [Rhythm] 完成段执行: ${segment.id}`);
    
    this.emitEvent({
      type: 'segment_end',
      timestamp: Date.now(),
      segmentId: segment.id
    });

    // 处理转场
    if (segment.transitions?.nextSegment) {
      const nextSegment = this.segments.get(segment.transitions.nextSegment);
      if (nextSegment) {
        console.log(`🎵 [Rhythm] 自动切换到下一段: ${nextSegment.id}`);
        this.playSegment(nextSegment.id);
        return;
      }
    }

    // 没有下一段，完成整个节奏
    this.stop();
    this.emitEvent({
      type: 'rhythm_complete',
      timestamp: Date.now()
    });
  }

  /**
   * 停止所有循环
   */
  private stopLoops(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = undefined;
    }

    if (this.beatTimer) {
      clearTimeout(this.beatTimer);
      this.beatTimer = undefined;
    }
  }

  /**
   * 更新性能指标
   */
  private updatePerformanceMetrics(frameTime: number): void {
    this.frameTimeHistory.push(frameTime);
    if (this.frameTimeHistory.length > 60) { // 保持60帧的历史
      this.frameTimeHistory.shift();
    }

    this.performanceMetrics.totalFrames++;
    
    // 计算平均帧时间
    const sum = this.frameTimeHistory.reduce((a, b) => a + b, 0);
    this.performanceMetrics.averageFrameTime = sum / this.frameTimeHistory.length;

    // 检测丢帧
    if (frameTime > 33.33) { // 超过30FPS的阈值
      this.performanceMetrics.droppedFrames++;
    }
  }

  /**
   * 获取性能统计
   */
  public getPerformanceStats() {
    return {
      ...this.performanceMetrics,
      currentFPS: 1000 / this.performanceMetrics.averageFrameTime,
      dropFrameRate: this.performanceMetrics.droppedFrames / this.performanceMetrics.totalFrames
    };
  }

  /**
   * 事件监听
   */
  public on(eventType: string, listener: (event: RhythmSyncEvent) => void): void {
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
  private emitEvent(event: RhythmSyncEvent): void {
    const listeners = this.eventListeners.get(event.type);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error(`🎵 [Rhythm] 事件监听器错误:`, error);
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
   * 获取当前执行状态
   */
  public getExecutionState(): RhythmExecutionState {
    return { ...this.executionState };
  }

  /**
   * 创建基于情绪的节奏段
   */
  public static createEmotionBasedSegment(
    id: string,
    state: PetState,
    emotion: EmotionType,
    behaviors: BehaviorDefinition[]
  ): RhythmSegment {
    // 根据情绪类型调整节奏参数
    let mode: RhythmMode;
    let beatConfig: BeatConfig;
    let duration: number;

    switch (emotion) {
      case EmotionType.Excited:
        mode = RhythmMode.PULSE;
        beatConfig = { bpm: 140, beatDivision: 4 };
        duration = 10000;
        break;
      
      case EmotionType.Calm:
        mode = RhythmMode.CONTINUOUS;
        beatConfig = { bpm: 80, beatDivision: 2 };
        duration = 20000;
        break;
      
      case EmotionType.Curious:
        mode = RhythmMode.ADAPTIVE;
        beatConfig = { bpm: 110, beatDivision: 8 };
        duration = 15000;
        break;
      
      case EmotionType.Focused:
        mode = RhythmMode.SYNCED;
        beatConfig = { bpm: 100, beatDivision: 4 };
        duration = 30000;
        break;
      
      default:
        mode = RhythmMode.SEQUENCE;
        beatConfig = { bpm: 120, beatDivision: 4 };
        duration = 12000;
    }

    return {
      id,
      duration,
      mode,
      beatConfig,
      frameConfig: {
        targetFPS: 60,
        maxFrameTime: 16.67,
        adaptiveFrameRate: true,
        skipFrameThreshold: 33.33
      },
      behaviors
    };
  }

  /**
   * 设置节奏适配监听器
   */
  private setupAdaptationListeners(): void {
    // T5-C: 监听适配决策更新
    this.adaptationManager.on('adaptation_decision', (decision: RhythmAdaptationDecision) => {
      console.log(`🎵 [Rhythm] 收到节奏适配决策: ${JSON.stringify(decision)}`);
      
      // 根据适配决策调整节奏段
      this.applyAdaptationDecision(decision);
    });
  }

  /**
   * 应用节奏适配决策
   */
  private applyAdaptationDecision(decision: RhythmAdaptationDecision): void {
    // T5-C: 应用适配决策
    if (decision.targetMode && decision.targetMode !== this.currentMode) {
      this.currentMode = decision.targetMode;
      
      console.log(`🎵 [Rhythm] 切换节奏模式: ${this.currentMode}`);
      
      // 根据新模式调整当前节奏段
      if (this.executionState.currentSegment) {
        // 映射适配模式到RhythmMode
        const rhythmMode = this.mapAdaptationModeToRhythmMode(decision.targetMode);
        this.executionState.currentSegment.mode = rhythmMode;
        
        // 应用BPM和强度设置
        if (decision.targetBPM && this.executionState.currentSegment.beatConfig) {
          this.executionState.currentSegment.beatConfig.bpm = decision.targetBPM;
        }
      }
    }
    
    // 记录适配执行
    this.lastAdaptationTime = Date.now();
  }

  /**
   * 映射适配模式到RhythmMode
   */
  private mapAdaptationModeToRhythmMode(targetMode: string): RhythmMode {
    switch (targetMode) {
      case 'steady':
        return RhythmMode.CONTINUOUS;
      case 'pulse':
        return RhythmMode.PULSE;
      case 'adaptive':
        return RhythmMode.ADAPTIVE;
      default:
        return RhythmMode.PULSE;
    }
  }

  /**
   * T5-C: 更新节奏上下文 - 外部调用接口
   */
  public updateRhythmContext(context: Partial<RhythmContext>): void {
    this.adaptationManager.updateRhythmContext(context);
  }

  /**
   * T5-C: 获取当前节奏适配上下文
   */
  public getCurrentRhythmContext(): RhythmContext | null {
    return this.adaptationManager.getCurrentContext();
  }

  /**
   * T5-C: 手动触发节奏重评估
   */
  public evaluateRhythmAdaptation(): RhythmAdaptationDecision | null {
    const decision = this.adaptationManager.applyAdaptation();
    if (decision) {
      this.applyAdaptationDecision(decision);
    }
    return decision;
  }

  /**
   * 销毁控制器
   */
  public destroy(): void {
    this.stop();
    this.segments.clear();
    this.eventListeners.clear();
    
    // T5-C: 销毁适配管理器
    this.adaptationManager.destroy();
    
    console.log('🎵 RhythmController 已销毁');
  }
}
