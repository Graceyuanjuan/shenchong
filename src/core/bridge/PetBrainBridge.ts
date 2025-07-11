/**
 * T4-0: 神宠大脑桥接器
 * 
 * 连接 UI 动画组件与 PlayerPlugin 插件系统
 * 支持行为链注册、情绪驱动触发和状态同步
 */

import { PetState, EmotionType, UserIntent, PluginContext, EmotionContext } from '../../types';
import { PlayerPlugin } from '../../plugins/PlayerPlugin';
import { PluginRegistry } from '../PluginRegistry';

// UI 动作类型枚举
export enum UIActionType {
  PLAY_CLICK = 'play_click',
  PAUSE_CLICK = 'pause_click', 
  STOP_CLICK = 'stop_click',
  SEEK_CLICK = 'seek_click',
  VOLUME_CHANGE = 'volume_change',
  BUTTON_HOVER = 'button_hover',
  DOUBLE_CLICK = 'double_click'
}

// UI 动作数据接口
export interface UIActionData {
  type: UIActionType;
  buttonId?: string;
  videoId?: string;
  position?: number;
  volume?: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

// UI 状态更新接口
export interface UIStateUpdate {
  playerState: 'playing' | 'paused' | 'stopped' | 'loading' | 'error';
  currentVideo?: {
    id: string;
    title: string;
    duration: number;
    currentTime: number;
  };
  volume?: number;
  progress?: number;
}

// 情绪驱动触发器接口
export type EmotionDrivenTrigger = (emotion: EmotionType, intensity: number, context?: any) => Promise<void>;

// UI 动作处理器接口
export type UIActionHandler = (data: UIActionData) => Promise<void>;

// 状态同步回调接口
export type StateSyncCallback = (update: UIStateUpdate) => void;

/**
 * 神宠大脑桥接器类
 * 负责 UI 与插件系统的双向通信
 */
export class PetBrainBridge {
  private pluginRegistry: PluginRegistry;
  private playerPlugin!: PlayerPlugin; // 使用 definite assignment assertion
  
  // 动作处理器映射
  private actionHandlers: Map<string, UIActionHandler> = new Map();
  
  // 状态同步回调
  private stateSyncCallbacks: Set<StateSyncCallback> = new Set();
  
  // 情绪驱动触发器
  private emotionTriggers: Map<EmotionType, EmotionDrivenTrigger[]> = new Map();
  
  // 当前状态
  private currentState: {
    petState: PetState;
    emotion: EmotionContext;
    uiState: UIStateUpdate;
  };
  
  // 调试模式
  private debug: boolean = false;

  constructor(pluginRegistry: PluginRegistry, debug = false) {
    this.pluginRegistry = pluginRegistry;
    this.debug = debug;
    
    // 初始化状态
    this.currentState = {
      petState: PetState.Idle,
      emotion: {
        currentEmotion: EmotionType.Calm,
        intensity: 0.5,
        duration: 0,
        triggers: [],
        history: []
      },
      uiState: {
        playerState: 'stopped'
      }
    };
    
    this.log('PetBrainBridge 初始化完成');
  }

  /**
   * 初始化桥接器
   */
  async initialize(): Promise<void> {
    try {
      // 获取 PlayerPlugin 实例
      this.playerPlugin = this.pluginRegistry.getPlugin('player') as PlayerPlugin;
      
      if (!this.playerPlugin) {
        throw new Error('PlayerPlugin 未找到，请先注册插件');
      }
      
      // 注册默认 UI 动作处理器
      this.registerDefaultUIActions();
      
      // 设置插件事件监听
      this.setupPluginEventListeners();
      
      this.log('PetBrainBridge 初始化成功');
      
    } catch (error) {
      console.error('❌ PetBrainBridge 初始化失败:', error);
      throw error;
    }
  }

  /**
   * 注册 UI 动作处理器
   */
  registerUIAction(actionId: string, handler: UIActionHandler): void {
    this.actionHandlers.set(actionId, handler);
    this.log(`注册 UI 动作处理器: ${actionId}`);
  }

  /**
   * 处理 UI 动作
   */
  async handleUIAction(actionData: UIActionData): Promise<void> {
    try {
      this.log(`处理 UI 动作: ${actionData.type}`, actionData);
      
      // 查找对应的处理器
      const handler = this.actionHandlers.get(actionData.type);
      
      if (handler) {
        await handler(actionData);
      } else {
        // 使用默认处理逻辑
        await this.defaultUIActionHandler(actionData);
      }
      
    } catch (error) {
      console.error(`❌ UI 动作处理失败 (${actionData.type}):`, error);
      
      // 通知 UI 错误状态
      this.updateUIState({
        playerState: 'error'
      });
    }
  }

  /**
   * 设置情绪驱动播放触发器
   */
  setEmotionDrivenPlayTrigger(emotionTrigger: EmotionDrivenTrigger): void {
    // 为所有情绪类型注册触发器
    Object.values(EmotionType).forEach(emotion => {
      if (!this.emotionTriggers.has(emotion)) {
        this.emotionTriggers.set(emotion, []);
      }
      this.emotionTriggers.get(emotion)!.push(emotionTrigger);
    });
    
    this.log('设置情绪驱动播放触发器');
  }

  /**
   * 触发情绪驱动行为
   */
  async triggerEmotionDrivenBehavior(emotion: EmotionType, intensity: number, context?: any): Promise<void> {
    this.log(`触发情绪驱动行为: ${emotion} (强度: ${intensity})`);
    
    // 更新当前情绪状态
    this.currentState.emotion.currentEmotion = emotion;
    this.currentState.emotion.intensity = intensity;
    this.currentState.emotion.triggers.push(`ui_emotion_${Date.now()}`);
    
    // 执行注册的情绪触发器
    const triggers = this.emotionTriggers.get(emotion) || [];
    
    for (const trigger of triggers) {
      try {
        await trigger(emotion, intensity, context);
      } catch (error) {
        console.error(`❌ 情绪触发器执行失败 (${emotion}):`, error);
      }
    }
    
    // 执行内置情绪驱动逻辑
    await this.executeBuiltinEmotionLogic(emotion, intensity);
  }

  /**
   * 注册状态同步回调
   */
  onStateSync(callback: StateSyncCallback): void {
    this.stateSyncCallbacks.add(callback);
    this.log('注册状态同步回调');
  }

  /**
   * 移除状态同步回调
   */
  offStateSync(callback: StateSyncCallback): void {
    this.stateSyncCallbacks.delete(callback);
    this.log('移除状态同步回调');
  }

  /**
   * 更新 UI 状态
   */
  updateUIState(update: Partial<UIStateUpdate>): void {
    this.currentState.uiState = { ...this.currentState.uiState, ...update };
    
    this.log('UI 状态更新', this.currentState.uiState);
    
    // 通知所有回调
    this.stateSyncCallbacks.forEach(callback => {
      try {
        callback(this.currentState.uiState);
      } catch (error) {
        console.error('❌ 状态同步回调执行失败:', error);
      }
    });
  }

  /**
   * 获取当前状态
   */
  getCurrentState(): typeof this.currentState {
    return { ...this.currentState };
  }

  /**
   * 注册默认 UI 动作处理器
   */
  private registerDefaultUIActions(): void {
    // 播放按钮点击
    this.registerUIAction('btn_play_idle', async (data) => {
      this.log('播放按钮点击处理');
      
      const videoId = data.videoId || 'intro.mp4';
      
      await this.triggerPlayerPlugin('play_video', {
        videoId,
        autoPlay: true,
        emotionSync: true,
        source: videoId
      });
    });

    // 暂停按钮点击
    this.registerUIAction('btn_pause_hover', async (data) => {
      this.log('暂停按钮点击处理');
      
      await this.triggerPlayerPlugin('pause_video', {});
    });

    // 停止按钮点击
    this.registerUIAction('btn_stop_idle', async (data) => {
      this.log('停止按钮点击处理');
      
      await this.triggerPlayerPlugin('stop_video', {});
    });

    // 跳转按钮双击
    this.registerUIAction('btn_seek_active', async (data) => {
      this.log(`跳转按钮双击处理, 位置: ${data.position}s`);
      
      await this.triggerPlayerPlugin('seek_video', {
        seekTime: data.position || 0,
        position: data.position || 0
      });
    });

    // 音量调节
    this.registerUIAction(UIActionType.VOLUME_CHANGE, async (data) => {
      this.log(`音量调节: ${data.volume}`);
      
      // 更新 UI 状态
      this.updateUIState({
        volume: data.volume
      });
    });

    this.log('默认 UI 动作处理器注册完成');
  }

  /**
   * 默认 UI 动作处理器
   */
  private async defaultUIActionHandler(data: UIActionData): Promise<void> {
    this.log(`使用默认处理器处理: ${data.type}`);
    
    switch (data.type) {
      case UIActionType.PLAY_CLICK:
        await this.triggerPlayerPlugin('play_video', {
          videoId: data.videoId || 'default.mp4'
        });
        break;
        
      case UIActionType.PAUSE_CLICK:
        await this.triggerPlayerPlugin('pause_video', {});
        break;
        
      case UIActionType.STOP_CLICK:
        await this.triggerPlayerPlugin('stop_video', {});
        break;
        
      case UIActionType.SEEK_CLICK:
        await this.triggerPlayerPlugin('seek_video', {
          seekTime: data.position || 0
        });
        break;
        
      case UIActionType.BUTTON_HOVER:
        this.log(`按钮悬浮: ${data.buttonId}`);
        break;
        
      default:
        this.log(`未处理的 UI 动作类型: ${data.type}`);
    }
  }

  /**
   * 触发 PlayerPlugin
   */
  private async triggerPlayerPlugin(intentType: string, parameters: any): Promise<void> {
    try {
      // 构造用户意图
      const intent: UserIntent = {
        type: intentType,
        parameters,
        confidence: 1.0,
        rawInput: `ui_trigger_${intentType}`,
        timestamp: Date.now()
      };

      // 构造插件上下文
      const context: PluginContext = {
        currentState: this.currentState.petState,
        emotion: this.currentState.emotion,
        interaction: {
          type: 'active',
          trigger: 'user_intent',
          timestamp: Date.now()
        }
      };

      this.log(`触发 PlayerPlugin: ${intentType}`, parameters);

      // 更新 UI 状态为加载中
      this.updateUIState({ playerState: 'loading' });

      // 执行插件
      const result = await this.playerPlugin.execute(intent, context);

      if (result.success) {
        this.log(`PlayerPlugin 执行成功: ${result.message}`);
        
        // 根据意图类型更新 UI 状态
        let newState: 'playing' | 'paused' | 'stopped' = 'stopped';
        
        if (intentType === 'play_video') {
          newState = 'playing';
        } else if (intentType === 'pause_video') {
          newState = 'paused';
        } else if (intentType === 'stop_video') {
          newState = 'stopped';
        }
        
        // 更新 UI 状态
        const stateUpdate: UIStateUpdate = { playerState: newState };
        
        if (result.data?.videoId) {
          stateUpdate.currentVideo = {
            id: result.data.videoId,
            title: result.data.videoId,
            duration: result.data.chunks?.[0]?.duration * result.data.chunkCount || 60,
            currentTime: 0
          };
        }
        
        this.updateUIState(stateUpdate);
        
      } else {
        console.error(`❌ PlayerPlugin 执行失败: ${result.message}`);
        this.updateUIState({ playerState: 'error' });
      }

    } catch (error) {
      console.error(`❌ PlayerPlugin 触发失败 (${intentType}):`, error);
      this.updateUIState({ playerState: 'error' });
    }
  }

  /**
   * 设置插件事件监听
   */
  private setupPluginEventListeners(): void {
    if (!this.playerPlugin) return;

    // 监听播放器插件事件
    this.playerPlugin.on('video_prepared', (data: any) => {
      this.log('视频准备完成', data);
      this.updateUIState({
        playerState: 'playing',
        currentVideo: {
          id: data.videoId,
          title: data.videoId,
          duration: 60, // 默认时长
          currentTime: 0
        }
      });
    });

    this.playerPlugin.on('video_paused', (data: any) => {
      this.log('视频已暂停', data);
      this.updateUIState({ playerState: 'paused' });
    });

    this.playerPlugin.on('video_stopped', (data: any) => {
      this.log('视频已停止', data);
      this.updateUIState({ 
        playerState: 'stopped',
        currentVideo: undefined
      });
    });

    this.playerPlugin.on('chunk_changed', (data: any) => {
      this.log('分块变化', data);
      // 可以在这里更新播放进度
    });

    this.playerPlugin.on('playback_completed', (data: any) => {
      this.log('播放完成', data);
      this.updateUIState({ 
        playerState: 'stopped',
        currentVideo: undefined
      });
    });

    this.log('插件事件监听设置完成');
  }

  /**
   * 执行内置情绪驱动逻辑
   */
  private async executeBuiltinEmotionLogic(emotion: EmotionType, intensity: number): Promise<void> {
    this.log(`执行内置情绪逻辑: ${emotion} (${intensity})`);
    
    // 根据情绪类型自动触发播放行为
    if (intensity > 0.7) {
      switch (emotion) {
        case EmotionType.Excited:
          // 兴奋时播放庆祝视频
          await this.triggerPlayerPlugin('play_video', {
            videoId: 'celebration',
            chunkPolicy: 'emotion_driven',
            autoPlay: true
          });
          break;
          
        case EmotionType.Curious:
          // 好奇时播放介绍视频
          await this.triggerPlayerPlugin('play_video', {
            videoId: 'intro001',
            chunkPolicy: 'emotion_driven',
            autoPlay: true
          });
          break;
          
        case EmotionType.Focused:
          // 专注时播放演示视频
          await this.triggerPlayerPlugin('play_video', {
            videoId: 'focus_demo',
            chunkPolicy: 'adaptive',
            autoPlay: true
          });
          break;
          
        case EmotionType.Calm:
        case EmotionType.Sleepy:
          // 平静时播放环境视频
          await this.triggerPlayerPlugin('play_video', {
            videoId: 'ambient_calm',
            chunkPolicy: 'linear',
            autoPlay: true,
            loop: true
          });
          break;
      }
    }
  }

  /**
   * 日志输出
   */
  private log(message: string, data?: any): void {
    if (this.debug) {
      console.log(`🌉 [PetBrainBridge] ${message}`, data || '');
    }
  }

  /**
   * 清理资源
   */
  async destroy(): Promise<void> {
    this.actionHandlers.clear();
    this.stateSyncCallbacks.clear();
    this.emotionTriggers.clear();
    
    this.log('PetBrainBridge 已销毁');
  }
}

export default PetBrainBridge;
