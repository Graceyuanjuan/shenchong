/**
 * SaintGrid 神宠系统 - 主脑调度器
 * 核心指令中枢，统一管理插件注册、意图识别、情绪引擎和记忆存储
 */
import { PetState, EmotionType, IPlugin, PetBrainConfig } from '../types';
import { PetBrainBridge } from './PetBrainBridge';
export declare class PetBrain {
    private currentState;
    private isInitialized;
    private lastInteractionTime;
    private pluginRegistry;
    private intentRouter;
    private emotionEngine;
    private stateMemory;
    private petBrainBridge;
    private config;
    private eventListeners;
    private heartbeatTimer;
    private stateHistory;
    private stateTransitionCallbacks;
    constructor(config?: Partial<PetBrainConfig>);
    /**
     * 初始化主脑系统
     */
    initialize(): Promise<void>;
    /**
     * 处理用户输入（主要入口）
     */
    processInput(input: string, context?: any): Promise<{
        response: string;
        emotion: EmotionType;
        nextState?: PetState;
        actions?: string[];
    }>;
    /**
     * 执行意图
     */
    private executeIntent;
    /**
     * 处理未知意图
     */
    private handleUnknownIntent;
    /**
     * 处理没有找到插件的情况
     */
    private handleNoPluginFound;
    /**
     * 状态转换（增强版，使用 PetBrainBridge）
     */
    transitionToState(newState: PetState): Promise<void>;
    /**
     * 🎛️ 主脑状态管理核心方法
     * 处理状态变化的核心逻辑
     */
    handleStateChange(newState: PetState): void;
    /**
     * 基于状态更新情绪
     */
    private updateEmotionForState;
    /**
     * 触发所有插件的状态响应 - 增强版：支持情绪感知
     */
    private triggerPluginsForState;
    /**
     * 触发插件的 onStateChanged 钩子
     */
    private triggerStateChangedHooks;
    /**
     * 执行状态转换回调
     */
    private executeStateTransitionCallbacks;
    /**
     * 注册状态转换回调
     */
    onStateTransition(state: PetState, callback: Function): void;
    /**
     * 获取状态历史
     */
    getStateHistory(): PetState[];
    /**
     * 🎛️ 获取状态统计（用于节奏分析、动画还原）
     * 返回丰富的状态统计信息
     */
    getStateStatistics(): {
        stateHistory: PetState[];
        currentState: PetState;
        mostFrequentState: PetState;
        stateFrequency: Record<PetState, number>;
    };
    /**
     * 注册插件
     */
    registerPlugin(plugin: IPlugin): Promise<void>;
    /**
     * 卸载插件
     */
    unregisterPlugin(pluginId: string): Promise<void>;
    /**
     * 🎛️ 获取当前状态（用于 UI 层同步）
     */
    getCurrentState(): PetState;
    /**
     * 获取当前情绪
     */
    getCurrentEmotion(): {
        emotion: EmotionType;
        intensity: number;
        display: any;
    };
    /**
     * 获取系统状态
     */
    getSystemStatus(): {
        state: PetState;
        emotion: EmotionType;
        pluginCount: number;
        memoryUsage: any;
        uptime: number;
        lastInteraction: number;
    };
    /**
     * 获取推荐操作
     */
    getRecommendedActions(): string[];
    /**
     * 心跳机制
     */
    private startHeartbeat;
    /**
     * 加载用户偏好
     */
    private loadUserPreferences;
    /**
     * 判断输入是否像命令
     */
    private isCommandLike;
    /**
     * 事件系统
     */
    on(event: string, listener: Function): void;
    off(event: string, listener: Function): void;
    private emit;
    /**
     * 销毁主脑系统
     */
    destroy(): Promise<void>;
    /**
     * 便利方法：进入静碗状态（使用 PetBrainBridge）
     */
    enterIdleState(): Promise<void>;
    /**
     * 便利方法：进入感应状态（使用 PetBrainBridge）
     */
    enterHoverState(): Promise<void>;
    /**
     * 便利方法：进入唤醒状态（使用 PetBrainBridge）
     */
    enterAwakenState(): Promise<void>;
    /**
     * 便利方法：进入控制状态（使用 PetBrainBridge）
     */
    enterControlState(): Promise<void>;
    /**
     * 模拟鼠标悬浮事件（使用 PetBrainBridge）
     */
    onMouseHover(): Promise<void>;
    /**
     * 模拟左键点击事件（使用 PetBrainBridge）
     */
    onLeftClick(): Promise<void>;
    /**
     * 模拟右键点击事件（使用 PetBrainBridge）
     */
    onRightClick(): Promise<void>;
    /**
     * 模拟鼠标离开事件（使用 PetBrainBridge）
     */
    onMouseLeave(): Promise<void>;
    /**
     * 获取当前状态的可用操作
     */
    getAvailableActions(): {
        state: PetState;
        actions: string[];
        description: string;
        emotion: EmotionType;
    };
    /**
     * 设置默认状态转换回调
     */
    private setupDefaultStateCallbacks;
    /**
     * 通过 PetBrainBridge 进行情绪驱动的行为调度
     */
    dispatchEmotionBehavior(emotion: EmotionType): Promise<void>;
    /**
     * 通过 PetBrainBridge 进行事件驱动的行为调度
     */
    dispatchEventBehavior(eventName: string): Promise<void>;
    /**
     * 替换原有的情绪更新逻辑，通过 PetBrainBridge 统一处理
     */
    updateEmotionWithBehaviorDispatch(emotion: EmotionType, intensity?: number): Promise<void>;
    /**
     * 获取 PetBrainBridge 实例（用于高级控制）
     */
    getPetBrainBridge(): PetBrainBridge;
    /**
     * 重置 PetBrainBridge 状态
     */
    resetBehaviorSystem(): Promise<void>;
    /**
     * 获取 PetBrainBridge 状态统计
     */
    getBehaviorSystemStats(): any;
}
//# sourceMappingURL=PetBrain.d.ts.map