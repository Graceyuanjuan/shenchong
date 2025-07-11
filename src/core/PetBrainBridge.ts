/**
 * SaintGrid 神宠系统 - 主脑行为调度桥接器
 * 
 * 作为 PetBrain 和 BehaviorScheduler 之间的统一集成层
 * 负责依赖注入、情绪上下文获取、插件管理器集成和事件驱动调度
 */

import { PetState, EmotionType, EmotionContext, PluginContext } from '../types';
import { BehaviorScheduler, BehaviorExecutionResult } from './BehaviorScheduler';
import { EmotionEngine } from './EmotionEngine';
import { PluginRegistry } from './PluginRegistry';
import { IBehaviorStrategy } from './BehaviorStrategy';
import { createBehaviorSchedulingManager, IBehaviorSchedulingManager } from './BehaviorSchedulingIntegrator';

/**
 * 桥接器配置接口
 */
export interface PetBrainBridgeConfig {
  enableEventDriven?: boolean;
  enableLogging?: boolean;
  autoEmotionUpdate?: boolean;
  defaultEmotionIntensity?: number;
  bridgeId?: string;
}

/**
 * 事件类型定义
 */
export enum BridgeEventType {
  STATE_CHANGED = 'state_changed',
  EMOTION_CHANGED = 'emotion_changed',
  BEHAVIOR_DISPATCHED = 'behavior_dispatched',
  PLUGIN_TRIGGERED = 'plugin_triggered',
  ERROR_OCCURRED = 'error_occurred'
}

/**
 * 事件数据接口
 */
export interface BridgeEventData {
  type: BridgeEventType;
  timestamp: number;
  data: any;
  bridgeId: string;
}

/**
 * 主脑行为调度桥接器类
 * 
 * 提供 PetBrain 与 BehaviorScheduler 之间的统一接口
 * 集成 EmotionEngine 和 PluginRegistry，支持事件驱动调度
 */
export class PetBrainBridge {
  private scheduler: IBehaviorSchedulingManager;
  private emotionEngine?: EmotionEngine;
  private pluginRegistry?: PluginRegistry;
  private config: PetBrainBridgeConfig;
  private bridgeId: string;
  private isInitialized: boolean = false;
  private eventListeners: Map<BridgeEventType, Function[]> = new Map();

  // 状态追踪
  private lastState?: PetState;
  private lastEmotion?: EmotionType;
  private dispatchCount: number = 0;
  private lastDispatchTime: number = 0;

  constructor(config: PetBrainBridgeConfig = {}) {
    this.config = {
      enableEventDriven: true,
      enableLogging: true,
      autoEmotionUpdate: true,
      defaultEmotionIntensity: 0.7,
      bridgeId: `bridge-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      ...config
    };

    this.bridgeId = this.config.bridgeId!;
    
    // 初始化调度管理器（稍后注入依赖）
    this.scheduler = createBehaviorSchedulingManager();

    if (this.config.enableLogging) {
      console.log(`🌉 PetBrainBridge 初始化 | 桥接器ID: ${this.bridgeId}`);
    }
  }

  /**
   * 初始化桥接器 - 注入依赖并完成设置
   */
  public async initPetBrainBridge(
    emotionEngine?: EmotionEngine,
    pluginRegistry?: PluginRegistry
  ): Promise<void> {
    if (this.isInitialized) {
      console.warn('⚠️ PetBrainBridge 已经初始化，跳过重复初始化');
      return;
    }

    try {
      // 注入依赖
      if (emotionEngine) {
        this.setEmotionEngine(emotionEngine);
      }
      
      if (pluginRegistry) {
        this.setPluginManager(pluginRegistry);
      }

      // 重新创建调度管理器（带依赖）
      this.scheduler = createBehaviorSchedulingManager(this.emotionEngine, this.pluginRegistry);

      this.isInitialized = true;

      if (this.config.enableLogging) {
        console.log(`✅ PetBrainBridge 初始化完成 | 情绪引擎: ${!!this.emotionEngine} | 插件管理: ${!!this.pluginRegistry}`);
      }

      // 触发初始化事件
      this.emitEvent(BridgeEventType.STATE_CHANGED, {
        action: 'bridge_initialized',
        hasEmotionEngine: !!this.emotionEngine,
        hasPluginRegistry: !!this.pluginRegistry
      });

    } catch (error) {
      console.error('❌ PetBrainBridge 初始化失败:', error);
      this.emitEvent(BridgeEventType.ERROR_OCCURRED, { 
        error: error instanceof Error ? error.message : '未知错误',
        phase: 'initialization'
      });
      throw error;
    }
  }

  /**
   * 设置情绪引擎
   */
  public setEmotionEngine(engine: EmotionEngine): void {
    this.emotionEngine = engine;
    
    if (this.config.enableLogging) {
      console.log(`🧠 EmotionEngine 已注入到桥接器: ${this.bridgeId}`);
    }

    // 如果桥接器已初始化，重新创建调度管理器
    if (this.isInitialized) {
      this.scheduler = createBehaviorSchedulingManager(this.emotionEngine, this.pluginRegistry);
    }
  }

  /**
   * 设置插件管理器
   */
  public setPluginManager(manager: PluginRegistry): void {
    this.pluginRegistry = manager;
    
    if (this.config.enableLogging) {
      console.log(`🔌 PluginRegistry 已注入到桥接器: ${this.bridgeId}`);
    }

    // 如果桥接器已初始化，重新创建调度管理器
    if (this.isInitialized) {
      this.scheduler = createBehaviorSchedulingManager(this.emotionEngine, this.pluginRegistry);
    }
  }

  /**
   * 主要调度入口 - 自动获取当前情绪
   * 
   * PetBrain 调用此方法触发状态相关的行为调度
   * 情绪上下文会自动从 EmotionEngine 获取
   */
  public async dispatch(state: PetState): Promise<BehaviorExecutionResult> {
    if (!this.isInitialized) {
      throw new Error('PetBrainBridge 未初始化，请先调用 initPetBrainBridge()');
    }

    try {
      // 自动获取当前情绪
      let currentEmotion: EmotionType;
      let emotionContext: EmotionContext | undefined;

      if (this.emotionEngine && typeof this.emotionEngine.getCurrentEmotion === 'function') {
        emotionContext = this.emotionEngine.getCurrentEmotion();
        currentEmotion = emotionContext.currentEmotion;
      } else {
        // 回退到默认情绪
        currentEmotion = EmotionType.Calm;
        if (this.config.enableLogging) {
          console.warn('⚠️ EmotionEngine 不可用，使用默认情绪: Calm');
        }
      }

      return await this.dispatchPetBehavior(state, currentEmotion, {
        currentState: state,
        emotion: emotionContext || {
          currentEmotion,
          intensity: this.config.defaultEmotionIntensity!,
          duration: 30000,
          triggers: ['auto_dispatch'],
          history: []
        }
      });

    } catch (error) {
      console.error('❌ PetBrainBridge dispatch 失败:', error);
      this.emitEvent(BridgeEventType.ERROR_OCCURRED, {
        error: error instanceof Error ? error.message : '未知错误',
        state,
        phase: 'dispatch'
      });
      throw error;
    }
  }

  /**
   * 手动指定情绪的调度入口
   * 
   * 当 PetBrain 需要强制指定特定情绪时使用
   */
  public async dispatchWithEmotion(state: PetState, emotion: EmotionType): Promise<BehaviorExecutionResult> {
    if (!this.isInitialized) {
      throw new Error('PetBrainBridge 未初始化，请先调用 initPetBrainBridge()');
    }

    return await this.dispatchPetBehavior(state, emotion);
  }

  /**
   * 核心行为调度方法
   * 
   * 执行实际的行为调度逻辑，记录状态变化，触发事件
   */
  public async dispatchPetBehavior(
    state: PetState, 
    emotion: EmotionType, 
    context?: PluginContext
  ): Promise<BehaviorExecutionResult> {
    const startTime = Date.now();
    this.dispatchCount++;

    // 检测状态和情绪变化
    const stateChanged = this.lastState !== undefined && this.lastState !== state;
    const emotionChanged = this.lastEmotion !== undefined && this.lastEmotion !== emotion;

    if (this.config.enableLogging) {
      console.log(`🌉 [PetBrainBridge] 调度行为 #${this.dispatchCount} | 状态: ${this.lastState || 'none'} → ${state} | 情绪: ${this.lastEmotion || 'none'} → ${emotion}`);
    }

    try {
      // 更新最后交互时间
      this.scheduler.updateLastInteraction();

      // 根据变化类型选择调度方法
      let result: BehaviorExecutionResult;

      if (stateChanged && emotionChanged) {
        // 状态和情绪都变化 - 使用综合调度
        if (this.config.enableLogging) {
          console.log(`🔄 [PetBrainBridge] 状态+情绪双重变化调度`);
        }
        result = await this.scheduler.schedule(state, emotion, context);
      } else if (stateChanged) {
        // 仅状态变化
        if (this.config.enableLogging) {
          console.log(`🔄 [PetBrainBridge] 状态变化调度`);
        }
        result = await this.scheduler.schedule(state, emotion, context);
      } else if (emotionChanged) {
        // 仅情绪变化
        if (this.config.enableLogging) {
          console.log(`😊 [PetBrainBridge] 情绪变化调度`);
        }
        result = await this.scheduler.schedule(state, emotion, context);
      } else {
        // 普通调度
        result = await this.scheduler.schedule(state, emotion, context);
      }

      // 更新状态追踪
      this.lastState = state;
      this.lastEmotion = emotion;
      this.lastDispatchTime = startTime;

      // 触发事件
      if (stateChanged) {
        this.emitEvent(BridgeEventType.STATE_CHANGED, {
          previousState: this.lastState,
          currentState: state,
          dispatchId: this.dispatchCount
        });
      }

      if (emotionChanged) {
        this.emitEvent(BridgeEventType.EMOTION_CHANGED, {
          previousEmotion: this.lastEmotion,
          currentEmotion: emotion,
          dispatchId: this.dispatchCount
        });
      }

      this.emitEvent(BridgeEventType.BEHAVIOR_DISPATCHED, {
        state,
        emotion,
        result,
        executionTime: Date.now() - startTime,
        dispatchId: this.dispatchCount
      });

      if (this.config.enableLogging) {
        console.log(`✅ [PetBrainBridge] 调度完成 | 执行: ${result.executedBehaviors.length}个行为 | 耗时: ${result.duration}ms`);
      }

      return result;

    } catch (error) {
      console.error('❌ [PetBrainBridge] 行为调度失败:', error);
      this.emitEvent(BridgeEventType.ERROR_OCCURRED, {
        error: error instanceof Error ? error.message : '未知错误',
        state,
        emotion,
        dispatchId: this.dispatchCount
      });
      throw error;
    }
  }

  /**
   * 事件驱动调度 - 根据事件类型智能解析状态和情绪
   * 
   * 支持的事件格式:
   * - "state:idle" - 切换到空闲状态
   * - "emotion:happy" - 切换到开心情绪
   * - "awaken:curious" - 状态和情绪组合
   * - "user_interaction" - 预定义事件
   */
  public async dispatchEvent(event: string, context?: any): Promise<BehaviorExecutionResult | null> {
    if (!this.isInitialized) {
      throw new Error('PetBrainBridge 未初始化，请先调用 initPetBrainBridge()');
    }

    if (this.config.enableLogging) {
      console.log(`📡 [PetBrainBridge] 处理事件: ${event}`);
    }

    try {
      const parsedEvent = this.parseEvent(event);
      
      if (!parsedEvent) {
        console.warn(`⚠️ [PetBrainBridge] 无法解析事件: ${event}`);
        return null;
      }

      const { state, emotion } = parsedEvent;
      
      // 使用解析出的状态和情绪进行调度
      return await this.dispatchPetBehavior(state, emotion, {
        currentState: state,
        emotion: {
          currentEmotion: emotion,
          intensity: this.config.defaultEmotionIntensity!,
          duration: 30000,
          triggers: ['event_driven', event],
          history: []
        },
        interaction: {
          type: 'active',
          trigger: 'manual',
          timestamp: Date.now()
        },
        ...context
      });

    } catch (error) {
      console.error(`❌ [PetBrainBridge] 事件调度失败: ${event}`, error);
      this.emitEvent(BridgeEventType.ERROR_OCCURRED, {
        error: error instanceof Error ? error.message : '未知错误',
        event,
        phase: 'event_dispatch'
      });
      throw error;
    }
  }

  /**
   * 注册自定义行为策略
   */
  public registerStrategy(strategy: IBehaviorStrategy): void {
    this.scheduler.registerStrategy(strategy);
    
    if (this.config.enableLogging) {
      console.log(`🎯 [PetBrainBridge] 注册自定义策略: ${strategy.name}`);
    }
  }

  /**
   * 获取调度统计信息
   */
  public getStats(): {
    bridgeId: string;
    isInitialized: boolean;
    dispatchCount: number;
    lastDispatchTime: number;
    lastState?: PetState;
    lastEmotion?: EmotionType;
    hasEmotionEngine: boolean;
    hasPluginRegistry: boolean;
    strategies: { name: string; description: string; priority: number; }[];
  } {
    return {
      bridgeId: this.bridgeId,
      isInitialized: this.isInitialized,
      dispatchCount: this.dispatchCount,
      lastDispatchTime: this.lastDispatchTime,
      lastState: this.lastState,
      lastEmotion: this.lastEmotion,
      hasEmotionEngine: !!this.emotionEngine,
      hasPluginRegistry: !!this.pluginRegistry,
      strategies: this.scheduler.getStrategies()
    };
  }

  /**
   * 事件监听器管理
   */
  public on(eventType: BridgeEventType, listener: (data: BridgeEventData) => void): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)!.push(listener);
  }

  public off(eventType: BridgeEventType, listener: Function): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * 重置桥接器状态 - 测试或紧急重置用
   */
  public reset(): void {
    if (this.config.enableLogging) {
      console.log(`🔄 [PetBrainBridge] 重置桥接器状态: ${this.bridgeId}`);
    }

    // 重置状态追踪
    this.lastState = undefined;
    this.lastEmotion = undefined;
    this.dispatchCount = 0;
    this.lastDispatchTime = 0;

    // 清除事件监听器
    this.eventListeners.clear();

    // 触发重置事件
    this.emitEvent(BridgeEventType.STATE_CHANGED, {
      action: 'bridge_reset',
      timestamp: Date.now()
    });
  }

  /**
   * 销毁桥接器 - 清理资源
   */
  public destroy(): void {
    if (this.config.enableLogging) {
      console.log(`💥 [PetBrainBridge] 销毁桥接器: ${this.bridgeId}`);
    }

    this.reset();
    this.isInitialized = false;
    this.emotionEngine = undefined;
    this.pluginRegistry = undefined;
  }

  /**
   * 解析事件字符串为状态和情绪
   */
  private parseEvent(event: string): { state: PetState; emotion: EmotionType } | null {
    const eventLower = event.toLowerCase();

    // 预定义事件映射
    const predefinedEvents: Record<string, { state: PetState; emotion: EmotionType }> = {
      'user_interaction': { state: PetState.Hover, emotion: EmotionType.Curious },
      'user_click': { state: PetState.Awaken, emotion: EmotionType.Excited },
      'user_idle': { state: PetState.Idle, emotion: EmotionType.Calm },
      'work_mode': { state: PetState.Control, emotion: EmotionType.Focused },
      'sleep_mode': { state: PetState.Idle, emotion: EmotionType.Sleepy }
    };

    if (predefinedEvents[eventLower]) {
      return predefinedEvents[eventLower];
    }

    // 解析 "state:emotion" 格式
    if (eventLower.includes(':')) {
      const [part1, part2] = eventLower.split(':');
      
      // 尝试解析为 state:emotion
      const state = this.parseState(part1);
      const emotion = this.parseEmotion(part2);
      
      if (state && emotion) {
        return { state, emotion };
      }
    }

    // 解析单独的状态或情绪
    const state = this.parseState(eventLower);
    const emotion = this.parseEmotion(eventLower);

    if (state && emotion) {
      return { state, emotion };
    } else if (state) {
      // 只有状态，使用当前情绪或默认情绪
      return { 
        state, 
        emotion: this.lastEmotion || EmotionType.Calm 
      };
    } else if (emotion) {
      // 只有情绪，使用当前状态或默认状态
      return { 
        state: this.lastState || PetState.Idle, 
        emotion 
      };
    }

    return null;
  }

  /**
   * 解析状态字符串
   */
  private parseState(str: string): PetState | null {
    const stateMap: Record<string, PetState> = {
      'idle': PetState.Idle,
      'hover': PetState.Hover,
      'awaken': PetState.Awaken,
      'control': PetState.Control
    };

    return stateMap[str.toLowerCase()] || null;
  }

  /**
   * 解析情绪字符串
   */
  private parseEmotion(str: string): EmotionType | null {
    const emotionMap: Record<string, EmotionType> = {
      'happy': EmotionType.Happy,
      'calm': EmotionType.Calm,
      'excited': EmotionType.Excited,
      'curious': EmotionType.Curious,
      'sleepy': EmotionType.Sleepy,
      'focused': EmotionType.Focused
    };

    return emotionMap[str.toLowerCase()] || null;
  }

  /**
   * 触发内部事件
   */
  private emitEvent(type: BridgeEventType, data: any): void {
    const eventData: BridgeEventData = {
      type,
      timestamp: Date.now(),
      data,
      bridgeId: this.bridgeId
    };

    const listeners = this.eventListeners.get(type);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(eventData);
        } catch (error) {
          console.error(`❌ [PetBrainBridge] 事件监听器错误 ${type}:`, error);
        }
      });
    }
  }
}

/**
 * 便捷工厂函数 - 快速创建和初始化桥接器
 */
export async function createPetBrainBridge(
  emotionEngine?: EmotionEngine,
  pluginRegistry?: PluginRegistry,
  config?: PetBrainBridgeConfig
): Promise<PetBrainBridge> {
  const bridge = new PetBrainBridge(config);
  await bridge.initPetBrainBridge(emotionEngine, pluginRegistry);
  return bridge;
}

/**
 * 默认桥接器实例 - 单例模式
 */
let defaultBridge: PetBrainBridge | null = null;

export function getDefaultBridge(): PetBrainBridge {
  if (!defaultBridge) {
    defaultBridge = new PetBrainBridge();
  }
  return defaultBridge;
}

export function setDefaultBridge(bridge: PetBrainBridge): void {
  defaultBridge = bridge;
}
