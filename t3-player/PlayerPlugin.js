/**
 * DirPlayer 播放器插件
 *
 * 封装 Rust 播放器核心逻辑，提供 JavaScript 接口
 * 支持视频分块播放、情绪驱动策略和自适应质量
 */
/**
 * DirPlayer 播放器插件类
 */
export class PlayerPlugin {
    constructor() {
        this.id = 'player';
        this.name = 'DirPlayer 播放器';
        this.description = '基于 Rust 的高性能视频播放器插件';
        this.version = '1.0.0';
        // 支持的意图类型
        this.supportedIntents = ['play_video', 'pause_video', 'stop_video', 'seek_video'];
        // 插件能力声明
        this.capabilities = {
            stateAware: true,
            emotionAware: true,
            contextAware: true,
            supportedHooks: ['onStateChanged', 'onEmotionChanged']
        };
        // 当前播放任务和状态
        this.currentTask = null;
        this.chunkList = [];
        this.eventListeners = new Map();
        console.log('🎬 PlayerPlugin 初始化完成');
    }
    /**
     * 插件初始化
     */
    async initialize() {
        try {
            // 初始化 Rust 模块（如果需要）
            console.log('🎬 [PlayerPlugin] 开始初始化...');
            // 检查 Rust 桥接模块是否可用
            if (typeof dirPlayerBridge === 'undefined') {
                throw new Error('DirPlayer Rust 桥接模块不可用');
            }
            console.log('✅ [PlayerPlugin] 初始化完成');
        }
        catch (error) {
            console.error('❌ [PlayerPlugin] 初始化失败:', error);
            throw error;
        }
    }
    /**
     * 执行插件功能
     */
    async execute(intent, context) {
        try {
            console.log(`🎬 [PlayerPlugin] 执行意图: ${intent.type}`, intent.parameters);
            switch (intent.type) {
                case 'play_video':
                    return await this.handlePlayVideo(intent, context);
                case 'pause_video':
                    return await this.handlePauseVideo(intent, context);
                case 'stop_video':
                    return await this.handleStopVideo(intent, context);
                case 'seek_video':
                    return await this.handleSeekVideo(intent, context);
                default:
                    return {
                        success: false,
                        data: null,
                        message: `不支持的播放器操作: ${intent.type}`
                    };
            }
        }
        catch (error) {
            console.error('❌ [PlayerPlugin] 执行失败:', error);
            return {
                success: false,
                data: null,
                message: `播放器执行失败: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }
    /**
     * 处理播放视频请求
     */
    async handlePlayVideo(intent, context) {
        const { videoId, chunkPolicy = 'linear', autoPlay = true, emotionSync = false } = intent.parameters;
        if (!videoId) {
            return {
                success: false,
                data: null,
                message: '缺少视频ID参数'
            };
        }
        try {
            // 根据情绪状态决定播放策略
            let finalChunkPolicy = chunkPolicy;
            if (emotionSync && context.emotion) {
                finalChunkPolicy = this.getEmotionDrivenPolicy(context.emotion.currentEmotion);
            }
            // 创建视频分块配置
            const config = {
                videoId,
                chunkPolicy: finalChunkPolicy,
                totalDuration: intent.parameters.duration || 60,
                chunkSize: intent.parameters.chunkSize || 5,
                quality: intent.parameters.quality || 'auto'
            };
            // 调用 Rust 核心创建分块列表
            console.log('🎬 [PlayerPlugin] 创建视频分块列表...', config);
            this.chunkList = dirPlayerBridge.createMovieChunkList(config);
            // 创建播放任务
            this.currentTask = {
                videoId,
                autoPlay,
                emotionSync,
                startFrom: intent.parameters.startFrom || 0,
                endAt: intent.parameters.endAt,
                onChunkChange: (chunk) => this.handleChunkChange(chunk),
                onPlaybackComplete: () => this.handlePlaybackComplete()
            };
            // 如果启用自动播放，开始播放第一个分块
            if (autoPlay) {
                await this.startPlayback();
            }
            this.emit('video_prepared', {
                videoId,
                chunkCount: this.chunkList.length,
                policy: finalChunkPolicy,
                autoPlay
            });
            return {
                success: true,
                data: {
                    videoId,
                    chunkCount: this.chunkList.length,
                    chunkPolicy: finalChunkPolicy,
                    chunks: this.chunkList,
                    state: dirPlayerBridge.getPlayerState()
                },
                message: `✅ 视频 ${videoId} 准备完成，共 ${this.chunkList.length} 个分块`
            };
        }
        catch (error) {
            console.error('❌ [PlayerPlugin] 播放视频失败:', error);
            return {
                success: false,
                data: null,
                message: `播放视频失败: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }
    /**
     * 处理暂停视频请求
     */
    async handlePauseVideo(intent, context) {
        try {
            const state = dirPlayerBridge.getPlayerState();
            if (!state.isPlaying) {
                return {
                    success: false,
                    data: state,
                    message: '当前没有视频在播放'
                };
            }
            // 通知 Rust 暂停播放
            dirPlayerBridge.onMovieChunkListChanged({
                videoId: state.currentVideoId || '',
                eventType: 'playback_paused',
                chunkIndex: state.currentChunkIndex,
                timestamp: Date.now()
            });
            this.emit('video_paused', { videoId: state.currentVideoId });
            return {
                success: true,
                data: dirPlayerBridge.getPlayerState(),
                message: '⏸️ 视频已暂停'
            };
        }
        catch (error) {
            return {
                success: false,
                data: null,
                message: `暂停视频失败: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }
    /**
     * 处理停止视频请求
     */
    async handleStopVideo(intent, context) {
        try {
            const state = dirPlayerBridge.getPlayerState();
            // 通知 Rust 播放完成
            if (state.currentVideoId) {
                dirPlayerBridge.onMovieChunkListChanged({
                    videoId: state.currentVideoId,
                    eventType: 'playback_completed',
                    timestamp: Date.now()
                });
            }
            // 清理当前任务
            this.currentTask = null;
            this.chunkList = [];
            this.emit('video_stopped', { videoId: state.currentVideoId });
            return {
                success: true,
                data: dirPlayerBridge.getPlayerState(),
                message: '⏹️ 视频已停止'
            };
        }
        catch (error) {
            return {
                success: false,
                data: null,
                message: `停止视频失败: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }
    /**
     * 处理视频跳转请求
     */
    async handleSeekVideo(intent, context) {
        const { seekTime, chunkIndex } = intent.parameters;
        try {
            const state = dirPlayerBridge.getPlayerState();
            if (!state.currentVideoId) {
                return {
                    success: false,
                    data: null,
                    message: '当前没有视频在播放'
                };
            }
            let targetChunkIndex = chunkIndex;
            // 如果提供了时间，计算对应的分块索引
            if (seekTime !== undefined && this.chunkList.length > 0) {
                targetChunkIndex = this.findChunkIndexByTime(seekTime);
            }
            if (targetChunkIndex !== undefined && targetChunkIndex < this.chunkList.length) {
                // 通知 Rust 切换到指定分块
                dirPlayerBridge.onMovieChunkListChanged({
                    videoId: state.currentVideoId,
                    eventType: 'chunk_started',
                    chunkIndex: targetChunkIndex,
                    timestamp: Date.now()
                });
                this.emit('video_seeked', {
                    videoId: state.currentVideoId,
                    chunkIndex: targetChunkIndex,
                    seekTime
                });
                return {
                    success: true,
                    data: {
                        chunkIndex: targetChunkIndex,
                        chunk: this.chunkList[targetChunkIndex],
                        state: dirPlayerBridge.getPlayerState()
                    },
                    message: `⏭️ 已跳转到分块 ${targetChunkIndex}`
                };
            }
            else {
                return {
                    success: false,
                    data: null,
                    message: '无效的跳转位置'
                };
            }
        }
        catch (error) {
            return {
                success: false,
                data: null,
                message: `视频跳转失败: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }
    /**
     * 开始播放
     */
    async startPlayback() {
        if (!this.currentTask || this.chunkList.length === 0) {
            throw new Error('没有可播放的内容');
        }
        const startChunkIndex = this.findChunkIndexByTime(this.currentTask.startFrom || 0);
        const firstChunk = this.chunkList[startChunkIndex];
        // 通知 Rust 开始播放
        dirPlayerBridge.onMovieChunkListChanged({
            videoId: this.currentTask.videoId,
            eventType: 'chunk_started',
            chunkIndex: startChunkIndex,
            timestamp: Date.now()
        });
        console.log(`▶️ [PlayerPlugin] 开始播放: ${this.currentTask.videoId} - 分块 ${startChunkIndex}`);
    }
    /**
     * 处理分块变化
     */
    handleChunkChange(chunk) {
        console.log(`🔄 [PlayerPlugin] 分块变化: ${chunk.id}`);
        if (this.currentTask?.onChunkChange) {
            this.currentTask.onChunkChange(chunk);
        }
        this.emit('chunk_changed', { chunk });
    }
    /**
     * 处理播放完成
     */
    handlePlaybackComplete() {
        console.log(`✅ [PlayerPlugin] 播放完成: ${this.currentTask?.videoId}`);
        if (this.currentTask?.onPlaybackComplete) {
            this.currentTask.onPlaybackComplete();
        }
        // 检查是否需要循环播放
        if (this.currentTask?.loop) {
            setTimeout(() => {
                this.startPlayback().catch(console.error);
            }, 1000);
        }
        this.emit('playback_completed', { videoId: this.currentTask?.videoId });
    }
    /**
     * 根据情绪获取播放策略
     */
    getEmotionDrivenPolicy(emotion) {
        switch (emotion) {
            case 'excited':
            case 'happy':
                return 'emotion_driven';
            case 'focused':
            case 'curious':
                return 'adaptive';
            default:
                return 'linear';
        }
    }
    /**
     * 根据时间查找分块索引
     */
    findChunkIndexByTime(seekTime) {
        for (let i = 0; i < this.chunkList.length; i++) {
            const chunk = this.chunkList[i];
            if (seekTime >= chunk.startTime && seekTime < chunk.startTime + chunk.duration) {
                return i;
            }
        }
        return 0; // 默认返回第一个分块
    }
    /**
     * 设置播放速度
     */
    setPlaybackSpeed(speed) {
        dirPlayerBridge.setPlaybackSpeed(speed);
        this.emit('speed_changed', { speed });
        console.log(`🚀 [PlayerPlugin] 播放速度设置为: ${speed}x`);
    }
    /**
     * 获取当前播放状态
     */
    getPlayerState() {
        return dirPlayerBridge.getPlayerState();
    }
    /**
     * 获取当前分块列表
     */
    getChunkList() {
        return [...this.chunkList];
    }
    /**
     * 事件监听
     */
    on(event, listener) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(listener);
    }
    /**
     * 移除事件监听
     */
    off(event, listener) {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            const index = listeners.indexOf(listener);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }
    /**
     * 触发事件
     */
    emit(event, data) {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            listeners.forEach(listener => {
                try {
                    listener(data);
                }
                catch (error) {
                    console.error(`❌ [PlayerPlugin] 事件监听器错误 (${event}):`, error);
                }
            });
        }
    }
    /**
     * 插件销毁清理
     */
    async destroy() {
        // 停止当前播放
        if (this.currentTask) {
            await this.handleStopVideo({ type: 'stop_video', parameters: {} }, {});
        }
        // 清理事件监听器
        this.eventListeners.clear();
        console.log('🗑️ [PlayerPlugin] 插件已销毁');
    }
}
export default PlayerPlugin;
//# sourceMappingURL=PlayerPlugin.js.map