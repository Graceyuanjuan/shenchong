/**
 * DirPlayer 播放器插件
 *
 * 封装 Rust 播放器核心逻辑，提供 JavaScript 接口
 * 支持视频分块播放、情绪驱动策略和自适应质量
 */
import { IPlugin, PluginResponse, PluginContext, UserIntent, PluginHookType } from '../types';
/**
 * 视频分块配置接口
 */
export interface MovieChunkConfig {
    videoId: string;
    chunkPolicy: 'linear' | 'adaptive' | 'emotion_driven';
    totalDuration?: number;
    chunkSize?: number;
    quality?: string;
}
/**
 * 视频分块数据接口
 */
export interface MovieChunk {
    id: string;
    startTime: number;
    duration: number;
    url: string;
    metadata: Record<string, string>;
}
/**
 * 分块事件数据接口
 */
export interface ChunkEventData {
    videoId: string;
    eventType: 'chunk_started' | 'chunk_ended' | 'playback_paused' | 'playback_resumed' | 'playback_completed';
    chunkIndex?: number;
    timestamp?: number;
}
/**
 * 播放器状态接口
 */
export interface PlayerState {
    currentVideoId: string | null;
    currentChunkIndex: number;
    isPlaying: boolean;
    playbackSpeed: number;
}
/**
 * 播放任务配置
 */
export interface PlayTask {
    videoId: string;
    autoPlay?: boolean;
    loop?: boolean;
    emotionSync?: boolean;
    startFrom?: number;
    endAt?: number;
    onChunkChange?: (chunk: MovieChunk) => void;
    onPlaybackComplete?: () => void;
}
/**
 * DirPlayer 播放器插件类
 */
export declare class PlayerPlugin implements IPlugin {
    readonly id = "player";
    readonly name = "DirPlayer \u64AD\u653E\u5668";
    readonly description = "\u57FA\u4E8E Rust \u7684\u9AD8\u6027\u80FD\u89C6\u9891\u64AD\u653E\u5668\u63D2\u4EF6";
    readonly version = "1.0.0";
    readonly supportedIntents: string[];
    readonly capabilities: {
        stateAware: boolean;
        emotionAware: boolean;
        contextAware: boolean;
        supportedHooks: PluginHookType[];
    };
    private currentTask;
    private chunkList;
    private eventListeners;
    constructor();
    /**
     * 插件初始化
     */
    initialize(): Promise<void>;
    /**
     * 执行插件功能
     */
    execute(intent: UserIntent, context: PluginContext): Promise<PluginResponse>;
    /**
     * 处理播放视频请求
     */
    private handlePlayVideo;
    /**
     * 处理暂停视频请求
     */
    private handlePauseVideo;
    /**
     * 处理停止视频请求
     */
    private handleStopVideo;
    /**
     * 处理视频跳转请求
     */
    private handleSeekVideo;
    /**
     * 开始播放
     */
    private startPlayback;
    /**
     * 处理分块变化
     */
    private handleChunkChange;
    /**
     * 处理播放完成
     */
    private handlePlaybackComplete;
    /**
     * 根据情绪获取播放策略
     */
    private getEmotionDrivenPolicy;
    /**
     * 根据时间查找分块索引
     */
    private findChunkIndexByTime;
    /**
     * 设置播放速度
     */
    setPlaybackSpeed(speed: number): void;
    /**
     * 获取当前播放状态
     */
    getPlayerState(): PlayerState;
    /**
     * 获取当前分块列表
     */
    getChunkList(): MovieChunk[];
    /**
     * 事件监听
     */
    on(event: string, listener: Function): void;
    /**
     * 移除事件监听
     */
    off(event: string, listener: Function): void;
    /**
     * 触发事件
     */
    private emit;
    /**
     * 插件销毁清理
     */
    destroy(): Promise<void>;
}
export default PlayerPlugin;
//# sourceMappingURL=PlayerPlugin.d.ts.map