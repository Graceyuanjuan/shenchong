/**
 * SaintGrid 神宠系统 - 行为调度器
 * 根据主脑状态和情绪自动决策并调度行为
 */
import { PetState, EmotionType, EmotionContext, PluginContext } from '../types';
import { IBehaviorStrategy } from './BehaviorStrategy';
import { RhythmMode } from '../types/BehaviorRhythm';
type RhythmModeType = typeof RhythmMode[keyof typeof RhythmMode];
export declare enum BehaviorType {
    IDLE_ANIMATION = "idle_animation",
    HOVER_FEEDBACK = "hover_feedback",
    AWAKEN_RESPONSE = "awaken_response",
    CONTROL_ACTIVATION = "control_activation",
    EMOTIONAL_EXPRESSION = "emotional_expression",
    MOOD_TRANSITION = "mood_transition",
    PLUGIN_TRIGGER = "plugin_trigger",
    PLUGIN_CALLBACK = "plugin_callback",
    USER_PROMPT = "user_prompt",
    SYSTEM_NOTIFICATION = "system_notification",
    DELAYED_ACTION = "delayed_action",
    ANIMATION_SEQUENCE = "animation_sequence"
}
export interface BehaviorDefinition {
    type: BehaviorType;
    priority: number;
    duration?: number;
    delay?: number;
    animation?: string;
    message?: string;
    pluginId?: string;
    metadata?: Record<string, any>;
}
export interface BehaviorExecutionContext {
    state: PetState;
    emotion: EmotionContext;
    timestamp: number;
    sessionId: string;
    userContext?: PluginContext;
    parentBehavior?: BehaviorDefinition;
    metadata?: Record<string, any>;
}
export interface BehaviorExecutionResult {
    success: boolean;
    executedBehaviors: BehaviorDefinition[];
    duration: number;
    message?: string;
    error?: string;
    nextSchedule?: number;
}
/**
 * 行为调度器类
 */
export declare class BehaviorScheduler {
    private behaviorRules;
    private activeBehaviors;
    private behaviorQueue;
    private scheduledBehaviors;
    private sessionId;
    private strategyManager;
    private emotionEngine?;
    private pluginRegistry?;
    private rhythmManager?;
    private rhythmAdaptationEngine;
    private lastInteractionTimestamp;
    constructor(emotionEngine?: any, pluginRegistry?: any);
    /**
     * 注册自定义策略
     */
    registerStrategy(strategy: IBehaviorStrategy): void;
    /**
     * 移除策略
     */
    removeStrategy(name: string): void;
    /**
     * 获取所有策略信息
     */
    getStrategies(): {
        name: string;
        description: string;
        priority: number;
    }[];
    /**
     * 更新最后交互时间
     */
    updateLastInteraction(): void;
    /**
     * 获取最后交互时间
     */
    private getLastInteractionTime;
    /**
     * 获取当前时段
     */
    private getTimeOfDay;
    /**
     * 获取系统负载（模拟）
     */
    private getSystemLoad;
    /**
     * 获取用户活动状态
     */
    private getUserActivity;
    /**
     * 初始化行为决策规则映射表
     */
    private initializeBehaviorRules;
    /**
     * 主要调度方法 - 根据状态和情绪调度行为（增强版）
     */
    schedule(state: PetState, emotion: EmotionType, context?: PluginContext): Promise<BehaviorExecutionResult>;
    /**
     * 传统行为调度方法（向后兼容）
     */
    scheduleLegacy(state: PetState, emotion: EmotionType, context?: PluginContext): Promise<BehaviorExecutionResult>;
    /**
     * 查找匹配的行为规则
     */
    private findMatchingBehaviors;
    /**
     * 执行行为列表
     */
    private executeBehaviors;
    /**
     * 执行单个行为
     */
    private executeBehavior;
    /**
     * 计算下次调度时间
     */
    private calculateNextScheduleTime;
    /**
     * 注册节奏回调
     */
    private registerRhythmCallbacks;
    /**
     * 节拍回调 - 在节拍器节拍时调用
     */
    private onRhythmTick;
    /**
     * 设置行为节奏模式
     */
    setRhythmMode(mode: RhythmModeType): void;
    /**
     * 启动节奏管理器
     */
    startRhythm(): void;
    /**
     * 停止节奏管理器
     */
    stopRhythm(): void;
    /**
     * 清理资源
     */
    dispose(): void;
    /**
     * 销毁调度器（向后兼容）
     */
    destroy(): void;
    /**
     * 获取行为统计信息
     */
    getBehaviorStats(): {
        totalScheduled: number;
        activeTimers: number;
        sessionId: string;
        lastInteraction: number;
    };
    /**
     * 添加行为规则（向后兼容）
     */
    addBehaviorRule(state: PetState, emotion: EmotionType, behavior: BehaviorDefinition): void;
}
export {};
//# sourceMappingURL=BehaviorScheduler.d.ts.map