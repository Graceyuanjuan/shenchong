/**
 * T5-B | AIEmotionDriver - 智能情绪推断模块
 * 实现基于状态和上下文的智能情绪推断能力
 */
import { PetState, EmotionType } from '../types';
export interface EmotionLog {
    timestamp: number;
    emotion: EmotionType;
    state: PetState;
    intensity: number;
    context?: any;
    trigger?: string;
}
export interface AIEmotionDriver {
    decideEmotion(input: {
        state: PetState;
        context?: any;
        history?: EmotionLog[];
    }): EmotionType;
}
export interface IAIEmotionProvider {
    inferEmotion(context: any): EmotionType;
}
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
export declare class RuleBasedEmotionModel implements AIEmotionDriver {
    private config;
    private emotionHistory;
    private lastInteractionTime;
    private interactionCount;
    private stateHistory;
    constructor(config?: {
        historyLimit?: number;
        idleTimeoutMs?: number;
        excitementThreshold?: number;
    });
    /**
     * 根据输入决定情绪
     */
    decideEmotion(input: {
        state: PetState;
        context?: any;
        history?: EmotionLog[];
    }): EmotionType;
    /**
     * 更新内部状态
     */
    private updateInternalState;
    /**
     * 构建决策上下文
     */
    private buildDecisionContext;
    /**
     * 应用情绪推断规则
     */
    private applyEmotionRules;
    /**
     * 记录情绪决策
     */
    private recordEmotionDecision;
    /**
     * 计算情绪强度
     */
    private calculateEmotionIntensity;
    /**
     * 获取决策原因
     */
    private getDecisionReason;
    /**
     * 判断是否应该计算为交互
     */
    private shouldCountAsInteraction;
    /**
     * 获取情绪历史
     */
    getEmotionHistory(): EmotionLog[];
    /**
     * 清空历史记录
     */
    clearHistory(): void;
    /**
     * 获取统计信息
     */
    getStatistics(): {
        totalInteractions: number;
        emotionDistribution: Record<EmotionType, number>;
        averageEmotionIntensity: number;
        lastEmotionChange: number;
    };
}
/**
 * 支持外部AI插件的情绪驱动器
 */
export declare class PluginBasedEmotionDriver implements AIEmotionDriver {
    private baseModel;
    private plugins;
    constructor(config?: any);
    /**
     * 注册AI插件
     */
    registerPlugin(plugin: IAIEmotionProvider): void;
    /**
     * 移除AI插件
     */
    removePlugin(plugin: IAIEmotionProvider): void;
    /**
     * 决定情绪（结合基础模型和插件）
     */
    decideEmotion(input: {
        state: PetState;
        context?: any;
        history?: EmotionLog[];
    }): EmotionType;
    /**
     * 获取基础模型统计
     */
    getStatistics(): {
        totalInteractions: number;
        emotionDistribution: Record<EmotionType, number>;
        averageEmotionIntensity: number;
        lastEmotionChange: number;
    };
    /**
     * 获取情绪历史
     */
    getEmotionHistory(): EmotionLog[];
    /**
     * 清空历史
     */
    clearHistory(): void;
}
/**
 * AI情绪驱动器工厂
 */
export declare class AIEmotionDriverFactory {
    /**
     * 创建基于规则的情绪驱动器
     */
    static createRuleBased(config?: any): RuleBasedEmotionModel;
    /**
     * 创建支持插件的情绪驱动器
     */
    static createPluginBased(config?: any): PluginBasedEmotionDriver;
    /**
     * 创建默认情绪驱动器
     */
    static createDefault(): AIEmotionDriver;
}
export declare const defaultEmotionDriver: AIEmotionDriver;
//# sourceMappingURL=AIEmotionDriver.d.ts.map