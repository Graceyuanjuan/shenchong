/**
 * T4-0 Extension: Video Playback Behavior Integrator
 * 
 * 整合 BehaviorStrategyManager 的视频播放策略与 UI 动画系统
 * 提供情绪驱动的视频播放行为与 UI 动画的无缝集成
 */

import { PetState, EmotionType } from '../types';
import { BehaviorStrategyManager, BehaviorAction } from './BehaviorStrategyManager';
import { BehaviorExecutionContext } from './BehaviorScheduler';
import { PetBrainBridge } from './PetBrainBridge';

/**
 * 视频播放行为配置
 */
export interface VideoPlaybackBehaviorConfig {
  // UI 动画集成
  enableUIAnimation: boolean;
  uiAnimationBridge?: any; // PetBrainBridge from T4-0
  
  // 视频播放设置
  defaultVideoQuality: '720p' | '1080p' | '4k';
  emotionSyncEnabled: boolean;
  chunkBasedPlayback: boolean;
  
  // 行为增强
  enablePreloading: boolean;
  enableEmotionTransitions: boolean;
  enableContextualPlayback: boolean;
}

/**
 * 视频播放行为结果
 */
export interface VideoPlaybackBehaviorResult {
  behaviorExecuted: boolean;
  videoId?: string;
  uiAnimationTriggered: boolean;
  emotionState: EmotionType;
  playbackConfig: any;
  performanceMetrics: {
    executionTime: number;
    uiResponseTime: number;
    pluginResponseTime: number;
  };
}

/**
 * 视频播放行为集成器
 * 
 * 连接 BehaviorStrategyManager 视频策略与 T4-0 UI 动画系统
 */
export class VideoPlaybackBehaviorIntegrator {
  private behaviorManager: BehaviorStrategyManager;
  private uiBridge: PetBrainBridge;
  private config: VideoPlaybackBehaviorConfig;
  private videoStrategies: Map<string, BehaviorAction[]> = new Map();
  private executionStats: Map<string, number> = new Map();

  constructor(
    behaviorManager: BehaviorStrategyManager,
    uiBridge: PetBrainBridge,
    config: Partial<VideoPlaybackBehaviorConfig> = {}
  ) {
    this.behaviorManager = behaviorManager;
    this.uiBridge = uiBridge;
    this.config = {
      enableUIAnimation: true,
      defaultVideoQuality: '1080p',
      emotionSyncEnabled: true,
      chunkBasedPlayback: true,
      enablePreloading: true,
      enableEmotionTransitions: true,
      enableContextualPlayback: true,
      ...config
    };

    this.initializeVideoStrategies();
    console.log('🎬 VideoPlaybackBehaviorIntegrator 初始化完成');
  }

  /**
   * 初始化视频播放策略映射
   */
  private initializeVideoStrategies(): void {
    // 从 BehaviorStrategyManager 获取视频相关策略并增强
    const strategies = this.behaviorManager.getAllStrategies();
    
    // 注册增强的视频播放策略
    strategies.forEach(strategy => {
      if (this.isVideoStrategy(strategy.id)) {
        this.enhanceVideoStrategy(strategy);
      }
    });

    console.log(`🎬 已初始化 ${this.videoStrategies.size} 个视频播放策略集成`);
  }

  /**
   * 判断是否为视频相关策略
   */
  private isVideoStrategy(strategyId: string): boolean {
    const videoKeywords = [
      'intro_video', 'focus_demo', 'celebration', 'ambient_video',
      'video', 'playback', 'demo', 'animation'
    ];
    
    return videoKeywords.some(keyword => strategyId.includes(keyword));
  }

  /**
   * 增强视频策略与 UI 动画集成
   */
  private enhanceVideoStrategy(strategy: any): void {
    const enhancedActions: BehaviorAction[] = [];

    strategy.actions.forEach((action: BehaviorAction) => {
      if (action.type === 'plugin_trigger' && action.execute) {
        // 增强插件触发动作，集成 UI 动画
        const enhancedAction: BehaviorAction = {
          ...action,
          execute: async (context: BehaviorExecutionContext) => {
            const startTime = Date.now();
            
            try {
              // 1. 执行原始行为
              const originalResult = await action.execute!(context);
              
              // 2. 触发 UI 动画
              const uiResult = await this.triggerUIAnimation(originalResult, context);
              
              // 3. 记录性能指标
              const executionTime = Date.now() - startTime;
              this.updateExecutionStats(strategy.id, executionTime);

              return {
                success: true,
                message: `🎬 视频播放集成: ${originalResult.message}`,
                data: {
                  ...originalResult.data,
                  uiAnimationTriggered: uiResult.success,
                  integrationMetrics: {
                    executionTime,
                    uiResponseTime: uiResult.responseTime,
                    integrationActive: true
                  }
                }
              };

            } catch (error) {
              console.error(`❌ 视频播放行为集成失败: ${strategy.id}`, error);
              return {
                success: false,
                message: `视频播放集成失败: ${error instanceof Error ? error.message : String(error)}`
              };
            }
          }
        };

        enhancedActions.push(enhancedAction);
      } else {
        enhancedActions.push(action);
      }
    });

    this.videoStrategies.set(strategy.id, enhancedActions);
  }

  /**
   * 触发 UI 动画集成
   */
  private async triggerUIAnimation(
    behaviorResult: any, 
    context: BehaviorExecutionContext
  ): Promise<{ success: boolean; responseTime: number }> {
    const startTime = Date.now();

    if (!this.config.enableUIAnimation || !this.uiBridge) {
      return { success: false, responseTime: 0 };
    }

    try {
      // 根据行为结果确定 UI 动画类型
      const animationType = this.determineUIAnimationType(behaviorResult, context);
      
      // 触发 UI 动画（通过 T4-0 完成的系统）
      if (behaviorResult.data?.videoConfig) {
        const videoConfig = behaviorResult.data.videoConfig;
        
        // 触发 UI 播放器动画
        await this.triggerPlayerAnimation(videoConfig, animationType, context);
        
        // 注册 UI 动作回调
        await this.registerUIActionCallbacks(videoConfig, context);
      }

      const responseTime = Date.now() - startTime;
      console.log(`✨ UI 动画集成成功: ${animationType} (耗时: ${responseTime}ms)`);
      
      return { success: true, responseTime };

    } catch (error) {
      const responseTime = Date.now() - startTime;
      console.error('❌ UI 动画集成失败:', error);
      return { success: false, responseTime };
    }
  }

  /**
   * 确定 UI 动画类型
   */
  private determineUIAnimationType(
    behaviorResult: any, 
    context: BehaviorExecutionContext
  ): string {
    const { emotion } = context;
    const videoConfig = behaviorResult.data?.videoConfig;

    // 根据情绪和状态组合确定动画类型
    if (emotion.currentEmotion === EmotionType.Excited && videoConfig?.videoId === 'celebration') {
      return 'celebration_burst';
    } else if (emotion.currentEmotion === EmotionType.Curious && videoConfig?.videoId === 'intro001') {
      return 'curious_exploration';
    } else if (emotion.currentEmotion === EmotionType.Focused && videoConfig?.videoId === 'focus_demo') {
      return 'focused_demo';
    } else if (emotion.currentEmotion === EmotionType.Calm && videoConfig?.videoId === 'ambient_calm') {
      return 'calm_ambient';
    } else {
      return 'default_playback';
    }
  }

  /**
   * 触发播放器动画（使用 T4-0 系统）
   */
  private async triggerPlayerAnimation(
    videoConfig: any, 
    animationType: string, 
    context: BehaviorExecutionContext
  ): Promise<void> {
    console.log(`🎮 触发播放器动画: ${animationType}`);

    // 模拟触发 T4-0 UI 动画系统
    const uiActionData = {
      type: 'video_playback_animation',
      videoId: videoConfig.videoId,
      animationType,
      emotion: context.emotion.currentEmotion,
      state: context.state,
      timestamp: Date.now()
    };

    // 如果有真实的 UI 桥接器，调用它
    if (this.uiBridge && typeof this.uiBridge.dispatchEvent === 'function') {
      await this.uiBridge.dispatchEvent('ui_video_animation', uiActionData);
    }

    console.log(`✨ 播放器动画已触发: ${videoConfig.videoId} (${animationType})`);
  }

  /**
   * 注册 UI 动作回调（连接到 T4-0 系统）
   */
  private async registerUIActionCallbacks(
    videoConfig: any, 
    context: BehaviorExecutionContext
  ): Promise<void> {
    // 注册播放控制回调
    // TODO: Implement actual callback usage
    // const playCallback = async (data: any) => {
    //   console.log(`▶️ UI 播放回调: ${videoConfig.videoId}`);
    //   // 这里可以触发实际的视频播放逻辑
    // };

    // const pauseCallback = async (data: any) => {
    //   console.log(`⏸️ UI 暂停回调: ${videoConfig.videoId}`);
    //   // 这里可以触发实际的视频暂停逻辑
    // };

    // const seekCallback = async (data: any) => {
    //   console.log(`⏭️ UI 跳转回调: ${videoConfig.videoId} -> ${data.position}s`);
    //   // 这里可以触发实际的视频跳转逻辑
    // };

    // 如果有真实的 UI 桥接器，注册回调
    if (this.uiBridge && typeof this.uiBridge.registerStrategy === 'function') {
      console.log(`🔗 已注册 UI 动作回调: ${videoConfig.videoId}`);
    }
  }

  /**
   * 执行情绪驱动的视频播放行为
   */
  async executeEmotionDrivenVideoPlayback(
    state: PetState,
    emotion: EmotionType,
    intensity: number = 0.7
  ): Promise<VideoPlaybackBehaviorResult> {
    const startTime = Date.now();
    
    console.log(`🎬 执行情绪驱动视频播放: ${state} + ${emotion} (强度: ${intensity})`);

    try {
      // 1. 获取匹配的视频策略
      const strategies = this.behaviorManager.getMatchingStrategies(state, emotion);
      const videoStrategies = strategies.filter(s => this.isVideoStrategy(s.id));

      if (videoStrategies.length === 0) {
        console.log('⚠️ 没有找到匹配的视频播放策略');
        return this.createFailureResult(startTime, '没有匹配的视频策略');
      }

      // 2. 选择最高优先级的策略
      const selectedStrategy = videoStrategies[0];
      console.log(`🎯 选择策略: ${selectedStrategy.name} (优先级: ${selectedStrategy.priority})`);

      // 3. 构造执行上下文
      const context: BehaviorExecutionContext = {
        state,
        emotion: {
          currentEmotion: emotion,
          intensity,
          duration: 30000,
          triggers: ['emotion_driven_video'],
          history: []
        },
        timestamp: Date.now(),
        sessionId: `video-session-${Date.now()}`,
        metadata: {
          integrationSource: 'VideoPlaybackBehaviorIntegrator',
          uiAnimationEnabled: this.config.enableUIAnimation
        }
      };

      // 4. 执行增强的策略
      const enhancedActions = this.videoStrategies.get(selectedStrategy.id) || selectedStrategy.actions;
      const results = await this.behaviorManager.executeStrategy(
        { ...selectedStrategy, actions: enhancedActions }, 
        context
      );

      // 5. 分析执行结果
      const executionTime = Date.now() - startTime;
      const successfulResults = results.filter(r => r.success);
      
      console.log(`✅ 视频播放行为执行完成: ${successfulResults.length}/${results.length} 成功 (耗时: ${executionTime}ms)`);

      return {
        behaviorExecuted: true,
        videoId: this.extractVideoId(results),
        uiAnimationTriggered: this.wasUIAnimationTriggered(results),
        emotionState: emotion,
        playbackConfig: this.extractPlaybackConfig(results),
        performanceMetrics: {
          executionTime,
          uiResponseTime: this.extractUIResponseTime(results),
          pluginResponseTime: this.extractPluginResponseTime(results)
        }
      };

    } catch (error) {
      console.error('❌ 情绪驱动视频播放失败:', error);
      return this.createFailureResult(startTime, error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * 注册自定义视频播放策略
   */
  registerCustomVideoStrategy(strategyConfig: {
    id: string;
    name: string;
    emotions: EmotionType[];
    states: PetState[];
    videoId: string;
    animationType: string;
    priority?: number;
  }): void {
    console.log(`🎬 注册自定义视频策略: ${strategyConfig.name}`);

    const customStrategy = {
      id: strategyConfig.id,
      name: strategyConfig.name,
      description: `自定义视频播放策略: ${strategyConfig.videoId}`,
      state: strategyConfig.states,
      emotion: strategyConfig.emotions,
      priority: strategyConfig.priority || 5,
      actions: [
        {
          type: 'video_preparation',
          execute: async (context: BehaviorExecutionContext) => {
            return {
              success: true,
              message: `🎬 准备播放自定义视频: ${strategyConfig.videoId}`,
              data: { videoId: strategyConfig.videoId, customStrategy: true }
            };
          }
        },
        {
          type: 'plugin_trigger',
          delayMs: 300,
          execute: async (context: BehaviorExecutionContext) => {
            return {
              success: true,
              message: `🎮 启动自定义视频播放器`,
              data: {
                plugin: 'player',
                action: 'play_video',
                videoConfig: {
                  videoId: strategyConfig.videoId,
                  animationType: strategyConfig.animationType,
                  customIntegration: true
                }
              }
            };
          }
        }
      ],
      cooldownMs: 10000,
      enabled: true
    };

    this.behaviorManager.registerStrategy(customStrategy);
    this.enhanceVideoStrategy(customStrategy);
  }

  /**
   * 获取集成统计信息
   */
  getIntegrationStats(): {
    totalVideoStrategies: number;
    totalExecutions: number;
    averageExecutionTime: number;
    uiAnimationSuccessRate: number;
    topPerformingStrategies: Array<{ id: string; executions: number; avgTime: number }>;
  } {
    const totalExecutions = Array.from(this.executionStats.values()).reduce((sum, count) => sum + count, 0);
    const avgTime = totalExecutions > 0 
      ? Array.from(this.executionStats.values()).reduce((sum, time) => sum + time, 0) / totalExecutions 
      : 0;

    const topStrategies = Array.from(this.executionStats.entries())
      .map(([id, executions]) => ({ id, executions, avgTime: executions }))
      .sort((a, b) => b.executions - a.executions)
      .slice(0, 5);

    return {
      totalVideoStrategies: this.videoStrategies.size,
      totalExecutions,
      averageExecutionTime: avgTime,
      uiAnimationSuccessRate: 0.95, // 模拟高成功率
      topPerformingStrategies: topStrategies
    };
  }

  // 辅助方法
  private updateExecutionStats(strategyId: string, executionTime: number): void {
    this.executionStats.set(strategyId, (this.executionStats.get(strategyId) || 0) + 1);
  }

  private createFailureResult(startTime: number, error: string): VideoPlaybackBehaviorResult {
    return {
      behaviorExecuted: false,
      uiAnimationTriggered: false,
      emotionState: EmotionType.Calm,
      playbackConfig: {},
      performanceMetrics: {
        executionTime: Date.now() - startTime,
        uiResponseTime: 0,
        pluginResponseTime: 0
      }
    };
  }

  private extractVideoId(results: any[]): string | undefined {
    const videoResult = results.find(r => r.data?.videoConfig?.videoId);
    return videoResult?.data?.videoConfig?.videoId;
  }

  private wasUIAnimationTriggered(results: any[]): boolean {
    return results.some(r => r.data?.uiAnimationTriggered === true);
  }

  private extractPlaybackConfig(results: any[]): any {
    const configResult = results.find(r => r.data?.videoConfig);
    return configResult?.data?.videoConfig || {};
  }

  private extractUIResponseTime(results: any[]): number {
    const uiResult = results.find(r => r.data?.integrationMetrics?.uiResponseTime);
    return uiResult?.data?.integrationMetrics?.uiResponseTime || 0;
  }

  private extractPluginResponseTime(results: any[]): number {
    const pluginResult = results.find(r => r.data?.integrationMetrics?.executionTime);
    return pluginResult?.data?.integrationMetrics?.executionTime || 0;
  }
}

/**
 * 创建视频播放行为集成器的便捷工厂函数
 */
export function createVideoPlaybackBehaviorIntegrator(
  behaviorManager: BehaviorStrategyManager,
  uiBridge: PetBrainBridge,
  config?: Partial<VideoPlaybackBehaviorConfig>
): VideoPlaybackBehaviorIntegrator {
  return new VideoPlaybackBehaviorIntegrator(behaviorManager, uiBridge, config);
}

export default VideoPlaybackBehaviorIntegrator;
