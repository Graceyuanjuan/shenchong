/**
 * 情绪引擎 - 理解语气和情绪，决定宠物表现与推荐策略
 */
import { EmotionType, EmotionContext, EmotionHistory, PetState, UserIntent } from '../types';
import { AIEmotionDriver, EmotionLog } from '../modules/AIEmotionDriver';
import { RhythmContext } from '../types/rhythm/RhythmContext';
export declare class EmotionEngine {
    private currentContext;
    private emotionRules;
    private moodFactors;
    private aiEmotionDriver;
    private emotionLogs;
    private rhythmContextCallbacks;
    private currentPetState;
    private stateChangeTime;
    private lastInteractionTime;
    private interactionCount;
    constructor(aiDriver?: AIEmotionDriver);
    /**
     * 初始化情绪规则
     */
    private initializeEmotionRules;
    /**
     * 分析用户输入的情绪色彩
     */
    analyzeInputEmotion(input: string): {
        emotion: EmotionType;
        intensity: number;
        sentiment: 'positive' | 'negative' | 'neutral';
    };
    /**
     * 基于用户意图更新情绪
     */
    updateEmotionFromIntent(intent: UserIntent): void;
    /**
     * 将用户情绪映射到宠物情绪
     */
    private mapUserEmotionToPetEmotion;
    /**
     * 应用情绪规则
     */
    private applyEmotionRule;
    /**
     * 设置情绪
     */
    setEmotion(emotion: EmotionType, intensity: number, duration: number): void;
    /**
     * 混合情绪（不完全替换，而是融合）
     */
    blendEmotion(emotion: EmotionType, intensity: number, duration: number): void;
    /**
     * 基于任务结果更新情绪
     */
    updateEmotionFromTaskResult(success: boolean, taskType: string): void;
    /**
     * 基于时间更新情绪
     */
    updateEmotionFromTime(): void;
    /**
     * 情绪衰减处理
     */
    tick(deltaTime: number): void;
    /**
     * 获取当前情绪上下文
     */
    getCurrentEmotion(): EmotionContext;
    /**
     * 根据情绪推荐状态切换
     */
    recommendStateTransition(currentState: PetState): PetState | null;
    /**
     * 获取情绪表现建议
     */
    getEmotionDisplay(): {
        animation: string;
        color: string;
        particle?: string;
        sound?: string;
    };
    /**
     * T5-B: 根据宠物状态更新情绪（通过 AIEmotionDriver）
     */
    updateEmotionByState(state: PetState, context?: any): void;
    /**
     * T5-B: 记录情绪变化日志
     */
    private recordEmotionLog;
    /**
     * T5-B: 获取情绪统计信息
     */
    getEmotionStatistics(): {
        aiDriverStats: any;
        emotionLogs: EmotionLog[];
        currentEmotion: EmotionType;
        emotionHistory: EmotionHistory[];
    };
    /**
     * T5-B: 设置新的 AI 情绪驱动器
     */
    setAIEmotionDriver(driver: AIEmotionDriver): void;
    /**
     * T5-C: 注册节奏上下文更新回调
     */
    onRhythmContextUpdate(callback: (context: Partial<RhythmContext>) => void): void;
    /**
     * T5-C: 移除节奏上下文更新回调
     */
    offRhythmContextUpdate(callback: (context: Partial<RhythmContext>) => void): void;
    /**
     * T5-C: 更新宠物状态（用于节奏适配）
     */
    updatePetState(newState: PetState): void;
    /**
     * T5-C: 构建并推送节奏上下文
     */
    private notifyRhythmContextUpdate;
    /**
     * T5-C: 计算平均交互间隔
     */
    private calculateAverageInterval;
    /**
     * T5-C: 计算最近频率
     */
    private calculateRecentFrequency;
    /**
     * T5-C: 确定交互模式
     */
    private determineInteractionPattern;
    /**
     * T5-C: 确定活跃度等级
     */
    private determineActivityLevel;
    /**
     * T5-C: 手动触发节奏上下文更新
     */
    triggerRhythmContextUpdate(): void;
}
//# sourceMappingURL=EmotionEngine.d.ts.map