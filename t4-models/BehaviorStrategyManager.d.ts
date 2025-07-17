/**
 * T3-B: 行为策略封装模块
 *
 * 提供基于 PetState + EmotionType 组合的行为策略映射系统
 * 支持优先级排序、延时执行、异步链执行和动态扩展
 */
import { PetState, EmotionType } from '../types';
import { BehaviorExecutionContext } from './BehaviorScheduler';
import { VisualFeedbackManager } from './visual/VisualFeedbackManager';
import { BehaviorRhythmManager } from './behavior/BehaviorRhythmManager';
/**
 * 行为动作接口
 */
export interface BehaviorAction {
    type: string;
    delayMs?: number;
    priority?: number;
    execute: (context: BehaviorExecutionContext) => Promise<BehaviorActionResult>;
}
/**
 * 行为动作执行结果
 */
export interface BehaviorActionResult {
    success: boolean;
    message?: string;
    data?: any;
    nextActions?: BehaviorAction[];
}
/**
 * 行为策略规则接口
 */
export interface BehaviorStrategyRule {
    id: string;
    name: string;
    description: string;
    state: PetState | PetState[];
    emotion: EmotionType | EmotionType[];
    priority: number;
    conditions?: BehaviorCondition[];
    actions: BehaviorAction[];
    cooldownMs?: number;
    maxExecutions?: number;
    enabled: boolean;
}
/**
 * 行为触发条件
 */
export interface BehaviorCondition {
    type: 'emotion_intensity' | 'time_range' | 'state_duration' | 'custom';
    operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'in' | 'between';
    value: any;
    customCheck?: (context: BehaviorExecutionContext) => boolean;
}
/**
 * 策略执行统计
 */
export interface StrategyExecutionStats {
    ruleId: string;
    executionCount: number;
    lastExecuted: number;
    averageExecutionTime: number;
    successRate: number;
    errors: string[];
}
/**
 * 行为策略管理器
 */
export declare class BehaviorStrategyManager {
    private strategies;
    private executionStats;
    private executionQueue;
    private isProcessing;
    private visualFeedbackManager?;
    private rhythmManager?;
    private dbAdapter;
    constructor(dbPath?: string);
    /**
     * T5-A: 异步初始化
     */
    private initializeAsync;
    /**
     * T5-A: 从数据库加载策略
     */
    private loadStrategiesFromDB;
    /**
     * T5-A: 设置热重载监听
     */
    private setupHotReload;
    /**
     * T5-A: 将StrategyRecord转换为BehaviorStrategyRule
     */
    private convertStrategyRecordToBehaviorRule;
    /**
     * T5-A: 转换策略条件
     */
    private convertStrategyConditions;
    /**
     * T5-A: 创建动作执行器
     */
    private createActionExecutor;
    /**
     * 加载默认策略集合 (备用方案)
     */
    private loadDefaultStrategies;
    /**
     * 注册新的行为策略
     */
    registerStrategy(strategy: BehaviorStrategyRule): void;
    /**
     * 移除行为策略
     */
    removeStrategy(strategyId: string): boolean;
    /**
     * 获取匹配的策略
     */
    getMatchingStrategies(state: PetState, emotion: EmotionType, context?: BehaviorExecutionContext): BehaviorStrategyRule[];
    /**
     * 检查策略条件
     */
    private checkConditions;
    /**
     * 评估条件操作符
     */
    private evaluateCondition;
    /**
     * 检查冷却时间
     */
    private checkCooldown;
    /**
     * 执行策略
     */
    executeStrategy(strategy: BehaviorStrategyRule, context: BehaviorExecutionContext): Promise<BehaviorActionResult[]>;
    /**
     * 更新执行统计
     */
    private updateExecutionStats;
    /**
     * 工具方法：延时
     */
    private delay;
    /**
     * 获取所有策略
     */
    getAllStrategies(): BehaviorStrategyRule[];
    /**
     * 获取执行统计
     */
    getExecutionStats(): StrategyExecutionStats[];
    /**
     * 启用/禁用策略
     */
    setStrategyEnabled(strategyId: string, enabled: boolean): boolean;
    /**
     * 清除执行统计
     */
    clearStats(): void;
    /**
     * 导出策略配置
     */
    exportStrategies(): BehaviorStrategyRule[];
    /**
     * 导入策略配置
     */
    importStrategies(strategies: BehaviorStrategyRule[]): void;
    /**
     * T5-A: 数据库管理方法
     */
    /**
     * 保存策略到数据库
     */
    saveStrategyToDB(strategy: BehaviorStrategyRule): Promise<boolean>;
    /**
     * 从数据库删除策略
     */
    removeStrategyFromDB(strategyId: string): Promise<boolean>;
    /**
     * T4-C: 初始化管理器
     */
    private initializeManagers;
    /**
     * T4-C: 注册视觉反馈管理器
     */
    registerVisualFeedbackManager(manager: VisualFeedbackManager): void;
    /**
     * T4-C: 注册节奏管理器
     */
    registerRhythmManager(manager: BehaviorRhythmManager): void;
    /**
     * T4-C: 将BehaviorStrategyRule转换为StrategyRecord
     */
    private convertBehaviorRuleToStrategyRecord;
    /**
     * T4-C: 策略执行时触发视觉反馈
     */
    private triggerStrategyVisualFeedback;
}
/**
 * 创建默认的行为策略管理器实例
 */
export declare function createBehaviorStrategyManager(): BehaviorStrategyManager;
export default BehaviorStrategyManager;
//# sourceMappingURL=BehaviorStrategyManager.d.ts.map