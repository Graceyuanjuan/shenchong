/**
 * SaintGrid 神宠系统 - 行为调度器
 * 根据主脑状态和情绪自动决策并调度行为
 */

import { PetState, EmotionType, EmotionContext, PluginContext } from '../types';
import { StrategyManager, StrategyContext, IBehaviorStrategy } from './BehaviorStrategy';

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
  private lastInteractionTimestamp: number = Date.now();
  
  constructor(emotionEngine?: any, pluginRegistry?: any) {
    this.sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.behaviorRules = this.initializeBehaviorRules();
    this.strategyManager = new StrategyManager();
    
    // 注入依赖
    this.emotionEngine = emotionEngine;
    this.pluginRegistry = pluginRegistry;
    
    console.log(`🎯 BehaviorScheduler initialized with session: ${this.sessionId}`);
    if (emotionEngine) console.log(`🧠 EmotionEngine integrated`);
    if (pluginRegistry) console.log(`🔌 PluginRegistry integrated`);
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
    
    try {
      // 使用策略系统生成行为
      const strategyBehaviors = this.strategyManager.generateBehaviors(strategyContext);
      
      // 如果策略系统没有生成行为，回退到传统规则系统
      let allBehaviors = [...strategyBehaviors];
      if (strategyBehaviors.length === 0) {
        console.log(`📋 [行为调度] 策略系统无匹配行为，回退到传统规则`);
        const fallbackBehaviors = this.getBehaviorRules(state, emotion);
        allBehaviors = [...fallbackBehaviors];
      }
      
      if (allBehaviors.length === 0) {
        console.log(`⚠️ [行为调度] 未找到任何可执行行为 | 状态: ${state} | 情绪: ${emotion}`);
        return {
          success: false,
          executedBehaviors: [],
          duration: Date.now() - startTime,
          message: '未找到匹配的行为规则'
        };
      }

      // 按优先级排序
      const sortedBehaviors = allBehaviors.sort((a, b) => b.priority - a.priority);
      console.log(`📋 [行为调度] 准备执行 ${sortedBehaviors.length} 个行为，优先级: [${sortedBehaviors.map(b => b.priority).join(', ')}]`);
      
      // 执行行为
      const executedBehaviors = await this.executeBehaviors(sortedBehaviors, executionContext);
      
      const duration = Date.now() - startTime;
      
      console.log(`✅ [行为调度] 调度完成 | 执行了 ${executedBehaviors.length} 个行为 | 耗时: ${duration}ms`);
      
      return {
        success: true,
        executedBehaviors,
        duration,
        message: `成功执行了 ${executedBehaviors.length} 个行为`,
        nextSchedule: this.calculateNextScheduleTime(state, emotion)
      };
      
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ [行为调度] 调度失败:`, error);
      
      return {
        success: false,
        executedBehaviors: [],
        duration,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 传统调度方法（保持向后兼容）
   */
  public async scheduleLegacy(state: PetState, emotion: EmotionType, context?: PluginContext): Promise<BehaviorExecutionResult> {
    const startTime = Date.now();
    
    // 构建情绪上下文
    const emotionContext: EmotionContext = {
      currentEmotion: emotion,
      intensity: 0.7, // 默认强度
      duration: 30000, // 默认持续时间
      triggers: ['state_change'],
      history: []
    };

    // 构建执行上下文
    const executionContext: BehaviorExecutionContext = {
      state,
      emotion: emotionContext,
      timestamp: startTime,
      sessionId: this.sessionId,
      userContext: context
    };

    // 输出调度日志
    console.log(`🎯 [BehaviorScheduler] 开始调度 | 状态: ${state} | 情绪: ${emotion} | 会话: ${this.sessionId}`);
    
    try {
      // 获取匹配的行为规则
      const matchedBehaviors = this.getBehaviorRules(state, emotion);
      
      if (matchedBehaviors.length === 0) {
        console.log(`⚠️ [BehaviorScheduler] 未找到匹配的行为规则 | 状态: ${state} | 情绪: ${emotion}`);
        return {
          success: false,
          executedBehaviors: [],
          duration: Date.now() - startTime,
          message: '未找到匹配的行为规则'
        };
      }

      // 按优先级排序
      const sortedBehaviors = matchedBehaviors.sort((a, b) => b.priority - a.priority);
      
      // 执行行为
      const executedBehaviors = await this.executeBehaviors(sortedBehaviors, executionContext);
      
      const duration = Date.now() - startTime;
      
      console.log(`✅ [BehaviorScheduler] 调度完成 | 执行了 ${executedBehaviors.length} 个行为 | 耗时: ${duration}ms`);
      
      return {
        success: true,
        executedBehaviors,
        duration,
        message: `成功执行了 ${executedBehaviors.length} 个行为`,
        nextSchedule: this.calculateNextScheduleTime(state, emotion)
      };
      
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ [BehaviorScheduler] 调度失败:`, error);
      
      return {
        success: false,
        executedBehaviors: [],
        duration,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 获取状态和情绪对应的行为规则
   */
  private getBehaviorRules(state: PetState, emotion: EmotionType): BehaviorDefinition[] {
    const stateRules = this.behaviorRules[state];
    if (!stateRules) {
      return [];
    }

    const emotionRules = stateRules[emotion];
    if (!emotionRules) {
      return [];
    }

    return [...emotionRules]; // 返回副本
  }

  /**
   * 执行行为列表
   */
  private async executeBehaviors(behaviors: BehaviorDefinition[], context: BehaviorExecutionContext): Promise<BehaviorDefinition[]> {
    const executedBehaviors: BehaviorDefinition[] = [];
    
    for (const behavior of behaviors) {
      try {
        await this.executeSingleBehavior(behavior, context);
        executedBehaviors.push(behavior);
      } catch (error) {
        console.error(`❌ [BehaviorScheduler] 执行行为失败:`, behavior.type, error);
      }
    }
    
    return executedBehaviors;
  }

  /**
   * 执行单个行为
   */
  private async executeSingleBehavior(behavior: BehaviorDefinition, context: BehaviorExecutionContext): Promise<void> {
    const behaviorId = `${behavior.type}-${Date.now()}`;
    
    // 如果有延时，则安排延时执行
    if (behavior.delay && behavior.delay > 0) {
      console.log(`⏰ [BehaviorScheduler] 延时执行行为: ${behavior.type} | 延时: ${behavior.delay}ms`);
      
      return new Promise((resolve) => {
        const timeoutId = setTimeout(async () => {
          await this.performBehaviorAction(behavior, context);
          this.scheduledBehaviors.delete(behaviorId);
          resolve();
        }, behavior.delay);
        
        this.scheduledBehaviors.set(behaviorId, timeoutId);
      });
    } else {
      // 立即执行
      await this.performBehaviorAction(behavior, context);
    }
  }

  /**
   * 执行具体的行为动作
   */
  private async performBehaviorAction(behavior: BehaviorDefinition, context: BehaviorExecutionContext): Promise<void> {
    const { state, emotion } = context;
    
    // 输出行为执行日志
    console.log(`🎬 [BehaviorScheduler] 执行行为: ${behavior.type} | 状态: ${state} | 情绪: ${emotion.currentEmotion} | 优先级: ${behavior.priority}`);
    
    if (behavior.message) {
      console.log(`💬 [BehaviorScheduler] 行为消息: ${behavior.message}`);
    }
    
    // 根据行为类型执行相应动作
    switch (behavior.type) {
      case BehaviorType.IDLE_ANIMATION:
        await this.performAnimation(behavior);
        break;
        
      case BehaviorType.HOVER_FEEDBACK:
        await this.performHoverFeedback(behavior);
        break;
        
      case BehaviorType.AWAKEN_RESPONSE:
        await this.performAwakenResponse(behavior);
        break;
        
      case BehaviorType.CONTROL_ACTIVATION:
        await this.performControlActivation(behavior);
        break;
        
      case BehaviorType.EMOTIONAL_EXPRESSION:
        await this.performEmotionalExpression(behavior, context);
        break;
        
      case BehaviorType.PLUGIN_TRIGGER:
        await this.performPluginTrigger(behavior, context);
        break;
        
      case BehaviorType.USER_PROMPT:
        await this.performUserPrompt(behavior);
        break;
        
      case BehaviorType.SYSTEM_NOTIFICATION:
        await this.performSystemNotification(behavior);
        break;
        
      case BehaviorType.DELAYED_ACTION:
        await this.performDelayedAction(behavior, context);
        break;
        
      case BehaviorType.ANIMATION_SEQUENCE:
        await this.performAnimationSequence(behavior);
        break;
        
      default:
        console.warn(`⚠️ [BehaviorScheduler] 未知的行为类型: ${behavior.type}`);
    }
    
    // 如果有持续时间，则等待
    if (behavior.duration && behavior.duration > 0) {
      await this.sleep(behavior.duration);
    }
  }

  /**
   * 执行动画行为
   */
  private async performAnimation(behavior: BehaviorDefinition): Promise<void> {
    console.log(`🎨 [Animation] 播放动画: ${behavior.animation || 'default'}`);
    // 这里可以集成实际的动画系统
  }

  /**
   * 执行悬停反馈
   */
  private async performHoverFeedback(behavior: BehaviorDefinition): Promise<void> {
    console.log(`👆 [Hover] 悬停反馈: ${behavior.message || '检测到鼠标悬停'}`);
    // 这里可以集成实际的悬停反馈系统
  }

  /**
   * 执行唤醒响应
   */
  private async performAwakenResponse(behavior: BehaviorDefinition): Promise<void> {
    console.log(`🔥 [Awaken] 唤醒响应: ${behavior.message || '神宠被唤醒'}`);
    // 这里可以集成实际的唤醒系统
  }

  /**
   * 执行控制激活
   */
  private async performControlActivation(behavior: BehaviorDefinition): Promise<void> {
    console.log(`🎮 [Control] 控制激活: ${behavior.message || '进入控制模式'}`);
    // 这里可以集成实际的控制系统
  }

  /**
   * 执行情绪表达
   */
  private async performEmotionalExpression(behavior: BehaviorDefinition, context: BehaviorExecutionContext): Promise<void> {
    console.log(`😊 [Emotion] 情绪表达: ${context.emotion.currentEmotion} | ${behavior.message || '表达情绪'}`);
    // 这里可以集成实际的情绪表达系统
  }

  /**
   * 执行插件触发
   */
  private async performPluginTrigger(behavior: BehaviorDefinition, context: BehaviorExecutionContext): Promise<void> {
    console.log(`🔌 [Plugin] 触发插件: ${behavior.pluginId || 'all'} | ${behavior.message || '触发插件'}`);
    
    if (this.pluginRegistry && typeof this.pluginRegistry.triggerByState === 'function') {
      try {
        // 使用 PluginRegistry 触发插件
        const result = await this.pluginRegistry.triggerByState(
          context.state,
          context.emotion.currentEmotion,
          {
            source: 'behavior_scheduler',
            behaviorType: behavior.type,
            metadata: behavior.metadata || {},
            sessionId: this.sessionId
          }
        );
        console.log(`✅ [Plugin] 插件触发成功:`, result);
      } catch (error) {
        console.error(`❌ [Plugin] 插件触发失败:`, error);
      }
    } else if (behavior.pluginId && this.pluginRegistry && typeof this.pluginRegistry.executePlugin === 'function') {
      try {
        // 触发特定插件
        const result = await this.pluginRegistry.executePlugin(
          behavior.pluginId,
          {
            state: context.state,
            emotion: context.emotion.currentEmotion,
            context: context.userContext,
            metadata: behavior.metadata || {}
          }
        );
        console.log(`✅ [Plugin] 特定插件执行成功: ${behavior.pluginId}`, result);
      } catch (error) {
        console.error(`❌ [Plugin] 特定插件执行失败: ${behavior.pluginId}`, error);
      }
    } else {
      // 回退到日志输出
      console.log(`📝 [Plugin] 模拟触发: ${behavior.pluginId || 'general'} | 元数据:`, behavior.metadata);
    }
  }

  /**
   * 执行用户提示
   */
  private async performUserPrompt(behavior: BehaviorDefinition): Promise<void> {
    console.log(`💭 [Prompt] 用户提示: ${behavior.message || '显示提示'}`);
    // 这里可以集成实际的用户提示系统
  }

  /**
   * 执行系统通知
   */
  private async performSystemNotification(behavior: BehaviorDefinition): Promise<void> {
    console.log(`📢 [System] 系统通知: ${behavior.message || '系统通知'}`);
    // 这里可以集成实际的系统通知
  }

  /**
   * 执行延时动作
   */
  private async performDelayedAction(behavior: BehaviorDefinition, context: BehaviorExecutionContext): Promise<void> {
    console.log(`⏱️ [Delayed] 延时动作: ${behavior.message || '执行延时动作'}`);
    // 这里可以执行延时后的特定动作
  }

  /**
   * 执行动画序列
   */
  private async performAnimationSequence(behavior: BehaviorDefinition): Promise<void> {
    console.log(`🎭 [Sequence] 动画序列: ${behavior.animation || 'default_sequence'}`);
    // 这里可以集成复杂的动画序列
  }

  /**
   * 计算下次调度时间
   */
  private calculateNextScheduleTime(state: PetState, emotion: EmotionType): number {
    // 根据状态和情绪计算合适的下次调度时间
    const baseInterval = 5000; // 基础间隔 5 秒
    
    let multiplier = 1;
    
    // 根据状态调整
    switch (state) {
      case PetState.Idle:
        multiplier = 2; // 空闲状态调度频率较低
        break;
      case PetState.Hover:
        multiplier = 0.5; // 悬停状态调度频率较高
        break;
      case PetState.Awaken:
        multiplier = 0.3; // 唤醒状态调度频率最高
        break;
      case PetState.Control:
        multiplier = 0.8; // 控制状态调度频率较高
        break;
    }
    
    // 根据情绪调整
    switch (emotion) {
      case EmotionType.Excited:
        multiplier *= 0.5; // 兴奋时调度更频繁
        break;
      case EmotionType.Sleepy:
        multiplier *= 2; // 困倦时调度较少
        break;
      case EmotionType.Focused:
        multiplier *= 1.5; // 专注时调度较少
        break;
    }
    
    return Date.now() + (baseInterval * multiplier);
  }

  /**
   * 获取当前活跃的行为
   */
  public getActiveBehaviors(): BehaviorDefinition[] {
    return Array.from(this.activeBehaviors.values());
  }

  /**
   * 清除所有计划的行为
   */
  public clearScheduledBehaviors(): void {
    this.scheduledBehaviors.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    this.scheduledBehaviors.clear();
    console.log('🧹 [BehaviorScheduler] 已清除所有计划的行为');
  }

  /**
   * 添加自定义行为规则
   */
  public addBehaviorRule(state: PetState, emotion: EmotionType, behavior: BehaviorDefinition): void {
    if (!this.behaviorRules[state]) {
      this.behaviorRules[state] = {} as any;
    }
    if (!this.behaviorRules[state][emotion]) {
      this.behaviorRules[state][emotion] = [];
    }
    this.behaviorRules[state][emotion].push(behavior);
    console.log(`➕ [BehaviorScheduler] 添加行为规则: ${state} + ${emotion} -> ${behavior.type}`);
  }

  /**
   * 获取行为统计信息
   */
  public getBehaviorStats(): object {
    return {
      sessionId: this.sessionId,
      activeBehaviors: this.activeBehaviors.size,
      scheduledBehaviors: this.scheduledBehaviors.size,
      queuedBehaviors: this.behaviorQueue.length,
      totalRules: this.getTotalRulesCount()
    };
  }

  /**
   * 获取总规则数量
   */
  private getTotalRulesCount(): number {
    let count = 0;
    Object.values(this.behaviorRules).forEach(stateRules => {
      Object.values(stateRules).forEach(emotionRules => {
        count += emotionRules.length;
      });
    });
    return count;
  }

  /**
   * 工具方法：等待指定时间
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 销毁调度器
   */
  public destroy(): void {
    this.clearScheduledBehaviors();
    this.activeBehaviors.clear();
    this.behaviorQueue.length = 0;
    console.log('🗑️ [BehaviorScheduler] 调度器已销毁');
  }
}
