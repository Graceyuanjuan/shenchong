/**
 * 情绪引擎 - 理解语气和情绪，决定宠物表现与推荐策略
 */

import { EmotionType, EmotionContext, EmotionHistory, PetState, UserIntent } from '../types';
import { AIEmotionDriver, AIEmotionDriverFactory, EmotionLog } from '../modules/AIEmotionDriver';
// T5-C: 导入节奏上下文类型
import { RhythmContext, TimeOfDay, getCurrentTimeOfDay, UserActivityLevel } from '../types/rhythm/RhythmContext';

export class EmotionEngine {
  private currentContext: EmotionContext;
  private emotionRules: Map<string, EmotionRule> = new Map();
  private moodFactors: MoodFactors = {
    timeOfDay: 1.0,
    userInteraction: 1.0,
    taskSuccess: 1.0,
    idleTime: 1.0
  };
  
  // T5-B: 集成 AIEmotionDriver
  private aiEmotionDriver: AIEmotionDriver;
  private emotionLogs: EmotionLog[] = [];
  
  // T5-C: 节奏上下文回调
  private rhythmContextCallbacks: Set<(context: Partial<RhythmContext>) => void> = new Set();
  private currentPetState: PetState = PetState.Idle;
  private stateChangeTime: number = Date.now();
  private lastInteractionTime: number = Date.now();
  private interactionCount: number = 0;

  constructor(aiDriver?: AIEmotionDriver) {
    this.currentContext = {
      currentEmotion: EmotionType.Calm,
      intensity: 0.5,
      duration: 0,
      triggers: [],
      history: []
    };
    
    // 初始化 AI 情绪驱动器
    this.aiEmotionDriver = aiDriver || AIEmotionDriverFactory.createDefault();
    
    this.initializeEmotionRules();
    
    console.log('🎭 EmotionEngine 初始化完成，集成 AIEmotionDriver');
  }

  /**
   * 初始化情绪规则
   */
  private initializeEmotionRules(): void {
    // 开心情绪规则
    this.emotionRules.set('success_task', {
      targetEmotion: EmotionType.Happy,
      intensityChange: 0.3,
      duration: 30000, // 30秒
      triggers: ['task_completed', 'positive_feedback', 'achievement']
    });

    // 好奇情绪规则
    this.emotionRules.set('new_interaction', {
      targetEmotion: EmotionType.Curious,
      intensityChange: 0.4,
      duration: 15000, // 15秒
      triggers: ['first_time_command', 'unknown_input', 'exploration']
    });

    // 兴奋情绪规则
    this.emotionRules.set('frequent_use', {
      targetEmotion: EmotionType.Excited,
      intensityChange: 0.5,
      duration: 45000, // 45秒
      triggers: ['rapid_interactions', 'complex_task', 'multi_plugin_use']
    });

    // 困倦情绪规则
    this.emotionRules.set('idle_period', {
      targetEmotion: EmotionType.Sleepy,
      intensityChange: 0.2,
      duration: 120000, // 2分钟
      triggers: ['long_idle', 'night_time', 'low_activity']
    });

    // 专注情绪规则
    this.emotionRules.set('work_mode', {
      targetEmotion: EmotionType.Focused,
      intensityChange: 0.6,
      duration: 60000, // 1分钟
      triggers: ['work_related_task', 'screenshot', 'note_taking']
    });

    // 平静情绪规则（默认回归状态）
    this.emotionRules.set('default_calm', {
      targetEmotion: EmotionType.Calm,
      intensityChange: -0.1, // 逐渐回归平静
      duration: 10000, // 10秒
      triggers: ['emotion_decay', 'neutral_interaction']
    });
  }

  /**
   * 分析用户输入的情绪色彩
   */
  analyzeInputEmotion(input: string): {
    emotion: EmotionType;
    intensity: number;
    sentiment: 'positive' | 'negative' | 'neutral';
  } {
    const lowerInput = input.toLowerCase();
    
    // 积极情绪词汇
    const positiveWords = ['开心', '高兴', '棒', '好', '喜欢', '爱', '太好了', '完美', 'great', 'awesome', 'love', 'happy', 'excited'];
    const negativeWords = ['难过', '生气', '烦', '讨厌', '糟糕', '失败', '不行', 'sad', 'angry', 'hate', 'terrible', 'bad'];
    const excitedWords = ['哇', '太棒了', '厉害', '惊喜', '激动', 'wow', 'amazing', 'incredible', 'fantastic'];
    const calmWords = ['好的', '明白', '了解', '谢谢', 'okay', 'thanks', 'understood', 'alright'];

    let positiveScore = 0;
    let negativeScore = 0;
    let excitementScore = 0;
    let calmScore = 0;

    // 计算各类情绪词汇的得分
    positiveWords.forEach(word => {
      if (lowerInput.includes(word)) positiveScore += 1;
    });
    
    negativeWords.forEach(word => {
      if (lowerInput.includes(word)) negativeScore += 1;
    });
    
    excitedWords.forEach(word => {
      if (lowerInput.includes(word)) excitementScore += 2;
    });
    
    calmWords.forEach(word => {
      if (lowerInput.includes(word)) calmScore += 1;
    });

    // 检查感叹号和问号
    const exclamationCount = (input.match(/[！!]/g) || []).length;
    const questionCount = (input.match(/[？?]/g) || []).length;
    
    excitementScore += exclamationCount * 0.5;
    
    // 确定主导情绪
    let emotion = EmotionType.Calm;
    let intensity = 0.3;
    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';

    if (excitementScore > 1) {
      emotion = EmotionType.Excited;
      intensity = Math.min(0.8 + excitementScore * 0.1, 1.0);
      sentiment = 'positive';
    } else if (positiveScore > negativeScore && positiveScore > 0) {
      emotion = EmotionType.Happy;
      intensity = Math.min(0.5 + positiveScore * 0.15, 1.0);
      sentiment = 'positive';
    } else if (negativeScore > positiveScore && negativeScore > 0) {
      emotion = EmotionType.Calm; // 负面情绪时保持冷静以提供帮助
      intensity = Math.min(0.4 + negativeScore * 0.1, 0.8);
      sentiment = 'negative';
    } else if (questionCount > 0) {
      emotion = EmotionType.Curious;
      intensity = Math.min(0.4 + questionCount * 0.2, 0.9);
      sentiment = 'neutral';
    } else if (calmScore > 0) {
      emotion = EmotionType.Calm;
      intensity = 0.3;
      sentiment = 'neutral';
    }

    return { emotion, intensity, sentiment };
  }

  /**
   * 基于用户意图更新情绪
   */
  updateEmotionFromIntent(intent: UserIntent): void {
    const triggers: string[] = [];
    
    // 根据意图类型确定触发因素
    switch (intent.type) {
      case 'screenshot':
      case 'note':
        triggers.push('work_related_task');
        this.applyEmotionRule('work_mode', triggers);
        break;
        
      case 'chat':
        if (intent.confidence > 0.8) {
          triggers.push('positive_interaction');
          this.applyEmotionRule('new_interaction', triggers);
        }
        break;
        
      case 'help':
        triggers.push('help_request');
        this.applyEmotionRule('new_interaction', triggers);
        break;
        
      case 'emotion':
        // 直接根据用户表达的情绪进行同理心响应
        const emotionParam = intent.parameters?.emotionType;
        if (emotionParam) {
          this.setEmotion(this.mapUserEmotionToPetEmotion(emotionParam), 0.6, 20000);
        }
        break;
    }

    // 分析输入文本的情绪色彩
    const inputEmotion = this.analyzeInputEmotion(intent.rawInput);
    if (inputEmotion.intensity > 0.5) {
      this.blendEmotion(inputEmotion.emotion, inputEmotion.intensity * 0.3, 15000);
    }
  }

  /**
   * 将用户情绪映射到宠物情绪
   */
  private mapUserEmotionToPetEmotion(userEmotion: string): EmotionType {
    switch (userEmotion) {
      case 'happy': return EmotionType.Happy;
      case 'sad': return EmotionType.Calm; // 用户难过时，宠物保持冷静提供安慰
      case 'angry': return EmotionType.Calm; // 用户愤怒时，宠物保持冷静
      case 'tired': return EmotionType.Sleepy;
      default: return EmotionType.Curious; // 对未知情绪保持好奇
    }
  }

  /**
   * 应用情绪规则
   */
  private applyEmotionRule(ruleId: string, triggers: string[]): void {
    const rule = this.emotionRules.get(ruleId);
    if (!rule) return;

    // 检查触发条件
    const hasValidTrigger = rule.triggers.some(trigger => triggers.includes(trigger));
    if (!hasValidTrigger) return;

    this.setEmotion(rule.targetEmotion, rule.intensityChange, rule.duration);
  }

  /**
   * 设置情绪
   */
  setEmotion(emotion: EmotionType, intensity: number, duration: number): void {
    // 记录历史
    this.currentContext.history.push({
      emotion: this.currentContext.currentEmotion,
      timestamp: Date.now(),
      cause: `transition_to_${emotion}`
    });

    // 限制历史记录数量
    if (this.currentContext.history.length > 50) {
      this.currentContext.history = this.currentContext.history.slice(-30);
    }

    // 更新当前情绪
    this.currentContext.currentEmotion = emotion;
    this.currentContext.intensity = Math.max(0, Math.min(1, intensity));
    this.currentContext.duration = duration;
    this.currentContext.triggers = [];

    console.log(`🎭 Emotion changed to: ${emotion} (intensity: ${this.currentContext.intensity.toFixed(2)})`);
    
    // T5-C: 情绪变化时通知节奏系统
    this.notifyRhythmContextUpdate();
  }

  /**
   * 混合情绪（不完全替换，而是融合）
   */
  blendEmotion(emotion: EmotionType, intensity: number, duration: number): void {
    if (emotion === this.currentContext.currentEmotion) {
      // 同种情绪，增强强度
      this.currentContext.intensity = Math.min(1, this.currentContext.intensity + intensity * 0.5);
      this.currentContext.duration = Math.max(this.currentContext.duration, duration);
    } else {
      // 不同情绪，根据强度决定是否切换
      if (intensity > this.currentContext.intensity * 0.8) {
        this.setEmotion(emotion, intensity, duration);
      } else {
        // 轻微影响当前情绪强度
        this.currentContext.intensity = Math.max(0.1, this.currentContext.intensity - intensity * 0.2);
      }
    }
  }

  /**
   * 基于任务结果更新情绪
   */
  updateEmotionFromTaskResult(success: boolean, taskType: string): void {
    if (success) {
      this.moodFactors.taskSuccess = Math.min(1.2, this.moodFactors.taskSuccess + 0.1);
      this.applyEmotionRule('success_task', ['task_completed', taskType]);
    } else {
      this.moodFactors.taskSuccess = Math.max(0.8, this.moodFactors.taskSuccess - 0.1);
      // 失败时保持冷静，准备提供帮助
      this.setEmotion(EmotionType.Calm, 0.4, 20000);
    }
  }

  /**
   * 基于时间更新情绪
   */
  updateEmotionFromTime(): void {
    const hour = new Date().getHours();
    let timeEmotion = EmotionType.Calm;
    let timeFactor = 1.0;

    if (hour >= 6 && hour < 9) {
      // 早晨 - 精神状态好
      timeEmotion = EmotionType.Happy;
      timeFactor = 1.1;
    } else if (hour >= 9 && hour < 18) {
      // 工作时间 - 专注
      timeEmotion = EmotionType.Focused;
      timeFactor = 1.0;
    } else if (hour >= 18 && hour < 22) {
      // 傍晚 - 放松
      timeEmotion = EmotionType.Calm;
      timeFactor = 0.9;
    } else {
      // 深夜 - 困倦
      timeEmotion = EmotionType.Sleepy;
      timeFactor = 0.7;
    }

    this.moodFactors.timeOfDay = timeFactor;

    // 在深夜时，如果当前不是困倦状态，逐渐转向困倦
    if (hour >= 22 || hour < 6) {
      if (this.currentContext.currentEmotion !== EmotionType.Sleepy) {
        this.blendEmotion(EmotionType.Sleepy, 0.2, 60000);
      }
    }
  }

  /**
   * 情绪衰减处理
   */
  tick(deltaTime: number): void {
    this.currentContext.duration -= deltaTime;

    // 情绪强度自然衰减
    if (this.currentContext.duration <= 0) {
      const decayRate = 0.02; // 每次衰减2%
      this.currentContext.intensity = Math.max(0.1, this.currentContext.intensity - decayRate);
      
      // 当强度很低时，回归平静状态
      if (this.currentContext.intensity < 0.3 && this.currentContext.currentEmotion !== EmotionType.Calm) {
        this.setEmotion(EmotionType.Calm, 0.3, 30000);
      }
      
      this.currentContext.duration = 5000; // 重置衰减间隔
    }

    // 定期更新时间相关的情绪
    this.updateEmotionFromTime();
  }

  /**
   * 获取当前情绪上下文
   */
  getCurrentEmotion(): EmotionContext {
    return { ...this.currentContext };
  }

  /**
   * 根据情绪推荐状态切换
   */
  recommendStateTransition(currentState: PetState): PetState | null {
    const { currentEmotion, intensity } = this.currentContext;

    switch (currentEmotion) {
      case EmotionType.Sleepy:
        if (intensity > 0.6 && currentState !== PetState.Idle) {
          return PetState.Idle; // 困倦时回到静态
        }
        break;
        
      case EmotionType.Excited:
        if (intensity > 0.7 && currentState === PetState.Idle) {
          return PetState.Hover; // 兴奋时更容易被唤醒
        }
        break;
        
      case EmotionType.Focused:
        if (currentState === PetState.Awaken) {
          return null; // 专注时保持工具状态
        }
        break;
    }

    return null;
  }

  /**
   * 获取情绪表现建议
   */
  getEmotionDisplay(): {
    animation: string;
    color: string;
    particle?: string;
    sound?: string;
  } {
    const { currentEmotion, intensity } = this.currentContext;

    switch (currentEmotion) {
      case EmotionType.Happy:
        return {
          animation: intensity > 0.7 ? 'bounce' : 'gentle_bob',
          color: '#FFD700', // 金色
          particle: 'sparkles',
          sound: 'happy_chime'
        };

      case EmotionType.Excited:
        return {
          animation: 'vibrate',
          color: '#FF6B6B', // 橙红色
          particle: 'energy_burst',
          sound: 'excited_beep'
        };

      case EmotionType.Curious:
        return {
          animation: 'tilt',
          color: '#4ECDC4', // 青色
          particle: 'question_marks',
          sound: 'curious_note'
        };

      case EmotionType.Focused:
        return {
          animation: 'steady_glow',
          color: '#45B7D1', // 蓝色
          particle: 'focus_rings',
          sound: 'focus_hum'
        };

      case EmotionType.Sleepy:
        return {
          animation: 'slow_breathing',
          color: '#9B59B6', // 紫色
          particle: 'zzz',
          sound: 'sleepy_yawn'
        };

      case EmotionType.Calm:
      default:
        return {
          animation: 'float',
          color: '#95E1D3', // 薄荷绿
          particle: 'gentle_glow',
          sound: 'calm_ambient'
        };
    }
  }

  /**
   * T5-B: 根据宠物状态更新情绪（通过 AIEmotionDriver）
   */
  updateEmotionByState(state: PetState, context?: any): void {
    try {
      // 使用 AI 情绪驱动器决定新情绪
      const newEmotion = this.aiEmotionDriver.decideEmotion({
        state,
        context,
        history: this.emotionLogs
      });

      // 如果情绪发生变化，则更新
      if (newEmotion !== this.currentContext.currentEmotion) {
        console.log(`🎭 EmotionEngine: 状态 ${state} 触发情绪变化 ${this.currentContext.currentEmotion} → ${newEmotion}`);
        
        // 设置新情绪
        this.setEmotion(newEmotion, 0.7, 30000);
        
        // 记录情绪日志
        this.recordEmotionLog(newEmotion, state, context, `state_update_${state}`);
      }
    } catch (error) {
      console.error('❌ EmotionEngine: AI情绪推断失败', error);
    }
  }

  /**
   * T5-B: 记录情绪变化日志
   */
  private recordEmotionLog(emotion: EmotionType, state: PetState, context?: any, trigger?: string): void {
    const log: EmotionLog = {
      timestamp: Date.now(),
      emotion,
      state,
      intensity: this.currentContext.intensity,
      context,
      trigger
    };

    this.emotionLogs.push(log);
    
    // 保持日志限制
    if (this.emotionLogs.length > 100) {
      this.emotionLogs = this.emotionLogs.slice(-50);
    }
  }

  /**
   * T5-B: 获取情绪统计信息
   */
  getEmotionStatistics(): {
    aiDriverStats: any;
    emotionLogs: EmotionLog[];
    currentEmotion: EmotionType;
    emotionHistory: EmotionHistory[];
  } {
    return {
      aiDriverStats: (this.aiEmotionDriver as any).getStatistics?.() || {},
      emotionLogs: [...this.emotionLogs],
      currentEmotion: this.currentContext.currentEmotion,
      emotionHistory: [...this.currentContext.history]
    };
  }

  /**
   * T5-B: 设置新的 AI 情绪驱动器
   */
  setAIEmotionDriver(driver: AIEmotionDriver): void {
    this.aiEmotionDriver = driver;
    console.log('🎭 EmotionEngine: 更新 AI 情绪驱动器');
  }

  // =============== T5-C: 节奏上下文集成方法 ===============

  /**
   * T5-C: 注册节奏上下文更新回调
   */
  onRhythmContextUpdate(callback: (context: Partial<RhythmContext>) => void): void {
    this.rhythmContextCallbacks.add(callback);
    console.log(`🎭 EmotionEngine: 注册节奏上下文回调，当前回调数: ${this.rhythmContextCallbacks.size}`);
  }

  /**
   * T5-C: 移除节奏上下文更新回调
   */
  offRhythmContextUpdate(callback: (context: Partial<RhythmContext>) => void): void {
    this.rhythmContextCallbacks.delete(callback);
  }

  /**
   * T5-C: 更新宠物状态（用于节奏适配）
   */
  updatePetState(newState: PetState): void {
    if (newState !== this.currentPetState) {
      this.currentPetState = newState;
      this.stateChangeTime = Date.now();
      this.interactionCount++;
      this.lastInteractionTime = Date.now();
      
      // 通知节奏系统状态变化
      this.notifyRhythmContextUpdate();
      
      console.log(`🎭 EmotionEngine: 宠物状态更新 ${this.currentPetState}，交互计数: ${this.interactionCount}`);
    }
  }

  /**
   * T5-C: 构建并推送节奏上下文
   */
  private notifyRhythmContextUpdate(): void {
    const now = Date.now();
    const context: Partial<RhythmContext> = {
      currentEmotion: this.currentContext.currentEmotion,
      emotionIntensity: this.currentContext.intensity,
      emotionDuration: now - (this.currentContext.duration || 0),
      currentState: this.currentPetState,
      stateDuration: now - this.stateChangeTime,
      timeOfDay: getCurrentTimeOfDay(),
      timestamp: now,
      userStats: {
        totalInteractions: this.interactionCount,
        averageInterval: this.calculateAverageInterval(),
        recentFrequency: this.calculateRecentFrequency(),
        continuousIdleTime: now - this.lastInteractionTime,
        lastInteractionTime: this.lastInteractionTime,
        interactionPattern: this.determineInteractionPattern()
      },
      activityLevel: this.determineActivityLevel(),
      metadata: {
        source: 'emotion_engine',
        emotionHistory: this.currentContext.history.slice(-5) // 最近5条情绪记录
      }
    };

    // 推送给所有注册的回调
    this.rhythmContextCallbacks.forEach(callback => {
      try {
        callback(context);
      } catch (error) {
        console.error('🎭 EmotionEngine: 节奏上下文回调执行错误:', error);
      }
    });
  }

  /**
   * T5-C: 计算平均交互间隔
   */
  private calculateAverageInterval(): number {
    // 简化计算，基于当前数据
    if (this.interactionCount <= 1) {
      return 60000; // 默认1分钟
    }
    
    const totalTime = Date.now() - this.stateChangeTime;
    return totalTime / (this.interactionCount - 1);
  }

  /**
   * T5-C: 计算最近频率
   */
  private calculateRecentFrequency(): number {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    
    // 简化计算：如果最后交互在5分钟内，则基于总交互数估算
    if (this.lastInteractionTime > fiveMinutesAgo) {
      const recentInteractions = Math.min(this.interactionCount, 5); // 假设最近5次交互
      return recentInteractions; // 每分钟次数
    }
    
    return 0;
  }

  /**
   * T5-C: 确定交互模式
   */
  private determineInteractionPattern(): 'burst' | 'steady' | 'sparse' | 'idle' {
    const recentFreq = this.calculateRecentFrequency();
    const idleTime = Date.now() - this.lastInteractionTime;
    
    if (idleTime > 5 * 60 * 1000) { // 5分钟无交互
      return 'idle';
    } else if (recentFreq > 10) {
      return 'burst';
    } else if (recentFreq > 2) {
      return 'steady';
    } else {
      return 'sparse';
    }
  }

  /**
   * T5-C: 确定活跃度等级
   */
  private determineActivityLevel(): UserActivityLevel {
    const recentFreq = this.calculateRecentFrequency();
    const idleTime = Date.now() - this.lastInteractionTime;
    
    if (idleTime > 10 * 60 * 1000) { // 10分钟无交互
      return UserActivityLevel.Inactive;
    } else if (recentFreq > 10) {
      return UserActivityLevel.Burst;
    } else if (recentFreq > 5) {
      return UserActivityLevel.High;
    } else if (recentFreq > 2) {
      return UserActivityLevel.Medium;
    } else {
      return UserActivityLevel.Low;
    }
  }

  /**
   * T5-C: 手动触发节奏上下文更新
   */
  triggerRhythmContextUpdate(): void {
    this.notifyRhythmContextUpdate();
  }
}

// 辅助接口
interface EmotionRule {
  targetEmotion: EmotionType;
  intensityChange: number;
  duration: number;
  triggers: string[];
}

interface MoodFactors {
  timeOfDay: number;
  userInteraction: number;
  taskSuccess: number;
  idleTime: number;
}
