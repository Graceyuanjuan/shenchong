/**
 * SaintGrid 神宠系统 - 行为策略模式
 * 策略模式封装，支持可扩展的行为决策逻辑
 */
import { PetState, EmotionType, EmotionContext, PluginContext } from '../types';
import { BehaviorDefinition } from './BehaviorScheduler';
export interface StrategyContext {
    state: PetState;
    emotion: EmotionType;
    emotionContext?: EmotionContext;
    pluginContext?: PluginContext;
    timestamp: number;
    userPresence?: boolean;
    lastInteraction?: number;
    environmentFactors?: {
        timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
        systemLoad?: number;
        userActivity?: 'active' | 'idle' | 'away';
    };
}
export interface IBehaviorStrategy {
    name: string;
    description: string;
    priority: number;
    /**
     * 判断策略是否适用于当前上下文
     */
    canApply(context: StrategyContext): boolean;
    /**
     * 生成行为定义
     */
    generateBehaviors(context: StrategyContext): BehaviorDefinition[];
    /**
     * 策略执行前的钩子
     */
    beforeExecution?(context: StrategyContext): Promise<void>;
    /**
     * 策略执行后的钩子
     */
    afterExecution?(context: StrategyContext, results: any): Promise<void>;
}
export declare abstract class BaseBehaviorStrategy implements IBehaviorStrategy {
    abstract name: string;
    abstract description: string;
    abstract priority: number;
    abstract canApply(context: StrategyContext): boolean;
    abstract generateBehaviors(context: StrategyContext): BehaviorDefinition[];
    protected log(message: string): void;
}
export declare class IdleStateStrategy extends BaseBehaviorStrategy {
    name: string;
    description: string;
    priority: number;
    canApply(context: StrategyContext): boolean;
    generateBehaviors(context: StrategyContext): BehaviorDefinition[];
}
export declare class HoverStateStrategy extends BaseBehaviorStrategy {
    name: string;
    description: string;
    priority: number;
    canApply(context: StrategyContext): boolean;
    generateBehaviors(context: StrategyContext): BehaviorDefinition[];
}
export declare class AwakenStateStrategy extends BaseBehaviorStrategy {
    name: string;
    description: string;
    priority: number;
    canApply(context: StrategyContext): boolean;
    generateBehaviors(context: StrategyContext): BehaviorDefinition[];
}
export declare class ControlStateStrategy extends BaseBehaviorStrategy {
    name: string;
    description: string;
    priority: number;
    canApply(context: StrategyContext): boolean;
    generateBehaviors(context: StrategyContext): BehaviorDefinition[];
}
export declare class EmotionDrivenStrategy extends BaseBehaviorStrategy {
    name: string;
    description: string;
    priority: number;
    canApply(context: StrategyContext): boolean;
    generateBehaviors(context: StrategyContext): BehaviorDefinition[];
}
export declare class TimeAwareStrategy extends BaseBehaviorStrategy {
    name: string;
    description: string;
    priority: number;
    canApply(context: StrategyContext): boolean;
    generateBehaviors(context: StrategyContext): BehaviorDefinition[];
}
export declare class StrategyManager {
    private strategies;
    constructor();
    private initializeDefaultStrategies;
    /**
     * 注册新策略
     */
    registerStrategy(strategy: IBehaviorStrategy): void;
    /**
     * 移除策略
     */
    removeStrategy(name: string): void;
    /**
     * 获取适用的策略并生成行为
     */
    generateBehaviors(context: StrategyContext): BehaviorDefinition[];
    /**
     * 行为优先级排序和去重
     */
    private prioritizeAndDeduplicateBehaviors;
    /**
     * 获取所有策略信息
     */
    getStrategies(): {
        name: string;
        description: string;
        priority: number;
    }[];
}
export type BehaviorStrategy = IBehaviorStrategy;
//# sourceMappingURL=BehaviorStrategy.d.ts.map