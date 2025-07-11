/**
 * T3-B: 行为策略封装模块
 * 
 * 提供基于 PetState + EmotionType 组合的行为策略映射系统
 * 支持优先级排序、延时执行、异步链执行和动态扩展
 */

import { PetState, EmotionType, EmotionContext, PluginContext } from '../types';

/**
 * 行为动作接口
 */
export interface BehaviorAction {
  type: string;
  delayMs?: number;
  priority?: number;
  execute: (context: BehaviorExecutionContext) => Promise<BehaviorActionResult>;
}

/**
 * 行为动作执行结果
 */
export interface BehaviorActionResult {
  success: boolean;
  message?: string;
  data?: any;
  nextActions?: BehaviorAction[];
}

/**
 * 行为执行上下文
 */
export interface BehaviorExecutionContext {
  state: PetState;
  emotion: EmotionContext;
  pluginContext?: PluginContext;
  timestamp: number;
  sessionId: string;
  metadata?: Record<string, any>;
}

/**
 * 行为策略规则接口
 */
export interface BehaviorStrategyRule {
  id: string;
  name: string;
  description: string;
  state: PetState | PetState[];
  emotion: EmotionType | EmotionType[];
  priority: number;
  conditions?: BehaviorCondition[];
  actions: BehaviorAction[];
  cooldownMs?: number;
  maxExecutions?: number;
  enabled: boolean;
}

/**
 * 行为触发条件
 */
export interface BehaviorCondition {
  type: 'emotion_intensity' | 'time_range' | 'state_duration' | 'custom';
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'in' | 'between';
  value: any;
  customCheck?: (context: BehaviorExecutionContext) => boolean;
}

/**
 * 策略执行统计
 */
export interface StrategyExecutionStats {
  ruleId: string;
  executionCount: number;
  lastExecuted: number;
  averageExecutionTime: number;
  successRate: number;
  errors: string[];
}

/**
 * 行为策略管理器
 */
export class BehaviorStrategyManager {
  private strategies: Map<string, BehaviorStrategyRule> = new Map();
  private executionStats: Map<string, StrategyExecutionStats> = new Map();
  private executionQueue: Array<{
    rule: BehaviorStrategyRule;
    context: BehaviorExecutionContext;
    timestamp: number;
  }> = [];
  private isProcessing: boolean = false;

  constructor() {
    this.loadDefaultStrategies();
    console.log('🎯 BehaviorStrategyManager initialized');
  }

  /**
   * 加载默认策略集合
   */
  private loadDefaultStrategies(): void {
    const defaultStrategies: BehaviorStrategyRule[] = [
      // 好奇+唤醒：截图+探索提示
      {
        id: 'curious_awaken_explore',
        name: '好奇探索',
        description: '在唤醒状态下，好奇情绪触发探索行为',
        state: PetState.Awaken,
        emotion: EmotionType.Curious,
        priority: 8,
        actions: [
          {
            type: 'plugin_trigger',
            delayMs: 300,
            execute: async (context) => {
              console.log('🔍 [策略] 好奇探索 - 触发截图插件');
              return {
                success: true,
                message: '📸 开始探索屏幕内容...',
                data: { plugin: 'screenshot', action: 'capture' }
              };
            }
          },
          {
            type: 'user_prompt',
            delayMs: 800,
            execute: async (context) => {
              console.log('💭 [策略] 好奇探索 - 显示探索提示');
              return {
                success: true,
                message: '🔍 发现了什么有趣的内容吗？我可以帮你记录或分析！',
                data: { promptType: 'exploration' }
              };
            }
          }
        ],
        cooldownMs: 5000,
        enabled: true
      },

      // 专注+控制：工具激活
      {
        id: 'focused_control_tools',
        name: '专注工具模式',
        description: '在控制状态下，专注情绪激活生产力工具',
        state: PetState.Control,
        emotion: EmotionType.Focused,
        priority: 9,
        actions: [
          {
            type: 'control_activation',
            execute: async (context) => {
              console.log('🎯 [策略] 专注工具模式 - 激活控制面板');
              return {
                success: true,
                message: '⚙️ 专注模式已激活，准备高效工作！',
                data: { mode: 'productivity', tools: ['screenshot', 'note', 'clipboard'] }
              };
            }
          },
          {
            type: 'plugin_trigger',
            delayMs: 200,
            execute: async (context) => {
              console.log('🔧 [策略] 专注工具模式 - 预加载工具插件');
              return {
                success: true,
                message: '🚀 生产力工具已就绪',
                data: { preloadedPlugins: ['note', 'clipboard', 'search'] }
              };
            }
          }
        ],
        cooldownMs: 3000,
        enabled: true
      },

      // 开心+悬浮：友好互动
      {
        id: 'happy_hover_interaction',
        name: '开心互动',
        description: '在悬浮状态下，开心情绪触发友好互动',
        state: PetState.Hover,
        emotion: EmotionType.Happy,
        priority: 6,
        actions: [
          {
            type: 'hover_feedback',
            execute: async (context) => {
              console.log('😊 [策略] 开心互动 - 显示友好反馈');
              return {
                success: true,
                message: '😊 很高兴见到你！有什么我可以帮助的吗？',
                data: { mood: 'cheerful', interactionType: 'greeting' }
              };
            }
          },
          {
            type: 'emotional_animation',
            delayMs: 500,
            execute: async (context) => {
              console.log('✨ [策略] 开心互动 - 播放开心动画');
              return {
                success: true,
                message: '✨ 播放愉悦动画效果',
                data: { animation: 'happy_bounce', duration: 1000 }
              };
            }
          }
        ],
        cooldownMs: 2000,
        enabled: true
      },

      // 困倦+空闲：自动休息
      {
        id: 'sleepy_idle_rest',
        name: '自动休息',
        description: '在空闲状态下，困倦情绪触发休息行为',
        state: PetState.Idle,
        emotion: EmotionType.Sleepy,
        priority: 3,
        conditions: [
          {
            type: 'emotion_intensity',
            operator: 'gte',
            value: 0.6
          }
        ],
        actions: [
          {
            type: 'idle_animation',
            execute: async (context) => {
              console.log('😴 [策略] 自动休息 - 进入休息动画');
              return {
                success: true,
                message: '😴 感觉有点累了，让我休息一下...',
                data: { animation: 'sleep_idle', restMode: true }
              };
            }
          },
          {
            type: 'user_prompt',
            delayMs: 5000,
            execute: async (context) => {
              const hour = new Date().getHours();
              const timeBasedMessage = hour < 6 || hour > 22 
                ? '🌙 夜深了，要不要一起休息？'
                : '☕ 累了就休息一下吧，劳逸结合很重要！';
              
              console.log('💤 [策略] 自动休息 - 显示休息提示');
              return {
                success: true,
                message: timeBasedMessage,
                data: { promptType: 'rest_suggestion', timeOfDay: hour }
              };
            }
          }
        ],
        cooldownMs: 10000,
        enabled: true
      },

      // 兴奋+唤醒：高能模式
      {
        id: 'excited_awaken_highpower',
        name: '高能模式',
        description: '在唤醒状态下，兴奋情绪触发高能互动模式',
        state: PetState.Awaken,
        emotion: EmotionType.Excited,
        priority: 10,
        actions: [
          {
            type: 'awaken_response',
            execute: async (context) => {
              console.log('🎉 [策略] 高能模式 - 兴奋响应');
              return {
                success: true,
                message: '🎉 哇！感受到了你的热情，让我们一起行动吧！',
                data: { energy: 'high', mode: 'interactive' }
              };
            }
          },
          {
            type: 'plugin_trigger',
            delayMs: 100,
            execute: async (context) => {
              console.log('⚡ [策略] 高能模式 - 快速启动所有功能');
              return {
                success: true,
                message: '⚡ 所有系统火力全开！',
                data: { fastMode: true, allPlugins: true }
              };
            }
          },
          {
            type: 'user_prompt',
            delayMs: 600,
            execute: async (context) => {
              console.log('🚀 [策略] 高能模式 - 显示高能提示');
              return {
                success: true,
                message: '🚀 准备好了吗？我们可以一起完成任何任务！',
                data: { promptType: 'high_energy', readyForAction: true }
              };
            }
          }
        ],
        cooldownMs: 1000,
        enabled: true
      },

      // 平静+任意状态：基础响应
      {
        id: 'calm_universal_basic',
        name: '平静基础响应',
        description: '平静情绪下的通用基础响应策略',
        state: [PetState.Idle, PetState.Hover, PetState.Awaken, PetState.Control],
        emotion: EmotionType.Calm,
        priority: 2,
        conditions: [
          {
            type: 'emotion_intensity',
            operator: 'lt',
            value: 0.8
          }
        ],
        actions: [
          {
            type: 'emotional_expression',
            execute: async (context) => {
              console.log('😌 [策略] 平静基础响应 - 情绪表达');
              return {
                success: true,
                message: '😌 保持平静，随时准备为你服务',
                data: { baseline: true, ready: true }
              };
            }
          }
        ],
        cooldownMs: 8000,
        enabled: true
      },

      // 播放相关策略 - 开场动画
      {
        id: 'intro_video_playback',
        name: '播放开场动画',
        description: '在唤醒状态下，好奇情绪触发开场视频播放',
        state: PetState.Awaken,
        emotion: EmotionType.Curious,
        priority: 9,
        actions: [
          {
            type: 'video_preparation',
            execute: async (context) => {
              console.log('🎬 [策略] 开场动画 - 准备视频播放');
              return {
                success: true,
                message: '🎬 准备播放开场动画...',
                data: { 
                  videoId: 'intro001',
                  chunkPolicy: 'emotion_driven',
                  action: 'prepare_video'
                }
              };
            }
          },
          {
            type: 'plugin_trigger',
            delayMs: 500,
            execute: async (context) => {
              console.log('🎮 [策略] 开场动画 - 触发播放器插件');
              return {
                success: true,
                message: '🎮 启动视频播放器...',
                data: { 
                  plugin: 'player',
                  action: 'play_video',
                  videoConfig: {
                    videoId: 'intro001',
                    chunkPolicy: 'emotion_driven',
                    autoPlay: true,
                    emotionSync: true
                  }
                }
              };
            }
          }
        ],
        cooldownMs: 30000, // 30秒冷却，避免频繁播放
        enabled: true
      },

      // 播放相关策略 - 专注模式演示
      {
        id: 'focus_demo_video',
        name: '专注模式演示视频',
        description: '在控制状态下，专注情绪触发功能演示视频',
        state: PetState.Control,
        emotion: EmotionType.Focused,
        priority: 7,
        conditions: [
          {
            type: 'emotion_intensity',
            operator: 'gte',
            value: 0.7
          }
        ],
        actions: [
          {
            type: 'demo_preparation',
            execute: async (context) => {
              console.log('📚 [策略] 专注演示 - 准备演示视频');
              return {
                success: true,
                message: '📚 准备功能演示视频...',
                data: { 
                  videoId: 'focus_demo',
                  chunkPolicy: 'adaptive'
                }
              };
            }
          },
          {
            type: 'plugin_trigger',
            delayMs: 300,
            execute: async (context) => {
              console.log('🎓 [策略] 专注演示 - 启动演示播放');
              return {
                success: true,
                message: '🎓 开始功能演示...',
                data: { 
                  plugin: 'player',
                  action: 'play_video',
                  videoConfig: {
                    videoId: 'focus_demo',
                    chunkPolicy: 'adaptive',
                    autoPlay: true,
                    startFrom: 0,
                    quality: '1080p'
                  }
                }
              };
            }
          }
        ],
        cooldownMs: 60000, // 1分钟冷却
        enabled: true
      },

      // 播放相关策略 - 兴奋时的庆祝动画
      {
        id: 'celebration_video',
        name: '庆祝动画播放',
        description: '兴奋情绪下播放庆祝动画',
        state: [PetState.Awaken, PetState.Hover],
        emotion: EmotionType.Excited,
        priority: 8,
        conditions: [
          {
            type: 'emotion_intensity',
            operator: 'gt',
            value: 0.8
          }
        ],
        actions: [
          {
            type: 'celebration_start',
            execute: async (context) => {
              console.log('🎉 [策略] 庆祝动画 - 开始庆祝');
              return {
                success: true,
                message: '🎉 太棒了！让我们庆祝一下！',
                data: { celebrationType: 'excited', trigger: 'high_emotion' }
              };
            }
          },
          {
            type: 'plugin_trigger',
            delayMs: 200,
            execute: async (context) => {
              console.log('🎊 [策略] 庆祝动画 - 播放庆祝视频');
              return {
                success: true,
                message: '🎊 播放庆祝动画！',
                data: { 
                  plugin: 'player',
                  action: 'play_video',
                  videoConfig: {
                    videoId: 'celebration',
                    chunkPolicy: 'emotion_driven',
                    autoPlay: true,
                    loop: false,
                    emotionSync: true
                  }
                }
              };
            }
          }
        ],
        cooldownMs: 15000, // 15秒冷却
        enabled: true
      },

      // 播放相关策略 - 空闲时的环境视频
      {
        id: 'ambient_video_idle',
        name: '环境视频播放',
        description: '空闲状态下播放环境背景视频',
        state: PetState.Idle,
        emotion: [EmotionType.Calm, EmotionType.Sleepy],
        priority: 3,
        conditions: [
          {
            type: 'custom',
            operator: 'eq',
            value: true,
            customCheck: (context) => {
              // 只在长时间空闲时播放环境视频
              const idleTime = Date.now() - (context.metadata?.lastInteraction || Date.now());
              return idleTime > 120000; // 2分钟以上空闲
            }
          }
        ],
        actions: [
          {
            type: 'ambient_setup',
            execute: async (context) => {
              console.log('🌅 [策略] 环境视频 - 设置背景视频');
              return {
                success: true,
                message: '🌅 播放舒缓的背景视频...',
                data: { ambientType: 'calm', mood: 'relaxing' }
              };
            }
          },
          {
            type: 'plugin_trigger',
            delayMs: 1000,
            execute: async (context) => {
              console.log('🎵 [策略] 环境视频 - 启动背景播放');
              return {
                success: true,
                message: '🎵 开始播放环境视频',
                data: { 
                  plugin: 'player',
                  action: 'play_video',
                  videoConfig: {
                    videoId: 'ambient_calm',
                    chunkPolicy: 'linear',
                    autoPlay: true,
                    loop: true,
                    volume: 0.3 // 低音量背景播放
                  }
                }
              };
            }
          }
        ],
        cooldownMs: 300000, // 5分钟冷却，避免过度播放
        enabled: true
      }
    ];

    // 注册默认策略
    defaultStrategies.forEach(strategy => {
      this.registerStrategy(strategy);
    });

    console.log(`🎯 加载了 ${defaultStrategies.length} 个默认行为策略`);
  }

  /**
   * 注册新的行为策略
   */
  registerStrategy(strategy: BehaviorStrategyRule): void {
    this.strategies.set(strategy.id, strategy);
    
    // 初始化统计信息
    if (!this.executionStats.has(strategy.id)) {
      this.executionStats.set(strategy.id, {
        ruleId: strategy.id,
        executionCount: 0,
        lastExecuted: 0,
        averageExecutionTime: 0,
        successRate: 1.0,
        errors: []
      });
    }

    console.log(`📝 注册行为策略: ${strategy.name} (${strategy.id})`);
  }

  /**
   * 移除行为策略
   */
  removeStrategy(strategyId: string): boolean {
    const removed = this.strategies.delete(strategyId);
    if (removed) {
      this.executionStats.delete(strategyId);
      console.log(`🗑️ 移除行为策略: ${strategyId}`);
    }
    return removed;
  }

  /**
   * 获取匹配的策略
   */
  getMatchingStrategies(state: PetState, emotion: EmotionType, context?: BehaviorExecutionContext): BehaviorStrategyRule[] {
    const matchingStrategies: BehaviorStrategyRule[] = [];

    for (const strategy of this.strategies.values()) {
      if (!strategy.enabled) continue;

      // 检查状态匹配
      const stateMatch = Array.isArray(strategy.state) 
        ? strategy.state.includes(state)
        : strategy.state === state;

      // 检查情绪匹配
      const emotionMatch = Array.isArray(strategy.emotion)
        ? strategy.emotion.includes(emotion)
        : strategy.emotion === emotion;

      if (stateMatch && emotionMatch) {
        // 检查额外条件
        if (this.checkConditions(strategy, context)) {
          // 检查冷却时间
          if (this.checkCooldown(strategy)) {
            matchingStrategies.push(strategy);
          }
        }
      }
    }

    // 按优先级排序
    return matchingStrategies.sort((a, b) => b.priority - a.priority);
  }

  /**
   * 检查策略条件
   */
  private checkConditions(strategy: BehaviorStrategyRule, context?: BehaviorExecutionContext): boolean {
    if (!strategy.conditions || !context) return true;

    return strategy.conditions.every(condition => {
      switch (condition.type) {
        case 'emotion_intensity':
          const intensity = context.emotion.intensity;
          return this.evaluateCondition(intensity, condition.operator, condition.value);

        case 'time_range':
          const hour = new Date().getHours();
          return this.evaluateCondition(hour, condition.operator, condition.value);

        case 'custom':
          return condition.customCheck ? condition.customCheck(context) : true;

        default:
          return true;
      }
    });
  }

  /**
   * 评估条件操作符
   */
  private evaluateCondition(actual: any, operator: string, expected: any): boolean {
    switch (operator) {
      case 'gt': return actual > expected;
      case 'gte': return actual >= expected;
      case 'lt': return actual < expected;
      case 'lte': return actual <= expected;
      case 'eq': return actual === expected;
      case 'in': return Array.isArray(expected) && expected.includes(actual);
      case 'between': return Array.isArray(expected) && actual >= expected[0] && actual <= expected[1];
      default: return false;
    }
  }

  /**
   * 检查冷却时间
   */
  private checkCooldown(strategy: BehaviorStrategyRule): boolean {
    if (!strategy.cooldownMs) return true;

    const stats = this.executionStats.get(strategy.id);
    if (!stats || stats.lastExecuted === 0) return true;

    const timeSinceLastExecution = Date.now() - stats.lastExecuted;
    return timeSinceLastExecution >= strategy.cooldownMs;
  }

  /**
   * 执行策略
   */
  async executeStrategy(strategy: BehaviorStrategyRule, context: BehaviorExecutionContext): Promise<BehaviorActionResult[]> {
    const startTime = Date.now();
    const results: BehaviorActionResult[] = [];
    
    console.log(`🎯 [策略执行] 开始执行策略: ${strategy.name} | 状态: ${context.state} | 情绪: ${context.emotion.currentEmotion}`);

    try {
      // 按顺序执行所有动作
      for (const action of strategy.actions) {
        if (action.delayMs && action.delayMs > 0) {
          console.log(`⏱️ [策略执行] 等待 ${action.delayMs}ms 后执行动作: ${action.type}`);
          await this.delay(action.delayMs);
        }

        try {
          const result = await action.execute(context);
          results.push(result);
          
          console.log(`✅ [策略执行] 动作完成: ${action.type} | 结果: ${result.message}`);

          // 如果动作失败且没有继续标记，停止执行
          if (!result.success) {
            console.warn(`⚠️ [策略执行] 动作失败，停止策略执行: ${action.type}`);
            break;
          }

          // 处理链式动作
          if (result.nextActions && result.nextActions.length > 0) {
            console.log(`🔗 [策略执行] 发现链式动作: ${result.nextActions.length} 个`);
            for (const nextAction of result.nextActions) {
              const nextResult = await nextAction.execute(context);
              results.push(nextResult);
            }
          }

        } catch (actionError) {
          console.error(`❌ [策略执行] 动作执行失败: ${action.type}`, actionError);
          results.push({
            success: false,
            message: `动作执行失败: ${actionError instanceof Error ? actionError.message : String(actionError)}`
          });
          break;
        }
      }

      const duration = Date.now() - startTime;
      this.updateExecutionStats(strategy.id, duration, results.every(r => r.success));

      console.log(`🎯 [策略执行] 策略执行完成: ${strategy.name} | 耗时: ${duration}ms | 成功动作: ${results.filter(r => r.success).length}/${results.length}`);

      return results;

    } catch (error) {
      const duration = Date.now() - startTime;
      this.updateExecutionStats(strategy.id, duration, false, error);
      
      console.error(`❌ [策略执行] 策略执行失败: ${strategy.name}`, error);
      
      return [{
        success: false,
        message: `策略执行失败: ${error instanceof Error ? error.message : String(error)}`
      }];
    }
  }

  /**
   * 更新执行统计
   */
  private updateExecutionStats(strategyId: string, duration: number, success: boolean, error?: any): void {
    const stats = this.executionStats.get(strategyId);
    if (!stats) return;

    stats.executionCount++;
    stats.lastExecuted = Date.now();
    
    // 更新平均执行时间
    stats.averageExecutionTime = (stats.averageExecutionTime * (stats.executionCount - 1) + duration) / stats.executionCount;
    
    // 更新成功率
    const successCount = Math.round(stats.successRate * (stats.executionCount - 1)) + (success ? 1 : 0);
    stats.successRate = successCount / stats.executionCount;

    // 记录错误
    if (!success && error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      stats.errors.push(errorMessage);
      
      // 限制错误记录数量
      if (stats.errors.length > 10) {
        stats.errors = stats.errors.slice(-10);
      }
    }
  }

  /**
   * 工具方法：延时
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 获取所有策略
   */
  getAllStrategies(): BehaviorStrategyRule[] {
    return Array.from(this.strategies.values());
  }

  /**
   * 获取执行统计
   */
  getExecutionStats(): StrategyExecutionStats[] {
    return Array.from(this.executionStats.values());
  }

  /**
   * 启用/禁用策略
   */
  setStrategyEnabled(strategyId: string, enabled: boolean): boolean {
    const strategy = this.strategies.get(strategyId);
    if (strategy) {
      strategy.enabled = enabled;
      console.log(`🔄 策略 ${strategyId} ${enabled ? '已启用' : '已禁用'}`);
      return true;
    }
    return false;
  }

  /**
   * 清除执行统计
   */
  clearStats(): void {
    for (const stats of this.executionStats.values()) {
      stats.executionCount = 0;
      stats.lastExecuted = 0;
      stats.averageExecutionTime = 0;
      stats.successRate = 1.0;
      stats.errors = [];
    }
    console.log('📊 策略执行统计已清除');
  }

  /**
   * 导出策略配置
   */
  exportStrategies(): BehaviorStrategyRule[] {
    return this.getAllStrategies();
  }

  /**
   * 导入策略配置
   */
  importStrategies(strategies: BehaviorStrategyRule[]): void {
    console.log(`📥 导入 ${strategies.length} 个策略`);
    strategies.forEach(strategy => {
      this.registerStrategy(strategy);
    });
  }
}

/**
 * 创建默认的行为策略管理器实例
 */
export function createBehaviorStrategyManager(): BehaviorStrategyManager {
  return new BehaviorStrategyManager();
}

export default BehaviorStrategyManager;
