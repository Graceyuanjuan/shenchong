/**
 * 记忆管理器 - 记录用户行为、对话上下文、喜好偏好，实现情绪连续性
 */
import { MemoryData, UserIntent, EmotionType } from '../types';
export declare class StateMemory {
    private memoryStore;
    private indexByType;
    private indexByTag;
    private memoryLimit;
    private conversationContext;
    private userPreferences;
    private behaviorPatterns;
    constructor(memoryLimit?: number);
    /**
     * 初始化索引
     */
    private initializeIndexes;
    /**
     * 存储记忆
     */
    store(data: Omit<MemoryData, 'id' | 'timestamp'>): string;
    /**
     * 记录对话
     */
    recordConversation(userInput: string, intent: UserIntent, response: string, emotion: EmotionType, success: boolean): string;
    /**
     * 记录用户行为
     */
    recordBehavior(action: string, context: any, frequency?: number): string;
    /**
     * 记录用户偏好
     */
    recordPreference(category: string, key: string, value: any, confidence?: number): string;
    /**
     * 检索记忆
     */
    retrieve(query: {
        type?: string;
        tags?: string[];
        timeRange?: {
            start: number;
            end: number;
        };
        limit?: number;
        minImportance?: number;
    }): MemoryData[];
    /**
     * 获取最近的对话上下文
     */
    getRecentConversations(limit?: number): ConversationMemory[];
    /**
     * 获取用户偏好
     */
    getUserPreference(category: string, key: string): any;
    /**
     * 获取所有用户偏好
     */
    getAllPreferences(): UserPreferences;
    /**
     * 获取行为模式
     */
    getBehaviorPatterns(action?: string): BehaviorPattern[];
    /**
     * 获取最常用的操作
     */
    getMostFrequentActions(limit?: number): {
        action: string;
        frequency: number;
    }[];
    /**
     * 分析用户使用模式
     */
    analyzeUsagePatterns(): {
        peakHours: number[];
        commonIntents: string[];
        preferredEmotions: EmotionType[];
        avgSessionLength: number;
    };
    /**
     * 清理过期记忆
     */
    cleanup(): void;
    /**
     * 删除记忆
     */
    private deleteMemory;
    /**
     * 强制执行内存限制
     */
    private enforceMemoryLimit;
    /**
     * 计算对话重要性
     */
    private calculateConversationImportance;
    /**
     * 计算行为重要性
     */
    private calculateBehaviorImportance;
    /**
     * 从上下文提取标签
     */
    private extractContextTags;
    /**
     * 生成唯一ID
     */
    private generateId;
    /**
     * 获取内存使用情况
     */
    getMemoryStats(): {
        totalMemories: number;
        memoryLimit: number;
        typeBreakdown: Record<string, number>;
        oldestMemory: number;
        newestMemory: number;
    };
}
interface ConversationMemory {
    id: string;
    userInput: string;
    intent: string;
    intentConfidence: number;
    response: string;
    emotion: EmotionType;
    success: boolean;
    timestamp: number;
}
interface UserPreferences {
    [category: string]: {
        [key: string]: {
            value: any;
            confidence: number;
            updatedAt: number;
        };
    };
}
interface BehaviorPattern {
    action: string;
    context: any;
    frequency: number;
    firstExecuted: number;
    lastExecuted: number;
    memoryId: string;
}
export {};
//# sourceMappingURL=StateMemory.d.ts.map