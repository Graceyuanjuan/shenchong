/**
 * SaintGrid 神宠系统 - 主脑调度器
 * 核心指令中枢，统一管理插件注册、意图识别、情绪引擎和记忆存储
 */
import { PetState, EmotionType, AIProvider } from '../types';
import { PluginRegistry } from './PluginRegistry';
import { IntentRouter } from './IntentRouter';
import { EmotionEngine } from './EmotionEngine';
import { StateMemory } from './StateMemory';
import { PetBrainBridge } from './PetBrainBridge';
export class PetBrain {
    constructor(config = {}) {
        this.isInitialized = false;
        this.lastInteractionTime = Date.now();
        // 事件监听器
        this.eventListeners = new Map();
        // 心跳定时器
        this.heartbeatTimer = null;
        // 状态机相关
        this.stateHistory = [];
        this.stateTransitionCallbacks = new Map();
        // 初始化配置
        this.config = {
            defaultState: PetState.Idle,
            defaultEmotion: EmotionType.Calm,
            memoryLimit: 1000,
            aiProviders: [AIProvider.OpenAI, AIProvider.Claude],
            plugins: [],
            ...config
        };
        // 初始化状态管理
        this.currentState = PetState.Idle;
        this.stateHistory = [PetState.Idle];
        // 初始化核心模块
        this.pluginRegistry = new PluginRegistry();
        this.intentRouter = new IntentRouter();
        this.emotionEngine = new EmotionEngine();
        this.stateMemory = new StateMemory(this.config.memoryLimit);
        // 初始化 PetBrainBridge
        const bridgeConfig = {
            enableEventDriven: true,
            enableLogging: true,
            autoEmotionUpdate: true,
            defaultEmotionIntensity: 0.7,
            bridgeId: `petbrain-${Date.now()}`
        };
        this.petBrainBridge = new PetBrainBridge(bridgeConfig);
        console.log('🧠 PetBrain initialized with config:', this.config);
        console.log(`🎛️ Initial state: ${this.currentState}, state history: [${this.stateHistory.join(', ')}]`);
        console.log('🌉 PetBrainBridge integrated into main system');
    }
    /**
     * 初始化主脑系统
     */
    async initialize() {
        if (this.isInitialized) {
            console.warn('⚠️ PetBrain already initialized');
            return;
        }
        try {
            console.log('🧠 ===== 主脑系统初始化开始 =====');
            // 初始化 PetBrainBridge
            console.log('🌉 Initializing PetBrainBridge...');
            await this.petBrainBridge.initPetBrainBridge(this.emotionEngine, this.pluginRegistry);
            // 设置默认情绪
            console.log(`😊 Setting default emotion: ${this.config.defaultEmotion}`);
            this.emotionEngine.setEmotion(this.config.defaultEmotion, 0.5, 30000);
            // 设置默认状态转换回调
            await this.setupDefaultStateCallbacks();
            // 启动心跳
            console.log('💓 Starting heartbeat system');
            this.startHeartbeat();
            // 加载用户偏好
            console.log('📚 Loading user preferences');
            await this.loadUserPreferences();
            this.isInitialized = true;
            this.emit('initialized', {
                state: this.currentState,
                emotion: this.emotionEngine.getCurrentEmotion(),
                timestamp: Date.now()
            });
            console.log('✅ PetBrain successfully initialized');
            console.log(`🎭 Current state: ${this.currentState}`);
            console.log(`😊 Current emotion: ${this.emotionEngine.getCurrentEmotion().currentEmotion}`);
            console.log('🌉 PetBrainBridge is ready for behavior dispatch');
            console.log('🧠 ===== 主脑系统初始化完成 =====\n');
        }
        catch (error) {
            console.error('❌ Failed to initialize PetBrain:', error);
            throw error;
        }
    }
    /**
     * 处理用户输入（主要入口）
     */
    async processInput(input, context = {}) {
        this.lastInteractionTime = Date.now();
        try {
            console.log(`🎯 Processing input: "${input}"`);
            // 1. 意图识别
            const contextWithState = {
                ...context,
                currentState: this.currentState,
                emotionState: this.emotionEngine.getCurrentEmotion().currentEmotion,
                previousIntents: this.stateMemory.getRecentConversations(5)
                    .map(conv => ({ type: conv.intent, confidence: conv.intentConfidence }))
            };
            const intents = this.intentRouter.parseIntentWithContext(input, contextWithState);
            const primaryIntent = intents[0];
            if (!primaryIntent) {
                return await this.handleUnknownIntent(input);
            }
            // 2. 更新情绪基于意图
            this.emotionEngine.updateEmotionFromIntent(primaryIntent);
            // 3. 记录行为
            this.stateMemory.recordBehavior(primaryIntent.type, {
                input,
                state: this.currentState,
                emotion: this.emotionEngine.getCurrentEmotion().currentEmotion
            });
            // 4. 查找并执行插件
            const response = await this.executeIntent(primaryIntent, context);
            // 5. 记录对话
            this.stateMemory.recordConversation(input, primaryIntent, response.message || 'Action completed', response.emotion || this.emotionEngine.getCurrentEmotion().currentEmotion, response.success);
            // 6. 更新情绪基于结果
            this.emotionEngine.updateEmotionFromTaskResult(response.success, primaryIntent.type);
            // 7. 检查状态转换
            const emotionRecommendedState = this.emotionEngine.recommendStateTransition(this.currentState);
            const nextState = response.nextState || emotionRecommendedState;
            if (nextState && nextState !== this.currentState) {
                await this.transitionToState(nextState);
            }
            // 8. 发送事件
            this.emit('input_processed', {
                input,
                intent: primaryIntent,
                response,
                emotion: this.emotionEngine.getCurrentEmotion(),
                state: this.currentState
            });
            return {
                response: response.message || 'Action completed successfully',
                emotion: this.emotionEngine.getCurrentEmotion().currentEmotion,
                nextState: this.currentState,
                actions: response.data?.actions || []
            };
        }
        catch (error) {
            console.error('❌ Error processing input:', error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            // 记录失败
            this.stateMemory.recordConversation(input, { type: 'error', confidence: 0, parameters: {}, rawInput: input, timestamp: Date.now() }, errorMessage, EmotionType.Calm, false);
            return {
                response: `抱歉，处理您的请求时出现了问题：${errorMessage}`,
                emotion: EmotionType.Calm
            };
        }
    }
    /**
     * 执行意图
     */
    async executeIntent(intent, context) {
        // 获取支持该意图的插件
        const availablePlugins = this.pluginRegistry.getPluginsForIntent(intent.type);
        if (availablePlugins.length === 0) {
            return await this.handleNoPluginFound(intent);
        }
        // 选择最佳插件（简单策略：使用第一个可用插件）
        const selectedPlugin = availablePlugins[0];
        try {
            console.log(`🔌 Executing plugin: ${selectedPlugin.name} for intent: ${intent.type}`);
            const response = await this.pluginRegistry.executePlugin(selectedPlugin.id, intent, {
                ...context,
                currentState: this.currentState,
                emotion: this.emotionEngine.getCurrentEmotion(),
                userPreferences: this.stateMemory.getAllPreferences()
            });
            return response;
        }
        catch (error) {
            console.error(`❌ Plugin execution failed: ${selectedPlugin.name}`, error);
            // 尝试其他插件
            if (availablePlugins.length > 1) {
                for (let i = 1; i < availablePlugins.length; i++) {
                    try {
                        const fallbackPlugin = availablePlugins[i];
                        console.log(`🔄 Trying fallback plugin: ${fallbackPlugin.name}`);
                        return await this.pluginRegistry.executePlugin(fallbackPlugin.id, intent, context);
                    }
                    catch (fallbackError) {
                        console.error(`❌ Fallback plugin also failed: ${availablePlugins[i].name}`);
                    }
                }
            }
            throw error;
        }
    }
    /**
     * 处理未知意图
     */
    async handleUnknownIntent(input) {
        console.log(`❓ Unknown intent for input: "${input}"`);
        // 分析是否是对话类型
        if (input.length > 3 && !this.isCommandLike(input)) {
            // 设置好奇情绪
            this.emotionEngine.setEmotion(EmotionType.Curious, 0.6, 20000);
            return {
                response: `我还在学习理解"${input}"，能换个方式告诉我您想要什么吗？或者说"帮助"查看我能做什么～`,
                emotion: EmotionType.Curious
            };
        }
        else {
            return {
                response: `我不太明白这个指令，您可以尝试说"截图"、"记录"、"设置"等，或者右键点击我查看更多功能。`,
                emotion: EmotionType.Calm
            };
        }
    }
    /**
     * 处理没有找到插件的情况
     */
    async handleNoPluginFound(intent) {
        console.log(`🔍 No plugin found for intent: ${intent.type}`);
        return {
            success: false,
            data: null,
            message: `抱歉，我还没有学会"${intent.type}"功能，您可以通过设置菜单添加相关插件。`,
            emotion: EmotionType.Curious
        };
    }
    /**
     * 状态转换（增强版，使用 PetBrainBridge）
     */
    async transitionToState(newState) {
        const oldState = this.currentState;
        if (newState === this.currentState) {
            console.log(`🔄 State already in ${newState}, skipping transition`);
            return;
        }
        console.log(`🧠 ===== PetBrain 状态转换开始 =====`);
        console.log(`🔄 状态转换: ${oldState} → ${newState}`);
        // 1. 调用核心状态管理方法
        this.handleStateChange(newState);
        // 2. 使用 PetBrainBridge 进行统一调度
        console.log('🌉 Dispatching behavior through PetBrainBridge...');
        try {
            await this.petBrainBridge.dispatch(newState);
            console.log('✅ PetBrainBridge dispatch completed successfully');
        }
        catch (error) {
            console.error('❌ PetBrainBridge dispatch failed:', error);
            // 继续执行其他逻辑，不阻断状态转换
        }
        // 3. 执行状态转换回调
        await this.executeStateTransitionCallbacks(newState);
        // 4. 记录状态变化到记忆系统
        this.stateMemory.recordBehavior('state_transition', {
            from: oldState,
            to: newState,
            emotion: this.emotionEngine.getCurrentEmotion().currentEmotion,
            timestamp: Date.now(),
            stateHistory: [...this.stateHistory],
            dispatchMethod: 'petbrain_bridge'
        });
        // 5. 发送状态变化事件
        this.emit('state_changed', {
            oldState,
            newState,
            emotion: this.emotionEngine.getCurrentEmotion(),
            stateHistory: [...this.stateHistory]
        });
        console.log(`✅ Enhanced state transition completed: ${oldState} → ${newState} (via PetBrainBridge)`);
        console.log(`🧠 ===== PetBrain 状态转换完成 =====\n`);
    }
    /**
     * 🎛️ 主脑状态管理核心方法
     * 处理状态变化的核心逻辑
     */
    handleStateChange(newState) {
        const oldState = this.currentState;
        // 如果状态没有变化，直接返回
        if (newState === oldState) {
            console.log(`🔄 State unchanged: ${oldState}`);
            return;
        }
        console.log(`🎛️ ===== 状态机管理 =====`);
        console.log(`🔄 状态从 ${oldState} 切换到 ${newState}`);
        // 1. 切换 currentState
        this.currentState = newState;
        // 2. 将变更追加到 stateHistory
        this.stateHistory.push(newState);
        // 限制历史记录长度（保留最近10个状态）
        if (this.stateHistory.length > 10) {
            this.stateHistory = this.stateHistory.slice(-10);
            console.log(`📝 状态历史已限制为最近10个状态`);
        }
        console.log(`📊 当前状态: ${this.currentState}`);
        console.log(`📜 状态历史: [${this.stateHistory.join(' → ')}]`);
        console.log(`�️ ===== 状态切换完成 =====\n`);
        // 3. 更新交互时间
        this.lastInteractionTime = Date.now();
    }
    /**
     * 基于状态更新情绪
     */
    async updateEmotionForState(newState, oldState) {
        console.log(`😊 Updating emotion for state: ${newState}`);
        switch (newState) {
            case PetState.Idle:
                // 进入静碗状态 - 平静或困倦
                if (oldState === PetState.Awaken || oldState === PetState.Control) {
                    console.log(`💤 从活跃状态回到静态，设置平静情绪`);
                    this.emotionEngine.setEmotion(EmotionType.Calm, 0.4, 30000);
                }
                else {
                    console.log(`😴 长期静态，可能进入困倦状态`);
                    this.emotionEngine.blendEmotion(EmotionType.Sleepy, 0.3, 60000);
                }
                break;
            case PetState.Hover:
                // 进入感应状态 - 好奇
                console.log(`🤔 感应到用户，激发好奇情绪`);
                this.emotionEngine.setEmotion(EmotionType.Curious, 0.6, 20000);
                break;
            case PetState.Awaken:
                // 进入唤醒状态 - 专注或兴奋
                console.log(`🎯 被唤醒，进入专注工作状态`);
                this.emotionEngine.setEmotion(EmotionType.Focused, 0.7, 45000);
                break;
            case PetState.Control:
                // 进入控制状态 - 专注
                console.log(`⚙️ 进入设置模式，保持专注情绪`);
                this.emotionEngine.setEmotion(EmotionType.Focused, 0.5, 60000);
                break;
        }
        const currentEmotion = this.emotionEngine.getCurrentEmotion();
        console.log(`😊 Emotion updated: ${currentEmotion.currentEmotion} (intensity: ${currentEmotion.intensity.toFixed(2)})`);
    }
    /**
     * 触发所有插件的状态响应 - 增强版：支持情绪感知
     */
    async triggerPluginsForState(state) {
        console.log(`🔌 [插件触发] 状态: ${state} | 开始触发所有插件`);
        const allPlugins = this.pluginRegistry.getAllPlugins();
        const currentEmotion = this.emotionEngine.getCurrentEmotion();
        const triggerResults = [];
        // 构建增强的插件上下文
        const pluginContext = {
            currentState: state,
            emotion: currentEmotion,
            userPreferences: this.stateMemory.getAllPreferences(),
            stateHistory: [...this.stateHistory],
            interaction: {
                type: 'passive',
                trigger: 'state_change',
                timestamp: Date.now()
            }
        };
        for (const plugin of allPlugins) {
            // 检查插件能力
            const isEmotionAware = plugin.capabilities?.emotionAware || false;
            const isStateAware = plugin.capabilities?.stateAware || false;
            if (typeof plugin.trigger === 'function') {
                console.log(`🎯 [插件响应] ${plugin.name} | 状态: ${state} | 情绪: ${currentEmotion.currentEmotion} | 情绪感知: ${isEmotionAware ? '✅' : '❌'}`);
                try {
                    let response;
                    if (isEmotionAware) {
                        // 新式调用：传递情绪参数和增强上下文
                        response = await plugin.trigger(state, currentEmotion, pluginContext);
                    }
                    else {
                        // 兼容性调用：只传递状态和基础上下文（any类型保持兼容）
                        response = await plugin.trigger(state, {
                            currentState: state,
                            emotion: currentEmotion,
                            userPreferences: this.stateMemory.getAllPreferences(),
                            stateHistory: [...this.stateHistory]
                        });
                    }
                    triggerResults.push({
                        pluginId: plugin.id,
                        pluginName: plugin.name,
                        success: response.success,
                        response,
                        emotionAware: isEmotionAware
                    });
                    console.log(`✅ [插件完成] ${plugin.name} | 状态: ${state} | 情绪: ${currentEmotion.currentEmotion} | 结果: ${response.message}`);
                    // 如果插件建议状态切换，记录但不立即执行（避免循环）
                    if (response.nextState && response.nextState !== state) {
                        console.log(`💡 [插件建议] ${plugin.name} 建议状态切换: ${state} → ${response.nextState}`);
                    }
                }
                catch (error) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    triggerResults.push({
                        pluginId: plugin.id,
                        pluginName: plugin.name,
                        success: false,
                        error: errorMessage,
                        emotionAware: isEmotionAware
                    });
                    console.error(`❌ [插件错误] ${plugin.name} | 状态: ${state} | 错误: ${errorMessage}`);
                }
            }
            else {
                console.log(`⏭️ [插件跳过] ${plugin.name} 不支持状态触发`);
            }
        }
        // 发送插件触发结果事件
        this.emit('plugins_triggered', {
            state,
            emotion: currentEmotion,
            results: triggerResults,
            timestamp: Date.now()
        });
        const successCount = triggerResults.filter(r => r.success).length;
        const emotionAwareCount = triggerResults.filter(r => r.emotionAware).length;
        console.log(`🔌 [插件汇总] 状态: ${state} | 总数: ${triggerResults.length} | 成功: ${successCount} | 情绪感知: ${emotionAwareCount}`);
    }
    /**
     * 触发插件的 onStateChanged 钩子
     */
    async triggerStateChangedHooks(oldState, newState) {
        console.log(`🪝 [状态钩子] 状态变化: ${oldState} → ${newState} | 开始触发 onStateChanged 钩子`);
        const allPlugins = this.pluginRegistry.getAllPlugins();
        const currentEmotion = this.emotionEngine.getCurrentEmotion();
        const hookResults = [];
        // 构建钩子上下文
        const hookContext = {
            currentState: newState,
            emotion: currentEmotion,
            userPreferences: this.stateMemory.getAllPreferences(),
            stateHistory: [...this.stateHistory],
            interaction: {
                type: 'passive',
                trigger: 'state_change',
                timestamp: Date.now()
            }
        };
        for (const plugin of allPlugins) {
            if (typeof plugin.onStateChanged === 'function') {
                const supportsHook = plugin.capabilities?.supportedHooks?.includes('onStateChanged') || false;
                console.log(`🪝 [钩子响应] ${plugin.name} | ${oldState} → ${newState} | 情绪: ${currentEmotion.currentEmotion} | 钩子支持: ${supportsHook ? '✅' : '❌'}`);
                try {
                    const response = await plugin.onStateChanged(oldState, newState, currentEmotion, hookContext);
                    hookResults.push({
                        pluginId: plugin.id,
                        pluginName: plugin.name,
                        success: response.success,
                        response
                    });
                    console.log(`✅ [钩子完成] ${plugin.name} | 状态钩子执行成功: ${response.message}`);
                }
                catch (error) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    hookResults.push({
                        pluginId: plugin.id,
                        pluginName: plugin.name,
                        success: false,
                        error: errorMessage
                    });
                    console.error(`❌ [钩子错误] ${plugin.name} | 状态钩子执行失败: ${errorMessage}`);
                }
            }
            else {
                console.log(`⏭️ [钩子跳过] ${plugin.name} 不支持 onStateChanged 钩子`);
            }
        }
        // 发送钩子执行结果事件
        this.emit('state_hooks_triggered', {
            hookType: 'onStateChanged',
            oldState,
            newState,
            emotion: currentEmotion,
            results: hookResults,
            timestamp: Date.now()
        });
        const successCount = hookResults.filter(r => r.success).length;
        console.log(`🪝 [钩子汇总] onStateChanged | 状态: ${oldState} → ${newState} | 总数: ${hookResults.length} | 成功: ${successCount}`);
    }
    /**
     * 执行状态转换回调
     */
    async executeStateTransitionCallbacks(state) {
        const callbacks = this.stateTransitionCallbacks.get(state) || [];
        if (callbacks.length > 0) {
            console.log(`📞 Executing ${callbacks.length} callbacks for state: ${state}`);
            for (const callback of callbacks) {
                try {
                    await callback(state, this.emotionEngine.getCurrentEmotion());
                }
                catch (error) {
                    console.error(`❌ State transition callback failed:`, error);
                }
            }
        }
    }
    /**
     * 注册状态转换回调
     */
    onStateTransition(state, callback) {
        if (!this.stateTransitionCallbacks.has(state)) {
            this.stateTransitionCallbacks.set(state, []);
        }
        this.stateTransitionCallbacks.get(state).push(callback);
        console.log(`📞 Registered callback for state: ${state}`);
    }
    /**
     * 获取状态历史
     */
    getStateHistory() {
        return [...this.stateHistory];
    }
    /**
     * 🎛️ 获取状态统计（用于节奏分析、动画还原）
     * 返回丰富的状态统计信息
     */
    getStateStatistics() {
        console.log(`📈 State statistics requested`);
        console.log(`📜 State history (${this.stateHistory.length} states): [${this.stateHistory.join(' → ')}]`);
        // 1. 计算状态频率
        const stateFrequency = {
            [PetState.Idle]: 0,
            [PetState.Hover]: 0,
            [PetState.Awaken]: 0,
            [PetState.Control]: 0
        };
        // 统计每个状态出现的次数
        this.stateHistory.forEach(state => {
            stateFrequency[state] = (stateFrequency[state] || 0) + 1;
        });
        // 加上当前状态（如果不在历史中）
        if (!this.stateHistory.includes(this.currentState)) {
            stateFrequency[this.currentState] = (stateFrequency[this.currentState] || 0) + 1;
        }
        // 2. 找出最频繁的状态
        let mostFrequentState = this.currentState;
        let maxCount = 0;
        Object.entries(stateFrequency).forEach(([state, count]) => {
            if (count > maxCount) {
                maxCount = count;
                mostFrequentState = state;
            }
        });
        // 3. 准备统计结果
        const statistics = {
            stateHistory: [...this.stateHistory],
            currentState: this.currentState,
            mostFrequentState,
            stateFrequency
        };
        // 4. 输出详细统计信息
        console.log(`📊 Current state: ${statistics.currentState}`);
        console.log(`🏆 Most frequent state: ${statistics.mostFrequentState} (${maxCount} times)`);
        console.log(`📊 State frequency breakdown:`);
        Object.entries(stateFrequency).forEach(([state, count]) => {
            const percentage = this.stateHistory.length > 0 ? ((count / this.stateHistory.length) * 100).toFixed(1) : '0.0';
            console.log(`   • ${state}: ${count} times (${percentage}%)`);
        });
        return statistics;
    }
    /**
     * 注册插件
     */
    async registerPlugin(plugin) {
        await this.pluginRegistry.registerPlugin(plugin);
        this.emit('plugin_registered', { plugin });
    }
    /**
     * 卸载插件
     */
    async unregisterPlugin(pluginId) {
        await this.pluginRegistry.unregisterPlugin(pluginId);
        this.emit('plugin_unregistered', { pluginId });
    }
    /**
     * 🎛️ 获取当前状态（用于 UI 层同步）
     */
    getCurrentState() {
        console.log(`📊 Current state requested: ${this.currentState}`);
        return this.currentState;
    }
    /**
     * 获取当前情绪
     */
    getCurrentEmotion() {
        const emotionContext = this.emotionEngine.getCurrentEmotion();
        const display = this.emotionEngine.getEmotionDisplay();
        return {
            emotion: emotionContext.currentEmotion,
            intensity: emotionContext.intensity,
            display
        };
    }
    /**
     * 获取系统状态
     */
    getSystemStatus() {
        return {
            state: this.currentState,
            emotion: this.emotionEngine.getCurrentEmotion().currentEmotion,
            pluginCount: this.pluginRegistry.getAllPlugins().length,
            memoryUsage: this.stateMemory.getMemoryStats(),
            uptime: Date.now() - this.lastInteractionTime,
            lastInteraction: this.lastInteractionTime
        };
    }
    /**
     * 获取推荐操作
     */
    getRecommendedActions() {
        const usagePatterns = this.stateMemory.analyzeUsagePatterns();
        const currentEmotion = this.emotionEngine.getCurrentEmotion();
        const currentHour = new Date().getHours();
        const recommendations = [];
        // 基于使用模式推荐
        if (usagePatterns.commonIntents.includes('screenshot')) {
            recommendations.push('screenshot');
        }
        if (usagePatterns.commonIntents.includes('note')) {
            recommendations.push('note');
        }
        // 基于情绪推荐
        switch (currentEmotion.currentEmotion) {
            case EmotionType.Excited:
                recommendations.push('chat', 'explore');
                break;
            case EmotionType.Focused:
                recommendations.push('screenshot', 'note');
                break;
            case EmotionType.Sleepy:
                recommendations.push('settings', 'help');
                break;
        }
        // 基于时间推荐
        if (currentHour >= 9 && currentHour < 18) {
            recommendations.push('screenshot', 'note', 'copy');
        }
        else if (currentHour >= 18 && currentHour < 22) {
            recommendations.push('chat', 'settings');
        }
        return Array.from(new Set(recommendations)).slice(0, 4);
    }
    /**
     * 心跳机制
     */
    startHeartbeat() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
        }
        this.heartbeatTimer = setInterval(() => {
            // 情绪衰减
            this.emotionEngine.tick(5000); // 5秒间隔
            // 内存清理
            if (Math.random() < 0.1) { // 10% 概率进行清理
                this.stateMemory.cleanup();
            }
            // 空闲检测
            const idleTime = Date.now() - this.lastInteractionTime;
            if (idleTime > 300000) { // 5分钟无交互
                if (this.currentState !== PetState.Idle) {
                    this.transitionToState(PetState.Idle);
                }
            }
            // 发送心跳事件
            this.emit('heartbeat', {
                state: this.currentState,
                emotion: this.emotionEngine.getCurrentEmotion(),
                idleTime
            });
        }, 5000);
    }
    /**
     * 加载用户偏好
     */
    async loadUserPreferences() {
        // 这里可以从本地存储或云端加载用户偏好
        // 暂时使用默认设置
        this.stateMemory.recordPreference('appearance', 'skin', 'tangyuan', 1.0);
        this.stateMemory.recordPreference('behavior', 'response_speed', 'normal', 1.0);
        this.stateMemory.recordPreference('interaction', 'verbose_mode', false, 1.0);
    }
    /**
     * 判断输入是否像命令
     */
    isCommandLike(input) {
        return input.length < 10 && !/[？?。！!，,]/.test(input);
    }
    /**
     * 事件系统
     */
    on(event, listener) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(listener);
    }
    off(event, listener) {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            const index = listeners.indexOf(listener);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }
    emit(event, data) {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            listeners.forEach(listener => {
                try {
                    listener(data);
                }
                catch (error) {
                    console.error(`❌ Error in event listener for ${event}:`, error);
                }
            });
        }
    }
    /**
     * 销毁主脑系统
     */
    async destroy() {
        console.log('🧠 Starting PetBrain destruction...');
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
        // 销毁 PetBrainBridge
        try {
            console.log('🌉 Destroying PetBrainBridge...');
            this.petBrainBridge.destroy();
            console.log('✅ PetBrainBridge destroyed successfully');
        }
        catch (error) {
            console.error('❌ Error destroying PetBrainBridge:', error);
        }
        // 卸载所有插件
        const plugins = this.pluginRegistry.getAllPlugins();
        for (const plugin of plugins) {
            try {
                await this.pluginRegistry.unregisterPlugin(plugin.id);
            }
            catch (error) {
                console.error(`❌ Error unregistering plugin ${plugin.id}:`, error);
            }
        }
        this.eventListeners.clear();
        this.isInitialized = false;
        console.log('🧠 PetBrain destroyed');
    }
    /**
     * 便利方法：进入静碗状态（使用 PetBrainBridge）
     */
    async enterIdleState() {
        console.log(`💤 Entering Idle state (静碗) via PetBrainBridge`);
        await this.transitionToState(PetState.Idle);
    }
    /**
     * 便利方法：进入感应状态（使用 PetBrainBridge）
     */
    async enterHoverState() {
        console.log(`✨ Entering Hover state (感应碗) via PetBrainBridge`);
        await this.transitionToState(PetState.Hover);
    }
    /**
     * 便利方法：进入唤醒状态（使用 PetBrainBridge）
     */
    async enterAwakenState() {
        console.log(`🌟 Entering Awaken state (唤醒碗) via PetBrainBridge`);
        await this.transitionToState(PetState.Awaken);
    }
    /**
     * 便利方法：进入控制状态（使用 PetBrainBridge）
     */
    async enterControlState() {
        console.log(`⚙️ Entering Control state (控制碗) via PetBrainBridge`);
        await this.transitionToState(PetState.Control);
    }
    /**
     * 模拟鼠标悬浮事件（使用 PetBrainBridge）
     */
    async onMouseHover() {
        console.log(`🖱️ Mouse hover detected`);
        if (this.currentState === PetState.Idle) {
            await this.transitionToState(PetState.Hover);
            // 额外的事件驱动调度
            await this.dispatchEventBehavior('user_hover');
        }
    }
    /**
     * 模拟左键点击事件（使用 PetBrainBridge）
     */
    async onLeftClick() {
        console.log(`👆 Left click detected`);
        if (this.currentState === PetState.Hover) {
            await this.transitionToState(PetState.Awaken);
            await this.dispatchEventBehavior('user_click');
        }
        else if (this.currentState === PetState.Idle) {
            await this.transitionToState(PetState.Hover);
            await this.dispatchEventBehavior('user_interaction');
        }
    }
    /**
     * 模拟右键点击事件（使用 PetBrainBridge）
     */
    async onRightClick() {
        console.log(`👆 Right click detected`);
        await this.transitionToState(PetState.Control);
        await this.dispatchEventBehavior('user_right_click');
    }
    /**
     * 模拟鼠标离开事件（使用 PetBrainBridge）
     */
    async onMouseLeave() {
        console.log(`🖱️ Mouse leave detected`);
        if (this.currentState === PetState.Hover) {
            // 延迟返回静态，给用户思考时间
            setTimeout(async () => {
                if (this.currentState === PetState.Hover) {
                    await this.transitionToState(PetState.Idle);
                    await this.dispatchEventBehavior('user_leave');
                }
            }, 3000); // 3秒延迟
        }
    }
    /**
     * 获取当前状态的可用操作
     */
    getAvailableActions() {
        const currentEmotion = this.emotionEngine.getCurrentEmotion();
        switch (this.currentState) {
            case PetState.Idle:
                return {
                    state: this.currentState,
                    actions: ['hover', 'click', 'right_click'],
                    description: '静碗状态 - 汤圆安静漂浮，等待交互',
                    emotion: currentEmotion.currentEmotion
                };
            case PetState.Hover:
                return {
                    state: this.currentState,
                    actions: ['click_to_awaken', 'right_click_settings', 'leave'],
                    description: '感应碗状态 - 汤圆感知用户，准备响应',
                    emotion: currentEmotion.currentEmotion
                };
            case PetState.Awaken:
                return {
                    state: this.currentState,
                    actions: ['screenshot', 'note', 'copy', 'cast', 'back_to_hover'],
                    description: '唤醒碗状态 - 工具功能已激活',
                    emotion: currentEmotion.currentEmotion
                };
            case PetState.Control:
                return {
                    state: this.currentState,
                    actions: ['settings', 'preferences', 'plugins', 'chat', 'skin_change', 'back_to_idle'],
                    description: '控制碗状态 - 设置和配置面板',
                    emotion: currentEmotion.currentEmotion
                };
            default:
                return {
                    state: this.currentState,
                    actions: [],
                    description: '未知状态',
                    emotion: currentEmotion.currentEmotion
                };
        }
    }
    /**
     * 设置默认状态转换回调
     */
    async setupDefaultStateCallbacks() {
        console.log('📞 Setting up default state transition callbacks');
        // 静碗状态回调
        this.onStateTransition(PetState.Idle, async (state, emotion) => {
            console.log(`💤 Idle state callback: emotion=${emotion.currentEmotion}`);
            // 可以在这里添加静态状态的特定逻辑
        });
        // 感应状态回调
        this.onStateTransition(PetState.Hover, async (state, emotion) => {
            console.log(`✨ Hover state callback: emotion=${emotion.currentEmotion}`);
            // 可以在这里添加悬浮提示逻辑
        });
        // 唤醒状态回调
        this.onStateTransition(PetState.Awaken, async (state, emotion) => {
            console.log(`🌟 Awaken state callback: emotion=${emotion.currentEmotion}`);
            // 可以在这里添加工具激活逻辑
        });
        // 控制状态回调
        this.onStateTransition(PetState.Control, async (state, emotion) => {
            console.log(`⚙️ Control state callback: emotion=${emotion.currentEmotion}`);
            // 可以在这里添加设置面板逻辑
        });
        console.log('✅ Default state callbacks configured');
    }
    /**
     * 通过 PetBrainBridge 进行情绪驱动的行为调度
     */
    async dispatchEmotionBehavior(emotion) {
        console.log(`😊 Dispatching emotion-driven behavior: ${emotion}`);
        try {
            await this.petBrainBridge.dispatchWithEmotion(this.currentState, emotion);
            console.log(`✅ Emotion behavior dispatch completed for: ${emotion}`);
        }
        catch (error) {
            console.error(`❌ Emotion behavior dispatch failed for ${emotion}:`, error);
        }
    }
    /**
     * 通过 PetBrainBridge 进行事件驱动的行为调度
     */
    async dispatchEventBehavior(eventName) {
        console.log(`📡 Dispatching event-driven behavior: ${eventName}`);
        try {
            await this.petBrainBridge.dispatchEvent(eventName);
            console.log(`✅ Event behavior dispatch completed for: ${eventName}`);
        }
        catch (error) {
            console.error(`❌ Event behavior dispatch failed for ${eventName}:`, error);
        }
    }
    /**
     * 替换原有的情绪更新逻辑，通过 PetBrainBridge 统一处理
     */
    async updateEmotionWithBehaviorDispatch(emotion, intensity = 0.7) {
        console.log(`😊 Updating emotion with behavior dispatch: ${emotion} (intensity: ${intensity})`);
        // 1. 更新情绪引擎
        this.emotionEngine.setEmotion(emotion, intensity, 30000);
        // 2. 通过 Bridge 调度相应行为
        await this.dispatchEmotionBehavior(emotion);
        // 3. 发送情绪变化事件
        this.emit('emotion_changed', {
            emotion,
            intensity,
            timestamp: Date.now(),
            state: this.currentState
        });
    }
    /**
     * 获取 PetBrainBridge 实例（用于高级控制）
     */
    getPetBrainBridge() {
        return this.petBrainBridge;
    }
    /**
     * 重置 PetBrainBridge 状态
     */
    async resetBehaviorSystem() {
        console.log('🔄 Resetting PetBrainBridge behavior system...');
        try {
            this.petBrainBridge.reset();
            console.log('✅ PetBrainBridge reset completed');
        }
        catch (error) {
            console.error('❌ Failed to reset PetBrainBridge:', error);
        }
    }
    /**
     * 获取 PetBrainBridge 状态统计
     */
    getBehaviorSystemStats() {
        return this.petBrainBridge.getStats();
    }
}
//# sourceMappingURL=PetBrain.js.map