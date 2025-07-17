/**
 * SaintGrid 神宠系统 - 行为调度器
 * 根据主脑状态和情绪自动决策并调度行为
 */

import { PetState, EmotionType, EmotionContext, PluginContext } from '../types';
import { StrategyManager, StrategyContext, IBehaviorStrategy } from './BehaviorStrategy';
import { BehaviorRhythmManager } from '../modules/rhythm/BehaviorRhythmManager';
import { RhythmMode, type RhythmTickCallback } from '../types/BehaviorRhythm';
import { RhythmAdaptationEngine, createRhythmAdaptationEngine } from '../modules/rhythm/RhythmAdaptationEngine';

type RhythmModeType = typeof RhythmMode[keyof typeof RhythmMode];

// 行为类型定义
export enum BehaviorType {
  // 基础行为
  IDLE_ANIMATION = 'idle_animation',
  HOVER_FEEDBACK = 'hover_feedback',
  AWAKEN_RESPONSE = 'awaken_response',
  CONTROL_ACTIVATION = 'control_activation',
  
  // 情绪行为
  EMOTIONAL_EXPRESSION = 'emotional_expression',
  MOOD_TRANSITION = 'mood_transition',
  
  // 插件行为
  PLUGIN_TRIGGER = 'plugin_trigger',
  PLUGIN_CALLBACK = 'plugin_callback',
  
  // 交互行为
  USER_PROMPT = 'user_prompt',
  SYSTEM_NOTIFICATION = 'system_notification',
  
  // 延时行为
  DELAYED_ACTION = 'delayed_action',
  ANIMATION_SEQUENCE = 'animation_sequence'
}

// 行为定义接口
export interface BehaviorDefinition {
  type: BehaviorType;
  priority: number;          // 行为优先级 (1-10)
  duration?: number;         // 行为持续时间（毫秒）
  delay?: number;            // 延时执行（毫秒）
  animation?: string;        // 动画名称
  message?: string;          // 提示信息
  pluginId?: string;         // 关联插件ID
  metadata?: Record<string, any>; // 扩展数据
}

// 行为执行上下文
export interface BehaviorExecutionContext {
  state: PetState;
  emotion: EmotionContext;
  timestamp: number;
  sessionId: string;
  userContext?: PluginContext;
  parentBehavior?: BehaviorDefinition;
  metadata?: Record<string, any>;
}

// 行为决策规则映射表
type BehaviorRuleMap = {
  [state in PetState]: {
    [emotion in EmotionType]: BehaviorDefinition[]
  }
};

// 行为执行结果
export interface BehaviorExecutionResult {
  success: boolean;
  executedBehaviors: BehaviorDefinition[];
  duration: number;
  message?: string;
  error?: string;
  nextSchedule?: number; // 下次调度时间
}

/**
 * 行为调度器类
 */
export class BehaviorScheduler {
  private behaviorRules: BehaviorRuleMap;
  private activeBehaviors: Map<string, BehaviorDefinition> = new Map();
  private behaviorQueue: BehaviorDefinition[] = [];
  private scheduledBehaviors: Map<string, NodeJS.Timeout> = new Map();
  private sessionId: string = '';
  private strategyManager: StrategyManager;
  
  // 集成接口
  private emotionEngine?: any; // EmotionEngine实例
  private pluginRegistry?: any; // PluginRegistry实例
  private rhythmManager?: BehaviorRhythmManager; // RhythmManager 实例
  private rhythmAdaptationEngine: RhythmAdaptationEngine; // RhythmAdaptationEngine 实例
  private lastInteractionTimestamp: number = Date.now();
  
  constructor(emotionEngine?: any, pluginRegistry?: any) {
    this.sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.behaviorRules = this.initializeBehaviorRules();
    this.strategyManager = new StrategyManager();
    
    // 注入依赖
    this.emotionEngine = emotionEngine;
    this.pluginRegistry = pluginRegistry;
    this.rhythmManager = new BehaviorRhythmManager();
    this.rhythmAdaptationEngine = createRhythmAdaptationEngine();
    
    console.log(`🎯 BehaviorScheduler initialized with session: ${this.sessionId}`);
    if (emotionEngine) console.log(`🧠 EmotionEngine integrated`);
    if (pluginRegistry) console.log(`🔌 PluginRegistry integrated`);
    console.log(`🎵 RhythmAdaptationEngine integrated`);
    
    // 注册节奏回调
    this.registerRhythmCallbacks();
  }

  /**
   * 注册自定义策略
   */
  public registerStrategy(strategy: IBehaviorStrategy): void {
    this.strategyManager.registerStrategy(strategy);
  }

  /**
   * 移除策略
   */
  public removeStrategy(name: string): void {
    this.strategyManager.removeStrategy(name);
  }

  /**
   * 获取所有策略信息
   */
  public getStrategies(): { name: string; description: string; priority: number; }[] {
    return this.strategyManager.getStrategies();
  }

  /**
   * 更新最后交互时间
   */
  public updateLastInteraction(): void {
    this.lastInteractionTimestamp = Date.now();
  }

  /**
   * 获取最后交互时间
   */
  private getLastInteractionTime(): number {
    return this.lastInteractionTimestamp;
  }

  /**
   * 获取当前时段
   */
  private getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
  }

  /**
   * 获取系统负载（模拟）
   */
  private getSystemLoad(): number {
    // 这里可以集成实际的系统监控
    return Math.random() * 100;
  }

  /**
   * 获取用户活动状态
   */
  private getUserActivity(): 'active' | 'idle' | 'away' {
    const timeSinceLastInteraction = Date.now() - this.lastInteractionTimestamp;
    if (timeSinceLastInteraction < 60000) return 'active'; // 1分钟内
    if (timeSinceLastInteraction < 300000) return 'idle'; // 5分钟内
    return 'away';
  }

  /**
   * 初始化行为决策规则映射表
   */
  private initializeBehaviorRules(): BehaviorRuleMap {
    return {
      [PetState.Idle]: {
        [EmotionType.Happy]: [
          {
            type: BehaviorType.IDLE_ANIMATION,
            priority: 3,
            duration: 2000,
            animation: 'happy_idle',
            message: '😊 神宠正在开心地等待...'
          },
          {
            type: BehaviorType.EMOTIONAL_EXPRESSION,
            priority: 2,
            duration: 1500,
            message: '✨ 散发着愉悦的光芒'
          }
        ],
        [EmotionType.Calm]: [
          {
            type: BehaviorType.IDLE_ANIMATION,
            priority: 2,
            duration: 3000,
            animation: 'calm_idle',
            message: '😌 神宠正在静静地冥想...'
          }
        ],
        [EmotionType.Excited]: [
          {
            type: BehaviorType.IDLE_ANIMATION,
            priority: 4,
            duration: 1000,
            animation: 'excited_idle',
            message: '🎉 神宠兴奋地期待着互动！'
          },
          {
            type: BehaviorType.USER_PROMPT,
            priority: 3,
            delay: 2000,
            message: '💫 看起来有什么有趣的事情要发生了！'
          }
        ],
        [EmotionType.Curious]: [
          {
            type: BehaviorType.IDLE_ANIMATION,
            priority: 3,
            duration: 2500,
            animation: 'curious_idle',
            message: '🔍 神宠好奇地观察着周围...'
          }
        ],
        [EmotionType.Sleepy]: [
          {
            type: BehaviorType.IDLE_ANIMATION,
            priority: 2,
            duration: 4000,
            animation: 'sleepy_idle',
            message: '😴 神宠正在打瞌睡...'
          }
        ],
        [EmotionType.Focused]: [
          {
            type: BehaviorType.IDLE_ANIMATION,
            priority: 2,
            duration: 3000,
            animation: 'focused_idle',
            message: '🎯 神宠正在专注地思考...'
          }
        ]
      },
      [PetState.Hover]: {
        [EmotionType.Happy]: [
          {
            type: BehaviorType.HOVER_FEEDBACK,
            priority: 5,
            duration: 800,
            animation: 'happy_hover',
            message: '😊 神宠感受到了你的关注！'
          }
        ],
        [EmotionType.Calm]: [
          {
            type: BehaviorType.HOVER_FEEDBACK,
            priority: 3,
            duration: 1200,
            animation: 'calm_hover',
            message: '😌 神宠平静地回应你的注视'
          }
        ],
        [EmotionType.Excited]: [
          {
            type: BehaviorType.HOVER_FEEDBACK,
            priority: 6,
            duration: 600,
            animation: 'excited_hover',
            message: '🎉 神宠兴奋地迎接你的互动！'
          },
          {
            type: BehaviorType.USER_PROMPT,
            priority: 4,
            delay: 1000,
            message: '✨ 点击我来开始对话吧！'
          }
        ],
        [EmotionType.Curious]: [
          {
            type: BehaviorType.HOVER_FEEDBACK,
            priority: 4,
            duration: 1000,
            animation: 'curious_hover',
            message: '🔍 神宠好奇地看着你...'
          }
        ],
        [EmotionType.Sleepy]: [
          {
            type: BehaviorType.HOVER_FEEDBACK,
            priority: 2,
            duration: 1500,
            animation: 'sleepy_hover',
            message: '😴 神宠迷迷糊糊地注意到了你'
          }
        ],
        [EmotionType.Focused]: [
          {
            type: BehaviorType.HOVER_FEEDBACK,
            priority: 3,
            duration: 1000,
            animation: 'focused_hover',
            message: '🎯 神宠专注地关注着你'
          }
        ]
      },
      [PetState.Awaken]: {
        [EmotionType.Happy]: [
          {
            type: BehaviorType.AWAKEN_RESPONSE,
            priority: 7,
            duration: 1000,
            animation: 'happy_awaken',
            message: '😊 神宠开心地醒来了！'
          },
          {
            type: BehaviorType.PLUGIN_TRIGGER,
            priority: 6,
            delay: 500,
            message: '🔌 启动互动插件...'
          }
        ],
        [EmotionType.Calm]: [
          {
            type: BehaviorType.AWAKEN_RESPONSE,
            priority: 5,
            duration: 1500,
            animation: 'calm_awaken',
            message: '😌 神宠平静地被唤醒'
          }
        ],
        [EmotionType.Excited]: [
          {
            type: BehaviorType.AWAKEN_RESPONSE,
            priority: 8,
            duration: 800,
            animation: 'excited_awaken',
            message: '🎉 神宠兴奋地跳起来！'
          },
          {
            type: BehaviorType.PLUGIN_TRIGGER,
            priority: 7,
            delay: 200,
            message: '⚡ 快速启动所有功能！'
          }
        ],
        [EmotionType.Curious]: [
          {
            type: BehaviorType.AWAKEN_RESPONSE,
            priority: 6,
            duration: 1200,
            animation: 'curious_awaken',
            message: '🔍 神宠好奇地被唤醒'
          }
        ],
        [EmotionType.Sleepy]: [
          {
            type: BehaviorType.AWAKEN_RESPONSE,
            priority: 3,
            duration: 2000,
            animation: 'sleepy_awaken',
            message: '😴 神宠慢慢地醒来...'
          }
        ],
        [EmotionType.Focused]: [
          {
            type: BehaviorType.AWAKEN_RESPONSE,
            priority: 6,
            duration: 1000,
            animation: 'focused_awaken',
            message: '🎯 神宠专注地被激活'
          }
        ]
      },
      [PetState.Control]: {
        [EmotionType.Happy]: [
          {
            type: BehaviorType.CONTROL_ACTIVATION,
            priority: 8,
            duration: 1200,
            animation: 'happy_control',
            message: '😊 神宠开心地进入控制模式！'
          },
          {
            type: BehaviorType.PLUGIN_TRIGGER,
            priority: 7,
            delay: 300,
            message: '🎮 启动控制面板...'
          }
        ],
        [EmotionType.Calm]: [
          {
            type: BehaviorType.CONTROL_ACTIVATION,
            priority: 6,
            duration: 1500,
            animation: 'calm_control',
            message: '😌 神宠平静地进入控制模式'
          }
        ],
        [EmotionType.Excited]: [
          {
            type: BehaviorType.CONTROL_ACTIVATION,
            priority: 9,
            duration: 1000,
            animation: 'excited_control',
            message: '🎉 神宠兴奋地进入超级控制模式！'
          },
          {
            type: BehaviorType.PLUGIN_TRIGGER,
            priority: 8,
            delay: 100,
            message: '🚀 所有系统全速启动！'
          }
        ],
        [EmotionType.Curious]: [
          {
            type: BehaviorType.CONTROL_ACTIVATION,
            priority: 7,
            duration: 1300,
            animation: 'curious_control',
            message: '🔍 神宠好奇地探索控制选项'
          }
        ],
        [EmotionType.Sleepy]: [
          {
            type: BehaviorType.CONTROL_ACTIVATION,
            priority: 4,
            duration: 2000,
            animation: 'sleepy_control',
            message: '😴 神宠困倦地进入控制模式...'
          }
        ],
        [EmotionType.Focused]: [
          {
            type: BehaviorType.CONTROL_ACTIVATION,
            priority: 8,
            duration: 1100,
            animation: 'focused_control',
            message: '🎯 神宠专注地进入精确控制模式'
          }
        ]
      }
    };
  }

  /**
   * 主要调度方法 - 根据状态和情绪调度行为（增强版）
   */
  public async schedule(state: PetState, emotion: EmotionType, context?: PluginContext): Promise<BehaviorExecutionResult> {
    const startTime = Date.now();
    
    // 从EmotionEngine获取详细情绪上下文（如果可用）
    let emotionContext: EmotionContext;
    if (this.emotionEngine && typeof this.emotionEngine.getCurrentContext === 'function') {
      emotionContext = this.emotionEngine.getCurrentContext();
    } else {
      // 构建默认情绪上下文
      emotionContext = {
        currentEmotion: emotion,
        intensity: 0.7,
        duration: 30000,
        triggers: ['state_change'],
        history: []
      };
    }

    // 构建策略上下文
    const strategyContext: StrategyContext = {
      state,
      emotion,
      emotionContext,
      pluginContext: context,
      timestamp: startTime,
      userPresence: true,
      lastInteraction: Date.now() - this.getLastInteractionTime(),
      environmentFactors: {
        timeOfDay: this.getTimeOfDay(),
        systemLoad: this.getSystemLoad(),
        userActivity: this.getUserActivity()
      }
    };

    // 构建执行上下文
    const executionContext: BehaviorExecutionContext = {
      state,
      emotion: emotionContext,
      timestamp: startTime,
      sessionId: this.sessionId,
      userContext: context
    };

    console.log(`🎯 [行为调度] 状态: ${state} | 情绪: ${emotion} | 强度: ${emotionContext.intensity?.toFixed(2)} | 会话: ${this.sessionId}`);
    
    // 更新节奏适配引擎上下文
    this.rhythmAdaptationEngine.updateRhythmByContext(state, emotion, startTime);
    const adaptedRhythm = this.rhythmAdaptationEngine.getCurrentRhythm();
    
    // 集成节奏控制 - 让行为执行与节拍同步
    if (this.rhythmManager) {
      // 应用适配引擎决定的节奏模式
      this.rhythmManager.setRhythmMode(adaptedRhythm);
      
      if (this.rhythmManager.isActive()) {
        const rhythmState = this.rhythmManager.getCurrentState();
        console.log(`🎵 [节奏集成] 适配节奏: ${adaptedRhythm} | 当前节奏: ${rhythmState.currentMode} | 间隔: ${rhythmState.currentInterval}ms`);
        
        // 根据情绪强度自适应节奏
        if (rhythmState.currentMode === RhythmMode.ADAPTIVE) {
          this.rhythmManager.adaptToEmotion(emotionContext.intensity);
        }
      }
    }
    
    try {
      // 使用策略系统生成行为
      const strategyBehaviors = this.strategyManager.generateBehaviors(strategyContext);
      
      // 如果策略系统没有生成行为，回退到传统规则系统
      const legacyBehaviors = strategyBehaviors.length === 0 ? 
        this.findMatchingBehaviors(state, emotion, context) : [];
      
      const allBehaviors = [...strategyBehaviors, ...legacyBehaviors];
      
      if (allBehaviors.length === 0) {
        console.warn(`⚠️ [行为调度] 未找到匹配的行为规则 | 状态: ${state} | 情绪: ${emotion}`);
        return {
          success: false,
          executedBehaviors: [],
          duration: Date.now() - startTime,
          nextSchedule: this.calculateNextScheduleTime(state, emotion)
        };
      }

      // 执行行为
      const executedBehaviors = await this.executeBehaviors(allBehaviors, executionContext);
      const duration = Date.now() - startTime;
      
      console.log(`✅ [行为调度] 调度完成 | 执行了 ${executedBehaviors.length} 个行为 | 耗时: ${duration}ms`);
      
      return {
        success: true,
        executedBehaviors,
        duration,
        nextSchedule: this.calculateNextScheduleTime(state, emotion)
      };
      
    } catch (error) {
      console.error(`❌ [行为调度] 调度失败:`, error);
      return {
        success: false,
        executedBehaviors: [],
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * 传统行为调度方法（向后兼容）
   */
  public async scheduleLegacy(state: PetState, emotion: EmotionType, context?: PluginContext): Promise<BehaviorExecutionResult> {
    const startTime = Date.now();
    
    // 构建执行上下文
    const emotionContext: EmotionContext = {
      currentEmotion: emotion,
      intensity: 0.7,
      duration: 30000,
      triggers: ['state_change'],
      history: []
    };
    
    const executionContext: BehaviorExecutionContext = {
      state,
      emotion: emotionContext,
      timestamp: startTime,
      sessionId: this.sessionId,
      userContext: context
    };
    
    console.log(`🎯 [BehaviorScheduler] 开始调度 | 状态: ${state} | 情绪: ${emotion} | 会话: ${this.sessionId}`);
    
    try {
      const behaviors = this.findMatchingBehaviors(state, emotion, context);
      
      if (behaviors.length === 0) {
        console.log(`⚠️ [BehaviorScheduler] 未找到匹配的行为规则 | 状态: ${state} | 情绪: ${emotion}`);
        return {
          success: false,
          executedBehaviors: [],
          duration: Date.now() - startTime,
          nextSchedule: this.calculateNextScheduleTime(state, emotion)
        };
      }

      const executedBehaviors = await this.executeBehaviors(behaviors, executionContext);
      const duration = Date.now() - startTime;
      
      console.log(`✅ [BehaviorScheduler] 调度完成 | 执行了 ${executedBehaviors.length} 个行为 | 耗时: ${duration}ms`);
      
      return {
        success: true,
        executedBehaviors,
        duration,
        nextSchedule: this.calculateNextScheduleTime(state, emotion)
      };
      
    } catch (error) {
      console.error(`❌ [BehaviorScheduler] 调度失败:`, error);
      return {
        success: false,
        executedBehaviors: [],
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * 查找匹配的行为规则
   */
  private findMatchingBehaviors(state: PetState, emotion: EmotionType, context?: PluginContext): BehaviorDefinition[] {
    // 从规则映射表中获取匹配的行为
    const behaviors = this.behaviorRules[state]?.[emotion] || [];
    
    // 按优先级排序
    return behaviors.sort((a, b) => b.priority - a.priority);
  }

  /**
   * 执行行为列表
   */
  private async executeBehaviors(behaviors: BehaviorDefinition[], context: BehaviorExecutionContext): Promise<BehaviorDefinition[]> {
    const executed: BehaviorDefinition[] = [];
    
    for (const behavior of behaviors) {
      try {
        if (behavior.delay && behavior.delay > 0) {
          // 延时执行
          const behaviorId = `${behavior.type}-${Date.now()}`;
          console.log(`⏰ [BehaviorScheduler] 延时执行行为: ${behavior.type} | 延时: ${behavior.delay}ms`);
          
          const timeoutId = setTimeout(async () => {
            await this.executeBehavior(behavior, context);
            this.scheduledBehaviors.delete(behaviorId);
          }, behavior.delay);
          
          this.scheduledBehaviors.set(behaviorId, timeoutId);
        } else {
          // 立即执行
          await this.executeBehavior(behavior, context);
        }
        
        executed.push(behavior);
      } catch (error) {
        console.error(`❌ [BehaviorScheduler] 执行行为失败:`, behavior.type, error);
      }
    }
    
    return executed;
  }

  /**
   * 执行单个行为
   */
  private async executeBehavior(behavior: BehaviorDefinition, context: BehaviorExecutionContext): Promise<void> {
    const { state, emotion } = context;
    
    console.log(`🎬 [BehaviorScheduler] 执行行为: ${behavior.type} | 状态: ${state} | 情绪: ${emotion.currentEmotion} | 优先级: ${behavior.priority}`);
    
    if (behavior.message) {
      console.log(`💬 [BehaviorScheduler] 行为消息: ${behavior.message}`);
    }

    // 根据行为类型执行相应逻辑
    switch (behavior.type) {
      case BehaviorType.IDLE_ANIMATION:
        // 空闲动画
        break;
        
      case BehaviorType.HOVER_FEEDBACK:
        // 悬浮反馈
        break;
        
      case BehaviorType.AWAKEN_RESPONSE:
        // 唤醒响应
        break;
        
      case BehaviorType.CONTROL_ACTIVATION:
        // 控制激活
        break;
        
      case BehaviorType.EMOTIONAL_EXPRESSION:
        // 情绪表达
        break;
        
      case BehaviorType.MOOD_TRANSITION:
        // 心情转换
        break;
        
      case BehaviorType.PLUGIN_TRIGGER:
        // 插件触发
        if (this.pluginRegistry && behavior.pluginId) {
          // 触发插件
        }
        break;
        
      case BehaviorType.USER_PROMPT:
        // 用户提示
        break;
        
      case BehaviorType.SYSTEM_NOTIFICATION:
        // 系统通知
        break;
        
      default:
        console.warn(`⚠️ [BehaviorScheduler] 未知的行为类型: ${behavior.type}`);
    }

    // 模拟行为持续时间
    if (behavior.duration && behavior.duration > 0) {
      await new Promise(resolve => setTimeout(resolve, behavior.duration));
    }
  }

  /**
   * 计算下次调度时间
   */
  private calculateNextScheduleTime(state: PetState, emotion: EmotionType): number {
    // 基础间隔
    let baseInterval = 5000; // 5秒

    // 根据状态调整
    switch (state) {
      case PetState.Idle:
        baseInterval = 10000; // 空闲时较长间隔
        break;
      case PetState.Hover:
        baseInterval = 3000;  // 悬浮时较短间隔
        break;
      case PetState.Awaken:
        baseInterval = 2000;  // 唤醒时频繁调度
        break;
      case PetState.Control:
        baseInterval = 1000;  // 控制状态最频繁
        break;
    }

    // 根据情绪调整
    switch (emotion) {
      case EmotionType.Excited:
        baseInterval *= 0.7; // 兴奋时加快
        break;
      case EmotionType.Calm:
        baseInterval *= 1.5; // 平静时放慢
        break;
      case EmotionType.Sleepy:
        baseInterval *= 2.0; // 困倦时大幅放慢
        break;
    }

    return Date.now() + baseInterval;
  }

  // 节奏管理器相关方法
  /**
   * 注册节奏回调
   */
  private registerRhythmCallbacks(): void {
    if (!this.rhythmManager) return;
    
    // 注册节拍回调 - 用于控制行为执行的节奏
    this.rhythmManager.tick((timestamp, interval) => {
      this.onRhythmTick(timestamp, interval);
    });
    
    // 监听节奏模式变化
    this.rhythmManager.onRhythmChange((mode, config) => {
      console.log(`🎵 [BehaviorScheduler] 节奏模式变化: ${mode}, 间隔: ${config.baseInterval}ms`);
    });
    
    console.log(`🕰️ [BehaviorScheduler] 节奏管理器已集成`);
  }

  /**
   * 节拍回调 - 在节拍器节拍时调用
   */
  private onRhythmTick(timestamp: number, interval: number): void {
    // 可以在这里添加基于节拍的行为逻辑
    // 比如定期检查状态变化、触发周期性行为等
    if (process.env.NODE_ENV === 'development') {
      // 仅在开发模式下输出调试信息
      console.log(`🎵 [Rhythm] 节拍触发 - 间隔: ${interval}ms`);
    }
  }

  /**
   * 设置行为节奏模式
   */
  public setRhythmMode(mode: RhythmModeType): void {
    if (this.rhythmManager) {
      this.rhythmManager.setRhythmMode(mode);
      console.log(`🎵 [BehaviorScheduler] 切换至节奏模式: ${mode}`);
    }
  }

  /**
   * 启动节奏管理器
   */
  public startRhythm(): void {
    if (this.rhythmManager) {
      this.rhythmManager.start();
      console.log(`🎵 [BehaviorScheduler] 节奏管理器已启动`);
    }
  }

  /**
   * 停止节奏管理器
   */
  public stopRhythm(): void {
    if (this.rhythmManager) {
      this.rhythmManager.stop();
      console.log(`🎵 [BehaviorScheduler] 节奏管理器已停止`);
    }
  }

  /**
   * 清理资源
   */
  public dispose(): void {
    // 清理计划中的行为
    this.scheduledBehaviors.forEach(timeoutId => clearTimeout(timeoutId));
    this.scheduledBehaviors.clear();
    
    // 清理节奏管理器
    if (this.rhythmManager) {
      this.rhythmManager.dispose();
    }
    
    console.log(`🧹 [BehaviorScheduler] 资源已清理`);
  }

  /**
   * 销毁调度器（向后兼容）
   */
  public destroy(): void {
    this.dispose();
  }

  /**
   * 获取行为统计信息
   */
  public getBehaviorStats() {
    return {
      totalScheduled: this.scheduledBehaviors.size,
      activeTimers: this.scheduledBehaviors.size,
      sessionId: this.sessionId,
      lastInteraction: this.lastInteractionTimestamp
    };
  }

  /**
   * 添加行为规则（向后兼容）
   */
  public addBehaviorRule(state: PetState, emotion: EmotionType, behavior: BehaviorDefinition): void {
    if (!this.behaviorRules[state]) {
      this.behaviorRules[state] = {} as any;
    }
    if (!this.behaviorRules[state][emotion]) {
      this.behaviorRules[state][emotion] = [];
    }
    this.behaviorRules[state][emotion].push(behavior);
    console.log(`📋 [BehaviorScheduler] 添加行为规则: ${state}/${emotion} → ${behavior.type}`);
  }
}
