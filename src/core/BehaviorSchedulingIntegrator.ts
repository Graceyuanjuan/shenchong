/**
 * SaintGrid 神宠系统 - 行为调度集成接口
 * 为 PetBrain 提供统一的行为调度接口
 */

import { PetState, EmotionType, PluginContext } from '../types';
import { BehaviorScheduler, BehaviorExecutionResult } from './BehaviorScheduler';
import { IBehaviorStrategy } from './BehaviorStrategy';

/**
 * 行为调度管理器接口
 */
export interface IBehaviorSchedulingManager {
  /**
   * 调度行为
   */
  schedule(state: PetState, emotion: EmotionType, context?: PluginContext): Promise<BehaviorExecutionResult>;
  
  /**
   * 注册自定义策略
   */
  registerStrategy(strategy: IBehaviorStrategy): void;
  
  /**
   * 获取所有策略
   */
  getStrategies(): { name: string; description: string; priority: number; }[];
  
  /**
   * 更新最后交互时间
   */
  updateLastInteraction(): void;
}

/**
 * 行为调度集成器 - 桥接 PetBrain 和 BehaviorScheduler
 */
export class BehaviorSchedulingIntegrator implements IBehaviorSchedulingManager {
  private behaviorScheduler: BehaviorScheduler;
  // Reserved for future emotion integration
  // private emotionEngine: any;
  // private pluginRegistry: any;
  
  constructor(emotionEngine?: any, pluginRegistry?: any) {
    // this.emotionEngine = emotionEngine;
    // this.pluginRegistry = pluginRegistry;
    this.behaviorScheduler = new BehaviorScheduler(emotionEngine, pluginRegistry);
    
    console.log('🎭 BehaviorSchedulingIntegrator 初始化完成');
  }
  
  /**
   * 主要调度接口
   */
  public async schedule(state: PetState, emotion: EmotionType, context?: PluginContext): Promise<BehaviorExecutionResult> {
    // 更新交互时间
    this.updateLastInteraction();
    
    // 委托给 BehaviorScheduler 执行
    return await this.behaviorScheduler.schedule(state, emotion, context);
  }
  
  /**
   * 注册自定义策略
   */
  public registerStrategy(strategy: IBehaviorStrategy): void {
    this.behaviorScheduler.registerStrategy(strategy);
    console.log(`🎯 已注册自定义策略: ${strategy.name}`);
  }
  
  /**
   * 移除策略
   */
  public removeStrategy(name: string): void {
    this.behaviorScheduler.removeStrategy(name);
    console.log(`🗑️ 已移除策略: ${name}`);
  }
  
  /**
   * 获取所有策略信息
   */
  public getStrategies(): { name: string; description: string; priority: number; }[] {
    return this.behaviorScheduler.getStrategies();
  }
  
  /**
   * 更新最后交互时间
   */
  public updateLastInteraction(): void {
    this.behaviorScheduler.updateLastInteraction();
  }
  
  /**
   * 批量调度行为（状态转换时使用）
   */
  public async scheduleBatch(
    transitions: { state: PetState; emotion: EmotionType; context?: PluginContext; delay?: number }[]
  ): Promise<BehaviorExecutionResult[]> {
    const results: BehaviorExecutionResult[] = [];
    
    for (const transition of transitions) {
      if (transition.delay && transition.delay > 0) {
        await this.sleep(transition.delay);
      }
      
      const result = await this.schedule(transition.state, transition.emotion, transition.context);
      results.push(result);
    }
    
    return results;
  }
  
  /**
   * 情绪驱动调度 - 基于情绪变化自动调度
   */
  public async scheduleByEmotionChange(
    previousEmotion: EmotionType,
    newEmotion: EmotionType,
    currentState: PetState,
    context?: PluginContext
  ): Promise<BehaviorExecutionResult> {
    console.log(`😊➡️😔 [情绪变化调度] ${previousEmotion} -> ${newEmotion} | 状态: ${currentState}`);
    
    // 如果情绪发生了显著变化，触发过渡行为
    if (this.isSignificantEmotionChange(previousEmotion, newEmotion)) {
      // 可以在这里添加情绪过渡的特殊行为
      const transitionContext: PluginContext = {
        currentState,
        emotion: context?.emotion || {
          currentEmotion: newEmotion,
          intensity: 0.7,
          duration: 30000,
          triggers: ['emotion_change'],
          history: []
        },
        userPreferences: context?.userPreferences,
        stateHistory: context?.stateHistory,
        interaction: {
          type: 'passive',
          trigger: 'state_change',
          timestamp: Date.now()
        }
      };
      
      return await this.schedule(currentState, newEmotion, transitionContext);
    }
    
    // 普通情绪调度
    return await this.schedule(currentState, newEmotion, context);
  }
  
  /**
   * 状态驱动调度 - 基于状态变化自动调度
   */
  public async scheduleByStateChange(
    previousState: PetState,
    newState: PetState,
    currentEmotion: EmotionType,
    context?: PluginContext
  ): Promise<BehaviorExecutionResult> {
    console.log(`🔄 [状态变化调度] ${previousState} -> ${newState} | 情绪: ${currentEmotion}`);
    
    // 状态转换特殊处理
    const transitionContext: PluginContext = {
      currentState: newState,
      emotion: context?.emotion || {
        currentEmotion: currentEmotion,
        intensity: 0.7,
        duration: 30000,
        triggers: ['state_change'],
        history: []
      },
      userPreferences: context?.userPreferences,
      stateHistory: context?.stateHistory ? [...context.stateHistory, previousState] : [previousState],
      interaction: {
        type: 'passive',
        trigger: 'state_change',
        timestamp: Date.now()
      }
    };
    
    return await this.schedule(newState, currentEmotion, transitionContext);
  }
  
  /**
   * 智能调度 - 基于时间和环境因素自动调度
   */
  public async scheduleIntelligent(
    state: PetState,
    emotion: EmotionType,
    options?: {
      respectCooldown?: boolean;
      prioritizeUserInteraction?: boolean;
      adaptToEnvironment?: boolean;
    }
  ): Promise<BehaviorExecutionResult> {
    const opts = {
      respectCooldown: true,
      prioritizeUserInteraction: true,
      adaptToEnvironment: true,
      ...options
    };
    
    // 可以在这里添加更复杂的调度逻辑
    // 例如：冷却时间检查、环境适应、用户偏好等
    
    console.log(`🧠 [智能调度] 选项:`, opts);
    
    return await this.schedule(state, emotion);
  }
  
  /**
   * 获取调度统计信息
   */
  public getSchedulingStats(): {
    totalSchedules: number;
    successRate: number;
    averageExecutionTime: number;
    lastScheduleTime: number;
  } {
    // 这里可以从 BehaviorScheduler 获取统计信息
    return {
      totalSchedules: 0,
      successRate: 1.0,
      averageExecutionTime: 100,
      lastScheduleTime: Date.now()
    };
  }
  
  /**
   * 判断是否为显著的情绪变化
   */
  private isSignificantEmotionChange(previous: EmotionType, current: EmotionType): boolean {
    if (previous === current) return false;
    
    // 定义情绪变化的显著性
    const significantChanges = [
      [EmotionType.Calm, EmotionType.Excited],
      [EmotionType.Excited, EmotionType.Sleepy],
      [EmotionType.Happy, EmotionType.Sleepy],
      [EmotionType.Sleepy, EmotionType.Excited]
    ];
    
    return significantChanges.some(([from, to]) => 
      (previous === from && current === to) || (previous === to && current === from)
    );
  }
  
  /**
   * 睡眠工具方法
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * 为 PetBrain 提供的便捷工厂函数
 */
export function createBehaviorSchedulingManager(
  emotionEngine?: any,
  pluginRegistry?: any
): IBehaviorSchedulingManager {
  return new BehaviorSchedulingIntegrator(emotionEngine, pluginRegistry);
}

/**
 * 行为调度事件类型
 */
export enum BehaviorScheduleEvent {
  SCHEDULE_STARTED = 'schedule_started',
  SCHEDULE_COMPLETED = 'schedule_completed',
  SCHEDULE_FAILED = 'schedule_failed',
  STRATEGY_APPLIED = 'strategy_applied',
  BEHAVIOR_EXECUTED = 'behavior_executed',
  EMOTION_CHANGED = 'emotion_changed',
  STATE_CHANGED = 'state_changed'
}

/**
 * 事件驱动的行为调度器（可选扩展）
 */
export class EventDrivenBehaviorScheduler extends BehaviorSchedulingIntegrator {
  private eventListeners: Map<BehaviorScheduleEvent, Function[]> = new Map();
  
  constructor(emotionEngine?: any, pluginRegistry?: any) {
    super(emotionEngine, pluginRegistry);
    console.log('📡 EventDrivenBehaviorScheduler 初始化完成');
  }
  
  /**
   * 监听调度事件
   */
  public on(event: BehaviorScheduleEvent, listener: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }
  
  /**
   * 移除事件监听器
   */
  public off(event: BehaviorScheduleEvent, listener: Function): void {
    const listeners = this.eventListeners.get(event);
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
  private emit(event: BehaviorScheduleEvent, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`❌ Event listener error for ${event}:`, error);
        }
      });
    }
  }
  
  /**
   * 重写调度方法以支持事件
   */
  public async schedule(state: PetState, emotion: EmotionType, context?: PluginContext): Promise<BehaviorExecutionResult> {
    this.emit(BehaviorScheduleEvent.SCHEDULE_STARTED, { state, emotion, context });
    
    try {
      const result = await super.schedule(state, emotion, context);
      this.emit(BehaviorScheduleEvent.SCHEDULE_COMPLETED, { state, emotion, context, result });
      return result;
    } catch (error) {
      this.emit(BehaviorScheduleEvent.SCHEDULE_FAILED, { state, emotion, context, error });
      throw error;
    }
  }
}
