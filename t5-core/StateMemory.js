/**
 * 记忆管理器 - 记录用户行为、对话上下文、喜好偏好，实现情绪连续性
 */
export class StateMemory {
    constructor(memoryLimit = 1000) {
        this.memoryStore = new Map();
        this.indexByType = new Map();
        this.indexByTag = new Map();
        this.conversationContext = [];
        this.userPreferences = {};
        this.behaviorPatterns = [];
        this.memoryLimit = memoryLimit;
        this.initializeIndexes();
    }
    /**
     * 初始化索引
     */
    initializeIndexes() {
        const types = ['conversation', 'behavior', 'preference', 'context'];
        types.forEach(type => {
            this.indexByType.set(type, new Set());
        });
    }
    /**
     * 存储记忆
     */
    store(data) {
        const id = this.generateId();
        const memoryData = {
            id,
            timestamp: Date.now(),
            ...data
        };
        // 存储到主存储
        this.memoryStore.set(id, memoryData);
        // 更新索引
        this.indexByType.get(data.type)?.add(id);
        data.tags.forEach(tag => {
            if (!this.indexByTag.has(tag)) {
                this.indexByTag.set(tag, new Set());
            }
            this.indexByTag.get(tag).add(id);
        });
        // 检查内存限制
        this.enforceMemoryLimit();
        console.log(`💾 Memory stored: ${data.type} (${id})`);
        return id;
    }
    /**
     * 记录对话
     */
    recordConversation(userInput, intent, response, emotion, success) {
        // 存储到对话上下文
        const conversationItem = {
            id: this.generateId(),
            userInput,
            intent: intent.type,
            intentConfidence: intent.confidence,
            response,
            emotion,
            success,
            timestamp: Date.now()
        };
        this.conversationContext.push(conversationItem);
        // 限制对话上下文长度
        if (this.conversationContext.length > 50) {
            this.conversationContext = this.conversationContext.slice(-30);
        }
        // 存储到长期记忆
        return this.store({
            type: 'conversation',
            content: {
                userInput,
                intent: intent.type,
                response,
                emotion,
                success
            },
            importance: this.calculateConversationImportance(intent, success),
            tags: ['conversation', intent.type, emotion, success ? 'success' : 'failure']
        });
    }
    /**
     * 记录用户行为
     */
    recordBehavior(action, context, frequency = 1) {
        // 查找是否已有相似行为记录
        const existingBehavior = this.behaviorPatterns.find(b => b.action === action &&
            JSON.stringify(b.context) === JSON.stringify(context));
        if (existingBehavior) {
            // 更新频率和最后执行时间
            existingBehavior.frequency += frequency;
            existingBehavior.lastExecuted = Date.now();
            // 更新存储中的记录
            const memoryId = existingBehavior.memoryId;
            const memory = this.memoryStore.get(memoryId);
            if (memory) {
                memory.content = {
                    ...memory.content,
                    frequency: existingBehavior.frequency,
                    lastExecuted: existingBehavior.lastExecuted
                };
                memory.importance = this.calculateBehaviorImportance(existingBehavior.frequency);
                memory.timestamp = Date.now();
            }
            return memoryId;
        }
        else {
            // 创建新的行为记录
            const behaviorPattern = {
                action,
                context,
                frequency,
                firstExecuted: Date.now(),
                lastExecuted: Date.now(),
                memoryId: ''
            };
            const memoryId = this.store({
                type: 'behavior',
                content: {
                    action,
                    context,
                    frequency,
                    firstExecuted: behaviorPattern.firstExecuted,
                    lastExecuted: behaviorPattern.lastExecuted
                },
                importance: this.calculateBehaviorImportance(frequency),
                tags: ['behavior', action, ...this.extractContextTags(context)]
            });
            behaviorPattern.memoryId = memoryId;
            this.behaviorPatterns.push(behaviorPattern);
            return memoryId;
        }
    }
    /**
     * 记录用户偏好
     */
    recordPreference(category, key, value, confidence = 1.0) {
        if (!this.userPreferences[category]) {
            this.userPreferences[category] = {};
        }
        this.userPreferences[category][key] = {
            value,
            confidence,
            updatedAt: Date.now()
        };
        return this.store({
            type: 'preference',
            content: {
                category,
                key,
                value,
                confidence
            },
            importance: 8, // 偏好设置通常比较重要
            tags: ['preference', category, key]
        });
    }
    /**
     * 检索记忆
     */
    retrieve(query) {
        let results = [];
        // 根据类型筛选
        if (query.type) {
            const typeIds = this.indexByType.get(query.type) || new Set();
            results = Array.from(typeIds)
                .map(id => this.memoryStore.get(id))
                .filter(Boolean);
        }
        else {
            results = Array.from(this.memoryStore.values());
        }
        // 根据标签筛选
        if (query.tags && query.tags.length > 0) {
            results = results.filter(memory => query.tags.some(tag => memory.tags.includes(tag)));
        }
        // 根据时间范围筛选
        if (query.timeRange) {
            results = results.filter(memory => memory.timestamp >= query.timeRange.start &&
                memory.timestamp <= query.timeRange.end);
        }
        // 根据重要性筛选
        if (query.minImportance !== undefined) {
            results = results.filter(memory => memory.importance >= query.minImportance);
        }
        // 按重要性和时间排序
        results.sort((a, b) => {
            if (Math.abs(a.importance - b.importance) > 1) {
                return b.importance - a.importance;
            }
            return b.timestamp - a.timestamp;
        });
        // 限制结果数量
        if (query.limit) {
            results = results.slice(0, query.limit);
        }
        return results;
    }
    /**
     * 获取最近的对话上下文
     */
    getRecentConversations(limit = 10) {
        return this.conversationContext.slice(-limit);
    }
    /**
     * 获取用户偏好
     */
    getUserPreference(category, key) {
        return this.userPreferences[category]?.[key]?.value;
    }
    /**
     * 获取所有用户偏好
     */
    getAllPreferences() {
        return { ...this.userPreferences };
    }
    /**
     * 获取行为模式
     */
    getBehaviorPatterns(action) {
        if (action) {
            return this.behaviorPatterns.filter(p => p.action === action);
        }
        return [...this.behaviorPatterns];
    }
    /**
     * 获取最常用的操作
     */
    getMostFrequentActions(limit = 5) {
        const actionFrequency = new Map();
        this.behaviorPatterns.forEach(pattern => {
            const current = actionFrequency.get(pattern.action) || 0;
            actionFrequency.set(pattern.action, current + pattern.frequency);
        });
        return Array.from(actionFrequency.entries())
            .map(([action, frequency]) => ({ action, frequency }))
            .sort((a, b) => b.frequency - a.frequency)
            .slice(0, limit);
    }
    /**
     * 分析用户使用模式
     */
    analyzeUsagePatterns() {
        const hourCounts = new Array(24).fill(0);
        const intentCounts = new Map();
        const emotionCounts = new Map();
        const sessionLengths = [];
        this.conversationContext.forEach(conv => {
            const hour = new Date(conv.timestamp).getHours();
            hourCounts[hour]++;
            const intentCount = intentCounts.get(conv.intent) || 0;
            intentCounts.set(conv.intent, intentCount + 1);
            const emotionCount = emotionCounts.get(conv.emotion) || 0;
            emotionCounts.set(conv.emotion, emotionCount + 1);
        });
        // 分析峰值使用时间
        const maxUsage = Math.max(...hourCounts);
        const peakHours = hourCounts
            .map((count, hour) => ({ hour, count }))
            .filter(({ count }) => count > maxUsage * 0.7)
            .map(({ hour }) => hour);
        // 常用意图
        const commonIntents = Array.from(intentCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([intent]) => intent);
        // 偏好情绪
        const preferredEmotions = Array.from(emotionCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([emotion]) => emotion);
        // 平均会话长度（简化计算）
        const avgSessionLength = this.conversationContext.length > 0
            ? this.conversationContext.length * 2
            : 0; // 假设每次对话2分钟
        return {
            peakHours,
            commonIntents,
            preferredEmotions,
            avgSessionLength
        };
    }
    /**
     * 清理过期记忆
     */
    cleanup() {
        const now = Date.now();
        const maxAge = 30 * 24 * 60 * 60 * 1000; // 30天
        const expiredIds = [];
        this.memoryStore.forEach((memory, id) => {
            // 低重要性的记忆更快过期
            const ageLimit = memory.importance > 7 ? maxAge : maxAge / 2;
            if (now - memory.timestamp > ageLimit) {
                expiredIds.push(id);
            }
        });
        // 删除过期记忆
        expiredIds.forEach(id => this.deleteMemory(id));
        console.log(`🧹 Cleaned up ${expiredIds.length} expired memories`);
    }
    /**
     * 删除记忆
     */
    deleteMemory(id) {
        const memory = this.memoryStore.get(id);
        if (!memory)
            return;
        // 从主存储删除
        this.memoryStore.delete(id);
        // 从索引删除
        this.indexByType.get(memory.type)?.delete(id);
        memory.tags.forEach(tag => {
            this.indexByTag.get(tag)?.delete(id);
        });
        // 从行为模式删除
        this.behaviorPatterns = this.behaviorPatterns.filter(p => p.memoryId !== id);
    }
    /**
     * 强制执行内存限制
     */
    enforceMemoryLimit() {
        if (this.memoryStore.size <= this.memoryLimit)
            return;
        // 获取所有记忆并按重要性排序
        const memories = Array.from(this.memoryStore.values())
            .sort((a, b) => {
            if (Math.abs(a.importance - b.importance) > 1) {
                return a.importance - b.importance; // 重要性低的在前
            }
            return a.timestamp - b.timestamp; // 时间早的在前
        });
        // 删除最不重要的记忆
        const toDelete = memories.slice(0, this.memoryStore.size - this.memoryLimit);
        toDelete.forEach(memory => this.deleteMemory(memory.id));
    }
    /**
     * 计算对话重要性
     */
    calculateConversationImportance(intent, success) {
        let importance = 5; // 基础重要性
        // 根据意图置信度调整
        importance += intent.confidence * 2;
        // 根据成功与否调整
        if (success) {
            importance += 1;
        }
        else {
            importance += 2; // 失败的对话可能更需要记住以改进
        }
        // 特殊意图的重要性调整
        switch (intent.type) {
            case 'emotion':
                importance += 2; // 情绪表达很重要
                break;
            case 'settings':
                importance += 3; // 设置类操作很重要
                break;
            case 'help':
                importance += 1; // 帮助请求一般重要
                break;
        }
        return Math.max(1, Math.min(10, importance));
    }
    /**
     * 计算行为重要性
     */
    calculateBehaviorImportance(frequency) {
        // 频率越高，重要性越高
        if (frequency >= 20)
            return 9;
        if (frequency >= 10)
            return 7;
        if (frequency >= 5)
            return 5;
        if (frequency >= 2)
            return 3;
        return 1;
    }
    /**
     * 从上下文提取标签
     */
    extractContextTags(context) {
        const tags = [];
        if (typeof context === 'object' && context !== null) {
            Object.keys(context).forEach(key => {
                tags.push(key);
                if (typeof context[key] === 'string') {
                    tags.push(context[key]);
                }
            });
        }
        return tags.filter(tag => tag.length > 0 && tag.length < 20);
    }
    /**
     * 生成唯一ID
     */
    generateId() {
        return `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * 获取内存使用情况
     */
    getMemoryStats() {
        const typeBreakdown = {};
        let oldestTimestamp = Date.now();
        let newestTimestamp = 0;
        this.memoryStore.forEach(memory => {
            typeBreakdown[memory.type] = (typeBreakdown[memory.type] || 0) + 1;
            oldestTimestamp = Math.min(oldestTimestamp, memory.timestamp);
            newestTimestamp = Math.max(newestTimestamp, memory.timestamp);
        });
        return {
            totalMemories: this.memoryStore.size,
            memoryLimit: this.memoryLimit,
            typeBreakdown,
            oldestMemory: oldestTimestamp,
            newestMemory: newestTimestamp
        };
    }
}
//# sourceMappingURL=StateMemory.js.map