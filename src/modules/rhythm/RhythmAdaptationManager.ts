/**
 * T5-C | RhythmAdaptationManager - 节奏动态适配管理器
 * 构建节奏控制的高级适配机制，使系统行为节奏可根据用户情绪、时间段、用户操作频率自动调整
 */

import { EmotionType, PetState } from '../../types';
import { 
  RhythmContext, 
  RhythmAdaptationDecision, 
  RhythmAdaptationConfig,
  RhythmAwarenessRule,
  RhythmAdaptationStrategy,
  RhythmAdaptationHistory,
  UserInteractionStats,
  UserActivityLevel,
  TimeOfDay,
  getCurrentTimeOfDay,
  calculateActivityLevel,
  analyzeInteractionPattern
} from '../../types/rhythm/RhythmContext';

/**
 * 节奏适配策略管理器
 * 负责分析上下文并决定节奏调整策略
 */
export class RhythmAdaptationManager {
  private config: RhythmAdaptationConfig;
  private currentContext: RhythmContext | null = null;
  private lastUpdateTime: number = 0;
  private pendingUpdate: NodeJS.Timeout | null = null;
  private adaptationHistory: RhythmAdaptationHistory[] = [];
  private interactionTimestamps: Array<{ timestamp: number; type: string }> = [];
  
  // 事件监听器
  private eventListeners: Map<string, Function[]> = new Map();
  
  constructor(config?: Partial<RhythmAdaptationConfig>) {
    this.config = {
      enabled: true,
      updateIntervalMs: 2000,      // 2秒检查一次
      debounceMs: 1000,           // 1秒防抖
      maxAdaptationsPerMinute: 10,
      enableLogging: true,
      strategies: [
        RhythmAdaptationStrategy.EmotionDriven,
        RhythmAdaptationStrategy.InteractionDriven,
        RhythmAdaptationStrategy.TimeDriven,
        RhythmAdaptationStrategy.HybridDriven
      ],
      rules: this.createDefaultRules(),
      ...config
    };
    
    console.log('🎵 [RhythmAdaptation] 节奏适配管理器初始化完成');
    this.startPeriodicEvaluation();
  }

  /**
   * 更新节奏上下文
   */
  public updateRhythmContext(context: Partial<RhythmContext>): void {
    const now = Date.now();
    
    // 记录交互时间戳
    if (context.userStats?.lastInteractionTime) {
      this.interactionTimestamps.push({
        timestamp: context.userStats.lastInteractionTime,
        type: 'interaction'
      });
      
      // 保持最近30分钟的记录
      const thirtyMinutesAgo = now - 30 * 60 * 1000;
      this.interactionTimestamps = this.interactionTimestamps.filter(
        item => item.timestamp > thirtyMinutesAgo
      );
    }
    
    // 构建完整上下文
    this.currentContext = {
      currentEmotion: EmotionType.Calm,
      emotionIntensity: 0.5,
      emotionDuration: 0,
      currentState: PetState.Idle,
      stateDuration: 0,
      timeOfDay: getCurrentTimeOfDay(),
      timestamp: now,
      userStats: this.calculateUserStats(),
      activityLevel: UserActivityLevel.Medium,
      ...context
    };
    
    // 重新计算活跃度等级（如果没有在context中提供）
    if (!context.activityLevel && this.currentContext.userStats) {
      this.currentContext.activityLevel = calculateActivityLevel(this.currentContext.userStats);
    }
    
    // 防抖处理节奏重评估
    this.debouncedRhythmEvaluation();
  }

  /**
   * 应用节奏适配
   * 返回适配决策，由调用方执行实际的节奏切换
   */
  public applyAdaptation(): RhythmAdaptationDecision | null {
    if (!this.config.enabled || !this.currentContext) {
      return null;
    }

    // 检查适配频率限制
    if (!this.canAdapt()) {
      return null;
    }

    // 评估所有规则
    const decisions = this.evaluateRules(this.currentContext);
    
    if (decisions.length === 0) {
      return null;
    }
    
    // 选择最佳决策（按优先级和置信度）
    const bestDecision = this.selectBestDecision(decisions);
    
    if (bestDecision) {
      this.recordAdaptation(bestDecision);
      this.emitEvent('adaptation_applied', bestDecision);
      
      if (this.config.enableLogging) {
        console.log(`🎵 [RhythmAdaptation] 应用适配: ${bestDecision.targetMode} (${bestDecision.reason})`);
      }
    }
    
    return bestDecision;
  }

  /**
   * 获取当前上下文
   */
  public getCurrentContext(): RhythmContext | null {
    return this.currentContext;
  }

  /**
   * 获取适配历史
   */
  public getAdaptationHistory(limit: number = 50): RhythmAdaptationHistory[] {
    return this.adaptationHistory.slice(-limit);
  }

  /**
   * 添加自定义规则
   */
  public addRule(rule: RhythmAwarenessRule): void {
    this.config.rules.push(rule);
    this.config.rules.sort((a, b) => b.priority - a.priority);
    console.log(`🎵 [RhythmAdaptation] 添加规则: ${rule.name} (优先级: ${rule.priority})`);
  }

  /**
   * 移除规则
   */
  public removeRule(ruleId: string): boolean {
    const initialLength = this.config.rules.length;
    this.config.rules = this.config.rules.filter(rule => rule.id !== ruleId);
    const removed = this.config.rules.length < initialLength;
    
    if (removed) {
      console.log(`🎵 [RhythmAdaptation] 移除规则: ${ruleId}`);
    }
    
    return removed;
  }

  /**
   * 启用/禁用策略
   */
  public toggleStrategy(strategy: RhythmAdaptationStrategy, enabled: boolean): void {
    if (enabled && !this.config.strategies.includes(strategy)) {
      this.config.strategies.push(strategy);
    } else if (!enabled) {
      this.config.strategies = this.config.strategies.filter(s => s !== strategy);
    }
    
    console.log(`🎵 [RhythmAdaptation] 策略 ${strategy}: ${enabled ? '启用' : '禁用'}`);
  }

  /**
   * 事件监听
   */
  public on(eventType: string, listener: Function): void {
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
   * 销毁管理器
   */
  public destroy(): void {
    if (this.pendingUpdate) {
      clearTimeout(this.pendingUpdate);
    }
    
    this.eventListeners.clear();
    this.adaptationHistory = [];
    this.interactionTimestamps = [];
    
    console.log('🎵 [RhythmAdaptation] 节奏适配管理器已销毁');
  }

  // ============== 私有方法 ==============

  /**
   * 创建默认规则
   */
  private createDefaultRules(): RhythmAwarenessRule[] {
    return [
      // 高频交互 → 脉冲模式
      {
        id: 'high_frequency_interaction',
        name: '高频交互检测',
        priority: 9,
        strategy: RhythmAdaptationStrategy.InteractionDriven,
        condition: (context) => {
          return context.activityLevel === UserActivityLevel.Burst ||
                 context.userStats.recentFrequency > 8;
        },
        action: (context) => ({
          targetMode: 'pulse',
          targetBPM: 140,
          intensity: 0.8,
          duration: 15000,
          transitionType: 'smooth',
          reason: `高频交互检测: ${context.userStats.recentFrequency.toFixed(1)}/min`,
          confidence: 0.9
        }),
        enabled: true,
        cooldownMs: 10000
      },

      // 长时间空闲 + 平静情绪 → 稳定模式
      {
        id: 'idle_calm_steady',
        name: '空闲平静检测',
        priority: 8,
        strategy: RhythmAdaptationStrategy.HybridDriven,
        condition: (context) => {
          return context.currentEmotion === EmotionType.Calm &&
                 context.userStats.continuousIdleTime > 60000 && // 1分钟空闲
                 context.activityLevel === UserActivityLevel.Inactive;
        },
        action: (context) => ({
          targetMode: 'steady',
          targetBPM: 60,
          intensity: 0.3,
          duration: 120000,
          transitionType: 'gradual',
          reason: `长时间空闲(${Math.round(context.userStats.continuousIdleTime/1000)}s) + 平静情绪`,
          confidence: 0.85
        }),
        enabled: true,
        cooldownMs: 30000
      },

      // 夜间时间 + 专注情绪 → 自适应模式
      {
        id: 'night_focused_adaptive',
        name: '夜间专注模式',
        priority: 7,
        strategy: RhythmAdaptationStrategy.TimeDriven,
        condition: (context) => {
          return context.timeOfDay === TimeOfDay.Night &&
                 context.currentEmotion === EmotionType.Focused &&
                 context.emotionIntensity > 0.6;
        },
        action: (context) => ({
          targetMode: 'adaptive',
          targetBPM: 80,
          intensity: 0.5,
          duration: 300000, // 5分钟
          transitionType: 'smooth',
          reason: '夜间专注工作模式',
          confidence: 0.8
        }),
        enabled: true,
        cooldownMs: 60000
      },

      // 兴奋情绪 → 脉冲模式
      {
        id: 'excited_emotion_pulse',
        name: '兴奋情绪响应',
        priority: 8,
        strategy: RhythmAdaptationStrategy.EmotionDriven,
        condition: (context) => {
          return context.currentEmotion === EmotionType.Excited &&
                 context.emotionIntensity > 0.7;
        },
        action: (context) => ({
          targetMode: 'pulse',
          targetBPM: Math.round(120 + context.emotionIntensity * 40),
          intensity: context.emotionIntensity,
          duration: Math.round(context.emotionDuration * 0.8), // 略短于情绪持续时间
          transitionType: 'immediate',
          reason: `兴奋情绪响应(强度: ${context.emotionIntensity.toFixed(2)})`,
          confidence: 0.9
        }),
        enabled: true,
        cooldownMs: 5000
      },

      // 工作时间 + 中等活跃度 → 自适应模式
      {
        id: 'work_time_adaptive',
        name: '工作时间自适应',
        priority: 6,
        strategy: RhythmAdaptationStrategy.SystemDriven,
        condition: (context) => {
          return context.environmentContext?.isWorkTime === true &&
                 context.activityLevel === UserActivityLevel.Medium &&
                 (context.timeOfDay === TimeOfDay.Morning || context.timeOfDay === TimeOfDay.Afternoon);
        },
        action: (context) => ({
          targetMode: 'adaptive',
          targetBPM: 100,
          intensity: 0.6,
          duration: 600000, // 10分钟
          transitionType: 'gradual',
          reason: '工作时间自适应节奏',
          confidence: 0.7
        }),
        enabled: true,
        cooldownMs: 120000
      },

      // 好奇情绪 → 自适应模式
      {
        id: 'curious_emotion_adaptive',
        name: '好奇情绪自适应',
        priority: 7,
        strategy: RhythmAdaptationStrategy.EmotionDriven,
        condition: (context) => {
          return context.currentEmotion === EmotionType.Curious &&
                 context.emotionIntensity > 0.5 &&
                 context.activityLevel !== UserActivityLevel.Inactive;
        },
        action: (context) => ({
          targetMode: 'adaptive',
          targetBPM: 110,
          intensity: 0.7,
          duration: 20000,
          transitionType: 'smooth',
          reason: `好奇情绪探索模式(强度: ${context.emotionIntensity.toFixed(2)})`,
          confidence: 0.75
        }),
        enabled: true,
        cooldownMs: 15000
      }
    ];
  }

  /**
   * 计算用户统计数据
   */
  private calculateUserStats(): UserInteractionStats {
    const now = Date.now();
    const recentWindow = 5 * 60 * 1000; // 5分钟
    const recentInteractions = this.interactionTimestamps.filter(
      item => now - item.timestamp <= recentWindow
    );
    
    const totalInteractions = this.interactionTimestamps.length;
    const recentFrequency = recentInteractions.length / 5; // 每分钟次数
    
    // 计算平均间隔
    let averageInterval = 60000; // 默认1分钟
    if (this.interactionTimestamps.length > 1) {
      const intervals = [];
      for (let i = 1; i < this.interactionTimestamps.length; i++) {
        intervals.push(this.interactionTimestamps[i].timestamp - this.interactionTimestamps[i-1].timestamp);
      }
      averageInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    }
    
    // 计算连续空闲时间
    const lastInteractionTime = this.interactionTimestamps.length > 0 
      ? this.interactionTimestamps[this.interactionTimestamps.length - 1].timestamp 
      : now - 30 * 60 * 1000; // 默认30分钟前
    
    const continuousIdleTime = now - lastInteractionTime;
    
    // 分析交互模式
    const interactionPattern = analyzeInteractionPattern(this.interactionTimestamps);
    
    return {
      totalInteractions,
      averageInterval,
      recentFrequency,
      continuousIdleTime,
      lastInteractionTime,
      interactionPattern
    };
  }

  /**
   * 防抖处理的节奏重评估
   */
  private debouncedRhythmEvaluation(): void {
    if (this.pendingUpdate) {
      clearTimeout(this.pendingUpdate);
    }
    
    this.pendingUpdate = setTimeout(() => {
      const decision = this.applyAdaptation();
      if (decision) {
        this.emitEvent('rhythm_adaptation_suggested', decision);
      }
      this.pendingUpdate = null;
    }, this.config.debounceMs);
  }

  /**
   * 定期评估
   */
  private startPeriodicEvaluation(): void {
    setInterval(() => {
      if (this.currentContext) {
        // 更新时间相关的上下文
        this.currentContext.timeOfDay = getCurrentTimeOfDay();
        this.currentContext.timestamp = Date.now();
        this.currentContext.userStats = this.calculateUserStats();
        this.currentContext.activityLevel = calculateActivityLevel(this.currentContext.userStats);
        
        const decision = this.applyAdaptation();
        if (decision) {
          this.emitEvent('rhythm_adaptation_suggested', decision);
        }
      }
    }, this.config.updateIntervalMs);
  }

  /**
   * 评估所有规则
   */
  private evaluateRules(context: RhythmContext): RhythmAdaptationDecision[] {
    const decisions: RhythmAdaptationDecision[] = [];
    const now = Date.now();
    
    for (const rule of this.config.rules) {
      if (!rule.enabled || !this.config.strategies.includes(rule.strategy)) {
        continue;
      }
      
      // 检查冷却时间
      if (rule.cooldownMs && rule.lastTriggered && 
          now - rule.lastTriggered < rule.cooldownMs) {
        continue;
      }
      
      // 检查条件
      try {
        if (rule.condition(context)) {
          const decision = rule.action(context);
          decision.metadata = {
            ruleId: rule.id,
            ruleName: rule.name,
            priority: rule.priority,
            strategy: rule.strategy,
            ...decision.metadata
          };
          
          decisions.push(decision);
          rule.lastTriggered = now;
        }
      } catch (error) {
        console.error(`🎵 [RhythmAdaptation] 规则执行错误 ${rule.id}:`, error);
      }
    }
    
    return decisions;
  }

  /**
   * 选择最佳决策
   */
  private selectBestDecision(decisions: RhythmAdaptationDecision[]): RhythmAdaptationDecision | null {
    if (decisions.length === 0) {
      return null;
    }
    
    // 按优先级和置信度排序
    decisions.sort((a, b) => {
      const priorityA = a.metadata?.priority || 0;
      const priorityB = b.metadata?.priority || 0;
      
      if (priorityA !== priorityB) {
        return priorityB - priorityA; // 优先级高的在前
      }
      
      return b.confidence - a.confidence; // 置信度高的在前
    });
    
    return decisions[0];
  }

  /**
   * 检查是否可以适配
   */
  private canAdapt(): boolean {
    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;
    
    const recentAdaptations = this.adaptationHistory.filter(
      h => h.timestamp > oneMinuteAgo
    ).length;
    
    return recentAdaptations < this.config.maxAdaptationsPerMinute;
  }

  /**
   * 记录适配历史
   */
  private recordAdaptation(decision: RhythmAdaptationDecision): void {
    const history: RhythmAdaptationHistory = {
      timestamp: Date.now(),
      fromMode: 'unknown', // 这个需要从外部传入
      toMode: decision.targetMode,
      decision,
      context: this.currentContext ? {
        currentEmotion: this.currentContext.currentEmotion,
        activityLevel: this.currentContext.activityLevel,
        timeOfDay: this.currentContext.timeOfDay,
        userStats: this.currentContext.userStats
      } : {},
      success: true // 这个需要从外部反馈
    };
    
    this.adaptationHistory.push(history);
    
    // 保持最近100条记录
    if (this.adaptationHistory.length > 100) {
      this.adaptationHistory = this.adaptationHistory.slice(-100);
    }
  }

  /**
   * 触发事件
   */
  private emitEvent(eventType: string, data: any): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`🎵 [RhythmAdaptation] 事件监听器错误 ${eventType}:`, error);
        }
      });
    }
  }
}

// 工厂函数
export function createRhythmAdaptationManager(config?: Partial<RhythmAdaptationConfig>): RhythmAdaptationManager {
  return new RhythmAdaptationManager(config);
}

// 默认配置导出
export const DefaultRhythmAdaptationConfig: RhythmAdaptationConfig = {
  enabled: true,
  updateIntervalMs: 2000,
  debounceMs: 1000,
  maxAdaptationsPerMinute: 10,
  enableLogging: true,
  strategies: [
    RhythmAdaptationStrategy.EmotionDriven,
    RhythmAdaptationStrategy.InteractionDriven,
    RhythmAdaptationStrategy.TimeDriven,
    RhythmAdaptationStrategy.HybridDriven
  ],
  rules: []
};
