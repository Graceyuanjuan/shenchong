/**
 * SaintGrid 神宠系统 - 核心类型定义
 * 基于四态汤圆皮肤的交互模型
 */

// 四态状态枚举
export enum PetState {
  Idle = 'idle',           // 静碗 - 默认状态
  Hover = 'hover',         // 感应碗 - 鼠标悬浮
  Awaken = 'awaken',       // 唤醒碗 - 左键点击
  Control = 'control'      // 控制碗 - 右键点击
}

// 情绪状态枚举
export enum EmotionType {
  Happy = 'happy',
  Calm = 'calm',
  Excited = 'excited',
  Curious = 'curious',
  Sleepy = 'sleepy',
  Focused = 'focused'
}

// AI 模型类型（三脑模型）
export enum AIProvider {
  // 新加坡主脑
  OpenAI = 'openai',
  Claude = 'claude',
  
  // 中国左脑
  Tongyi = 'tongyi',
  Doubao = 'doubao',
  Wenxin = 'wenxin',
  
  // 海外右脑
  GPT4 = 'gpt4',
  Gemini = 'gemini',
  LLaMA = 'llama'
}

// 用户意图类型
export interface UserIntent {
  type: string;
  confidence: number;
  parameters: Record<string, any>;
  rawInput: string;
  timestamp: number;
}

// 插件上下文接口 - 增强插件感知能力
export interface PluginContext {
  currentState: PetState;
  emotion: EmotionContext;
  userPreferences?: Record<string, any>;
  stateHistory?: PetState[];
  interaction?: {
    type: 'passive' | 'active';  // 被动调用 vs 主动触发
    trigger: 'state_change' | 'user_intent' | 'heartbeat' | 'manual';
    timestamp: number;
  };
}

// 插件钩子类型
export type PluginHookType = 'onStateChanged' | 'onEmotionChanged' | 'onUserInteraction' | 'onHeartbeat';

// 插件接口 - 增强版
export interface IPlugin {
  id: string;
  name: string;
  version: string;
  description: string;
  supportedIntents: string[];
  
  // 插件能力标识
  capabilities?: {
    stateAware: boolean;      // 是否支持状态感知
    emotionAware: boolean;    // 是否支持情绪感知
    contextAware: boolean;    // 是否支持上下文感知
    supportedHooks: PluginHookType[]; // 支持的钩子类型
  };
  
  // 生命周期方法
  initialize(): Promise<void>;
  execute(intent: UserIntent, context: any): Promise<PluginResponse>;
  destroy(): Promise<void>;
  
  // 增强状态触发方法 - 新增情绪参数
  trigger?(state: PetState, emotion: EmotionContext, context?: PluginContext): Promise<PluginResponse>;
  
  // 新增钩子方法
  onStateChanged?(oldState: PetState, newState: PetState, emotion: EmotionContext, context?: PluginContext): Promise<PluginResponse>;
  onEmotionChanged?(oldEmotion: EmotionType, newEmotion: EmotionType, context?: PluginContext): Promise<PluginResponse>;
}

// 插件响应
export interface PluginResponse {
  success: boolean;
  data: any;
  message?: string;
  emotion?: EmotionType;
  nextState?: PetState;
}

// 记忆数据结构
export interface MemoryData {
  id: string;
  type: 'conversation' | 'behavior' | 'preference' | 'context';
  content: any;
  timestamp: number;
  importance: number; // 1-10, 重要性评分
  tags: string[];
}

// 情绪上下文
export interface EmotionContext {
  currentEmotion: EmotionType;
  intensity: number; // 0-1, 情绪强度
  duration: number;  // 持续时间（毫秒）
  triggers: string[]; // 触发因素
  history: EmotionHistory[];
}

export interface EmotionHistory {
  emotion: EmotionType;
  timestamp: number;
  cause: string;
}

// 配置接口
export interface PetBrainConfig {
  defaultState: PetState;
  defaultEmotion: EmotionType;
  memoryLimit: number;
  aiProviders: AIProvider[];
  plugins: string[];
}
