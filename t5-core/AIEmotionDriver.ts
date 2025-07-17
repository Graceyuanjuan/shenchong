/**
 * T5-B | AIEmotionDriver - 智能情绪推断模块
 * 实现基于状态和上下文的智能情绪推断能力
 */

import { PetState, EmotionType } from '../types';

// 情绪日志接口
export interface EmotionLog {
  timestamp: number;
  emotion: EmotionType;
  state: PetState;
  intensity: number;
  context?: any;
  trigger?: string;
}

// AI情绪驱动器接口
export interface AIEmotionDriver {
  decideEmotion(input: {
    state: PetState;
    context?: any;
    history?: EmotionLog[];
  }): EmotionType;
}

// 外部AI插件情绪提供者接口
export interface IAIEmotionProvider {
  inferEmotion(context: any): EmotionType;
}

// 情绪决策上下文
export interface EmotionDecisionContext {
  currentState: PetState;
  previousState?: PetState;
  stateChangedAt: number;
  lastInteractionTime: number;
  interactionCount: number;
  timeInCurrentState: number;
  recentEmotions: EmotionLog[];
  metadata?: Record<string, any>;
}

/**
 * 基于规则的情绪模型实现
 */
export class RuleBasedEmotionModel implements AIEmotionDriver {
  private emotionHistory: EmotionLog[] = [];
  private lastInteractionTime: number = Date.now();
  private interactionCount: number = 0;
  private stateHistory: Array<{ state: PetState; timestamp: number }> = [];

  constructor(private config: {
    historyLimit?: number;
    idleTimeoutMs?: number;
    excitementThreshold?: number;
  } = {}) {
    this.config = {
      historyLimit: 50,
      idleTimeoutMs: 30000, // 30秒
      excitementThreshold: 5,
      ...config
    };
  }

  /**
   * 根据输入决定情绪
   */
  decideEmotion(input: {
    state: PetState;
    context?: any;
    history?: EmotionLog[];
  }): EmotionType {
    const { state, context, history } = input;
    
    // 更新内部状态
    this.updateInternalState(state, context, history);
    
    // 构建决策上下文
    const decisionContext = this.buildDecisionContext(state, context);
    
    // 执行情绪推断规则
    const emotion = this.applyEmotionRules(decisionContext);
    
    // 记录情绪决策
    this.recordEmotionDecision(emotion, state, context);
    
    console.log(`🧠 AIEmotionDriver: ${state} → ${emotion}`, {
      context: decisionContext,
      reason: this.getDecisionReason(emotion, decisionContext)
    });
    
    return emotion;
  }

  /**
   * 更新内部状态
   */
  private updateInternalState(state: PetState, context?: any, history?: EmotionLog[]): void {
    // 更新交互计数
    if (this.shouldCountAsInteraction(state)) {
      this.interactionCount++;
      this.lastInteractionTime = Date.now();
    }
    
    // 更新状态历史
    this.stateHistory.push({ state, timestamp: Date.now() });
    if (this.stateHistory.length > 10) {
      this.stateHistory.shift();
    }
    
    // 合并外部历史
    if (history) {
      this.emotionHistory = [...this.emotionHistory, ...history]
        .slice(-this.config.historyLimit!);
    }
  }

  /**
   * 构建决策上下文
   */
  private buildDecisionContext(state: PetState, context?: any): EmotionDecisionContext {
    const now = Date.now();
    const previousState = this.stateHistory.length > 1 
      ? this.stateHistory[this.stateHistory.length - 2].state 
      : undefined;
    
    const stateChangedAt = this.stateHistory.length > 0 
      ? this.stateHistory[this.stateHistory.length - 1].timestamp 
      : now;
    
    return {
      currentState: state,
      previousState,
      stateChangedAt,
      lastInteractionTime: this.lastInteractionTime,
      interactionCount: this.interactionCount,
      timeInCurrentState: now - stateChangedAt,
      recentEmotions: this.emotionHistory.slice(-5),
      metadata: context
    };
  }

  /**
   * 应用情绪推断规则
   */
  private applyEmotionRules(context: EmotionDecisionContext): EmotionType {
    const { currentState, previousState, timeInCurrentState, interactionCount } = context;
    const idleDuration = Date.now() - context.lastInteractionTime;
    const recentlyAwakened = previousState === PetState.Awaken && timeInCurrentState < 5000;
    const frequentInteraction = interactionCount >= this.config.excitementThreshold!;

    // 规则1: 悬停状态 + 最近被唤醒 → 好奇
    if (currentState === PetState.Hover && recentlyAwakened) {
      return EmotionType.Curious;
    }

    // 规则2: 控制状态 → 专注
    if (currentState === PetState.Control) {
      return EmotionType.Focused;
    }

    // 规则3: 唤醒状态 + 频繁交互 → 兴奋
    if (currentState === PetState.Awaken && frequentInteraction) {
      return EmotionType.Excited;
    }

    // 规则4: 唤醒状态 → 开心
    if (currentState === PetState.Awaken) {
      return EmotionType.Happy;
    }

    // 规则5: 悬停状态 → 好奇
    if (currentState === PetState.Hover) {
      return EmotionType.Curious;
    }

    // 规则6: 空闲状态 + 长时间无交互 → 困倦
    if (currentState === PetState.Idle && idleDuration > this.config.idleTimeoutMs!) {
      return EmotionType.Sleepy;
    }

    // 规则7: 空闲状态 → 平静
    if (currentState === PetState.Idle) {
      return EmotionType.Calm;
    }

    // 默认情绪
    return EmotionType.Calm;
  }

  /**
   * 记录情绪决策
   */
  private recordEmotionDecision(emotion: EmotionType, state: PetState, context?: any): void {
    const log: EmotionLog = {
      timestamp: Date.now(),
      emotion,
      state,
      intensity: this.calculateEmotionIntensity(emotion, state),
      context,
      trigger: this.getDecisionReason(emotion, this.buildDecisionContext(state, context))
    };

    this.emotionHistory.push(log);
    
    // 保持历史记录限制
    if (this.emotionHistory.length > this.config.historyLimit!) {
      this.emotionHistory.shift();
    }
  }

  /**
   * 计算情绪强度
   */
  private calculateEmotionIntensity(emotion: EmotionType, state: PetState): number {
    const baseIntensity = 0.5;
    
    switch (emotion) {
      case EmotionType.Excited:
        return Math.min(0.9, baseIntensity + (this.interactionCount * 0.1));
      case EmotionType.Happy:
        return 0.7;
      case EmotionType.Curious:
        return 0.6;
      case EmotionType.Focused:
        return 0.8;
      case EmotionType.Sleepy:
        return 0.3;
      case EmotionType.Calm:
      default:
        return baseIntensity;
    }
  }

  /**
   * 获取决策原因
   */
  private getDecisionReason(emotion: EmotionType, context: EmotionDecisionContext): string {
    const { currentState, timeInCurrentState, interactionCount } = context;
    const idleDuration = Date.now() - context.lastInteractionTime;

    switch (emotion) {
      case EmotionType.Curious:
        return currentState === PetState.Hover ? 'hover_state' : 'recently_awakened';
      case EmotionType.Focused:
        return 'control_state';
      case EmotionType.Excited:
        return `frequent_interaction_${interactionCount}`;
      case EmotionType.Happy:
        return 'awaken_state';
      case EmotionType.Sleepy:
        return `idle_timeout_${Math.round(idleDuration / 1000)}s`;
      case EmotionType.Calm:
      default:
        return 'default_idle';
    }
  }

  /**
   * 判断是否应该计算为交互
   */
  private shouldCountAsInteraction(state: PetState): boolean {
    return state === PetState.Hover || state === PetState.Awaken || state === PetState.Control;
  }

  /**
   * 获取情绪历史
   */
  getEmotionHistory(): EmotionLog[] {
    return [...this.emotionHistory];
  }

  /**
   * 清空历史记录
   */
  clearHistory(): void {
    this.emotionHistory = [];
    this.stateHistory = [];
    this.interactionCount = 0;
    this.lastInteractionTime = Date.now();
  }

  /**
   * 获取统计信息
   */
  getStatistics(): {
    totalInteractions: number;
    emotionDistribution: Record<EmotionType, number>;
    averageEmotionIntensity: number;
    lastEmotionChange: number;
  } {
    const emotionDistribution: Record<EmotionType, number> = {} as any;
    let totalIntensity = 0;

    // 初始化分布
    Object.values(EmotionType).forEach(emotion => {
      emotionDistribution[emotion] = 0;
    });

    // 计算分布和平均强度
    this.emotionHistory.forEach(log => {
      emotionDistribution[log.emotion]++;
      totalIntensity += log.intensity;
    });

    const lastEmotionChange = this.emotionHistory.length > 0 
      ? this.emotionHistory[this.emotionHistory.length - 1].timestamp 
      : 0;

    return {
      totalInteractions: this.interactionCount,
      emotionDistribution,
      averageEmotionIntensity: this.emotionHistory.length > 0 
        ? totalIntensity / this.emotionHistory.length 
        : 0,
      lastEmotionChange
    };
  }
}

/**
 * 支持外部AI插件的情绪驱动器
 */
export class PluginBasedEmotionDriver implements AIEmotionDriver {
  private baseModel: RuleBasedEmotionModel;
  private plugins: IAIEmotionProvider[] = [];

  constructor(config?: any) {
    this.baseModel = new RuleBasedEmotionModel(config);
  }

  /**
   * 注册AI插件
   */
  registerPlugin(plugin: IAIEmotionProvider): void {
    this.plugins.push(plugin);
    console.log(`🔌 AIEmotionDriver: 注册插件，当前插件数: ${this.plugins.length}`);
  }

  /**
   * 移除AI插件
   */
  removePlugin(plugin: IAIEmotionProvider): void {
    const index = this.plugins.indexOf(plugin);
    if (index > -1) {
      this.plugins.splice(index, 1);
      console.log(`🔌 AIEmotionDriver: 移除插件，当前插件数: ${this.plugins.length}`);
    }
  }

  /**
   * 决定情绪（结合基础模型和插件）
   */
  decideEmotion(input: {
    state: PetState;
    context?: any;
    history?: EmotionLog[];
  }): EmotionType {
    // 首先使用基础规则模型
    const baseEmotion = this.baseModel.decideEmotion(input);

    // 如果没有插件，直接返回基础情绪
    if (this.plugins.length === 0) {
      return baseEmotion;
    }

    // 尝试使用插件推断
    try {
      // 构建插件上下文
      const pluginContext = {
        baseEmotion,
        state: input.state,
        context: input.context,
        history: input.history,
        timestamp: Date.now()
      };

      // 使用第一个可用插件
      const pluginEmotion = this.plugins[0].inferEmotion(pluginContext);
      
      console.log(`🔌 AIEmotionDriver: 插件推断 ${baseEmotion} → ${pluginEmotion}`);
      
      return pluginEmotion;
    } catch (error) {
      console.warn(`⚠️ AIEmotionDriver: 插件推断失败，使用基础模型`, error);
      return baseEmotion;
    }
  }

  /**
   * 获取基础模型统计
   */
  getStatistics() {
    return this.baseModel.getStatistics();
  }

  /**
   * 获取情绪历史
   */
  getEmotionHistory(): EmotionLog[] {
    return this.baseModel.getEmotionHistory();
  }

  /**
   * 清空历史
   */
  clearHistory(): void {
    this.baseModel.clearHistory();
  }
}

/**
 * AI情绪驱动器工厂
 */
export class AIEmotionDriverFactory {
  /**
   * 创建基于规则的情绪驱动器
   */
  static createRuleBased(config?: any): RuleBasedEmotionModel {
    return new RuleBasedEmotionModel(config);
  }

  /**
   * 创建支持插件的情绪驱动器
   */
  static createPluginBased(config?: any): PluginBasedEmotionDriver {
    return new PluginBasedEmotionDriver(config);
  }

  /**
   * 创建默认情绪驱动器
   */
  static createDefault(): AIEmotionDriver {
    return new RuleBasedEmotionModel();
  }
}

// 导出默认实例
export const defaultEmotionDriver = AIEmotionDriverFactory.createDefault();
