/**
 * T4_UI_AnimatedPlayer_Controls_V1
 * 
 * 情绪感知的播放控制组件
 * 支持基础播放控制和行为策略绑定集成
 * 
 * T4-B: 新增行为绑定功能
 * - bindBehavior: 绑定行为名称与情绪到动画效果
 * - triggerBehavior: 触发指定行为动画
 * - 支持多种动画类型和强度
 */

import React, { useState, useCallback, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import './AnimatedPlayer.css';
import { BehaviorStrategyManager, BehaviorStrategyRule } from '../../../core/BehaviorStrategyManager';
import { VisualFeedbackManager, VisualCueType } from '../../../core/visual/VisualFeedbackManager';
import { BehaviorRhythmManager } from '../../../modules/rhythm/BehaviorRhythmManager';
import { RhythmMode, type RhythmState } from '../../../types/BehaviorRhythm';

type RhythmModeType = typeof RhythmMode[keyof typeof RhythmMode];

// 类型定义 - 与现有系统兼容
export enum PetState {
  Idle = 'idle',
  Hover = 'hover', 
  Awaken = 'awaken',
  Control = 'control'
}

export enum EmotionType {
  Happy = 'happy',
  Calm = 'calm',
  Excited = 'excited',
  Curious = 'curious',
  Sleepy = 'sleepy',
  Focused = 'focused'
}

// 行为策略接口
export interface BehaviorStrategy {
  getStrategy: (state: PetState, emotion: EmotionType) => string;
  executeStrategy: (behaviorName: string, context?: any) => void;
}

// 行为绑定接口
export interface BehaviorBinding {
  behaviorName: string;
  emotion: EmotionType;
  animationType: 'pulse' | 'glow' | 'shake' | 'bounce' | 'fade' | 'spin' | 'tilt';
  duration: number; // 毫秒
  intensity: 'low' | 'medium' | 'high';
  triggerEffect?: string; // CSS动画类名
  onComplete?: () => void;
}

// 行为绑定管理器接口
export interface BehaviorBindingManager {
  bindBehavior: (behaviorName: string, emotion: EmotionType, config?: Partial<BehaviorBinding>) => void;
  unbindBehavior: (behaviorName: string) => void;
  triggerBehavior: (behaviorName: string, data?: any) => void;
  getCurrentBindings: () => BehaviorBinding[];
  clearAllBindings: () => void;
  // T4-B: 新增行为策略绑定方法
  bindBehaviorStrategy: (strategy: BehaviorStrategy, rhythmMode?: RhythmModeType) => void;
  // T4-C: 新增视觉反馈管理器绑定方法
  bindVisualFeedbackManager: (manager: VisualFeedbackManager) => void;
  // T4-C: 统一视觉反馈调度方法
  dispatchVisualFeedback: (type: VisualCueType) => void;
}

// 组件 Props 接口
export interface AnimatedPlayerProps {
  petState: PetState;
  emotionType: EmotionType;
  // 行为调度钩子
  onBehaviorTrigger?: (action: string, data?: any) => void;
  // 行为完成回调
  onBehaviorComplete?: (behaviorName: string, result: any) => void;
  // 可选的样式定制
  className?: string;
  disabled?: boolean;
}

// 控制按钮配置
interface ControlButtonConfig {
  id: string;
  icon: string;
  label: string;
  action: string;
  emotionSensitive?: boolean; // 是否受情绪影响
  stateRestricted?: PetState[]; // 限制在特定状态下可用
}

// 按钮配置数据
const buttonConfigs: ControlButtonConfig[] = [
  {
    id: 'play',
    icon: 'play.png',
    label: '播放',
    action: 'play',
    emotionSensitive: true
  },
  {
    id: 'pause',
    icon: 'pause.png', 
    label: '暂停',
    action: 'pause',
    emotionSensitive: false
  },
  {
    id: 'stop',
    icon: 'stop.png',
    label: '停止', 
    action: 'stop',
    emotionSensitive: false
  },
  {
    id: 'prev',
    icon: 'prev.png',
    label: '上一首',
    action: 'prev',
    emotionSensitive: true
  },
  {
    id: 'next',
    icon: 'next.png',
    label: '下一首',
    action: 'next',
    emotionSensitive: true
  },
  {
    id: 'cast',
    icon: 'cast.png',
    label: '投屏',
    action: 'cast',
    stateRestricted: [PetState.Awaken, PetState.Control]
  },
  {
    id: 'folder',
    icon: 'folder.png',
    label: '文件夹',
    action: 'folder',
    stateRestricted: [PetState.Control]
  },
  {
    id: 'globe',
    icon: 'globe.png',
    label: '浏览器跳转',
    action: 'openUrl',
    stateRestricted: [PetState.Awaken, PetState.Control]
  }
];

// 单个控制按钮组件
interface ControlButtonProps {
  config: ControlButtonConfig;
  petState: PetState;
  emotionType: EmotionType;
  onClick: (action: string, config: ControlButtonConfig) => void;
  disabled?: boolean;
}

const ControlButton: React.FC<ControlButtonProps> = ({
  config,
  petState,
  emotionType,
  onClick,
  disabled = false
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // 检查按钮是否应该启用
  const isEnabled = useCallback(() => {
    if (disabled) return false;
    
    // 检查状态限制
    if (config.stateRestricted) {
      return config.stateRestricted.includes(petState);
    }
    
    return true;
  }, [disabled, config.stateRestricted, petState]);

  // 获取情绪相关的CSS类名
  const getEmotionClass = useCallback(() => {
    if (!config.emotionSensitive) return '';
    
    switch (emotionType) {
      case EmotionType.Excited:
        return 'emotion-excited';
      case EmotionType.Happy:
        return 'emotion-happy';
      case EmotionType.Focused:
        return 'emotion-focused';
      case EmotionType.Curious:
        return 'emotion-curious';
      case EmotionType.Calm:
        return 'emotion-calm';
      case EmotionType.Sleepy:
        return 'emotion-sleepy';
      default:
        return '';
    }
  }, [config.emotionSensitive, emotionType]);

  // 获取状态相关的CSS类名
  const getStateClass = useCallback(() => {
    return `state-${petState}`;
  }, [petState]);

  const handleClick = useCallback(() => {
    if (!isEnabled()) return;
    
    console.log(`[AnimatedPlayer] ${config.label} clicked - State: ${petState}, Emotion: ${emotionType}`);
    onClick(config.action, config);
  }, [config, petState, emotionType, onClick, isEnabled]);

  const buttonClassNames = [
    'control-button',
    `control-button-${config.id}`,
    getEmotionClass(),
    getStateClass(),
    isHovered ? 'hovered' : '',
    isPressed ? 'pressed' : '',
    !isEnabled() ? 'disabled' : 'enabled'
  ].filter(Boolean).join(' ');

  return (
    <button
      className={buttonClassNames}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      disabled={!isEnabled()}
      title={`${config.label} (${petState}/${emotionType})`}
      aria-label={config.label}
    >
      <img 
        src={`/ui/components/Player/${config.icon}`}
        alt={config.label}
        className="control-icon"
        draggable={false}
      />
      <span className="control-label">{config.label}</span>
    </button>
  );
};

// 装饰性气泡组件
const DecorationBubble: React.FC<{ emotionType: EmotionType }> = ({ emotionType }) => {
  const getBubbleText = useCallback(() => {
    switch (emotionType) {
      case EmotionType.Excited:
        return '🎉 超级兴奋！';
      case EmotionType.Happy:
        return '😊 心情愉快';
      case EmotionType.Focused:
        return '🎯 专注模式';
      case EmotionType.Curious:
        return '🔍 好奇探索';
      case EmotionType.Calm:
        return '😌 平静安详';
      case EmotionType.Sleepy:
        return '😴 有点困了';
      default:
        return '🤖 准备就绪';
    }
  }, [emotionType]);

  return (
    <div className={`decoration-bubble emotion-${emotionType}`}>
      <img 
        src="/ui/components/Player/bubble.png" 
        alt="decoration"
        className="bubble-icon"
      />
      <span className="bubble-text">{getBubbleText()}</span>
    </div>
  );
};

// 主组件 - 使用forwardRef支持ref传递和行为绑定
const AnimatedPlayerComponent = forwardRef<BehaviorBindingManager, AnimatedPlayerProps>(({
  petState,
  emotionType,
  onBehaviorTrigger,
  onBehaviorComplete,
  className = '',
  disabled = false
}, ref) => {
  const [lastAction, setLastAction] = useState<string>('');
  const [actionHistory, setActionHistory] = useState<string[]>([]);
  const [behaviorBindings, setBehaviorBindings] = useState<BehaviorBinding[]>([]);
  const [currentBehavior, setCurrentBehavior] = useState<string>('');
  const [currentStrategy, setCurrentStrategy] = useState<BehaviorStrategy | null>(null);
  const [visualFeedbackManager, setVisualFeedbackManager] = useState<VisualFeedbackManager | null>(null);
  
  // 节奏管理器状态
  const [rhythmManager, setRhythmManager] = useState<BehaviorRhythmManager | null>(null);
  const [rhythmState, setRhythmState] = useState<RhythmState | null>(null);
  const [isRhythmSynced, setIsRhythmSynced] = useState(false);
  
  const componentRef = useRef<HTMLDivElement>(null);
  const [animationState, setAnimationState] = useState<{
    isAnimating: boolean;
    animationType: string;
    intensity: string;
  }>({
    isAnimating: false,
    animationType: '',
    intensity: ''
  });

  // 行为绑定管理器实现
  const bindBehavior = useCallback((behaviorName: string, emotion: EmotionType, config?: Partial<BehaviorBinding>) => {
    console.log(`[AnimatedPlayer] Binding behavior: ${behaviorName} with emotion: ${emotion}`);
    
    const newBinding: BehaviorBinding = {
      behaviorName,
      emotion,
      animationType: config?.animationType || 'pulse',
      duration: config?.duration || 1000,
      intensity: config?.intensity || 'medium',
      triggerEffect: config?.triggerEffect,
      onComplete: config?.onComplete
    };

    setBehaviorBindings(prev => {
      const existing = prev.find(b => b.behaviorName === behaviorName);
      if (existing) {
        // 更新现有绑定
        return prev.map(b => b.behaviorName === behaviorName ? newBinding : b);
      } else {
        // 添加新绑定
        return [...prev, newBinding];
      }
    });
  }, []);

  const unbindBehavior = useCallback((behaviorName: string) => {
    console.log(`[AnimatedPlayer] Unbinding behavior: ${behaviorName}`);
    setBehaviorBindings(prev => prev.filter(b => b.behaviorName !== behaviorName));
  }, []);

  const triggerBehavior = useCallback((behaviorName: string, data?: any) => {
    const binding = behaviorBindings.find(b => b.behaviorName === behaviorName);
    if (!binding) {
      console.warn(`[AnimatedPlayer] Behavior not found: ${behaviorName}`);
      return;
    }

    // 检查情绪匹配
    if (binding.emotion !== emotionType) {
      console.log(`[AnimatedPlayer] Emotion mismatch for behavior ${behaviorName}: expected ${binding.emotion}, current ${emotionType}`);
      // 可以选择是否仍然执行行为
    }

    console.log(`[AnimatedPlayer] Triggering behavior: ${behaviorName}`, binding);
    setCurrentBehavior(behaviorName);
    
    // 设置动画状态
    setAnimationState({
      isAnimating: true,
      animationType: binding.animationType,
      intensity: binding.intensity
    });

    // 调用行为触发回调
    if (onBehaviorTrigger) {
      onBehaviorTrigger(behaviorName, {
        petState,
        emotionType,
        binding,
        data,
        timestamp: Date.now()
      });
    }

    // 定时器处理动画完成
    setTimeout(() => {
      setAnimationState({
        isAnimating: false,
        animationType: '',
        intensity: ''
      });
      setCurrentBehavior('');

      // 调用完成回调
      if (binding.onComplete) {
        binding.onComplete();
      }
      if (onBehaviorComplete) {
        onBehaviorComplete(behaviorName, { success: true, duration: binding.duration });
      }
    }, binding.duration);
  }, [behaviorBindings, emotionType, petState, onBehaviorTrigger, onBehaviorComplete]);

  const getCurrentBindings = useCallback(() => {
    return [...behaviorBindings];
  }, [behaviorBindings]);

  const clearAllBindings = useCallback(() => {
    console.log('[AnimatedPlayer] Clearing all behavior bindings');
    setBehaviorBindings([]);
  }, []);

  // T4-C: 行为策略绑定方法（支持节奏参数）
  const bindBehaviorStrategy = useCallback((strategy: BehaviorStrategy, rhythmMode?: RhythmModeType) => {
    console.log('[AnimatedPlayer] Binding behavior strategy with rhythm mode:', rhythmMode || 'default');
    setCurrentStrategy(strategy);
    
    // 如果提供了节奏模式，设置到节奏管理器
    if (rhythmMode && rhythmManager) {
      rhythmManager.setRhythmMode(rhythmMode);
      console.log('[AnimatedPlayer] Rhythm mode set to:', rhythmMode);
    }
    
    // 立即应用当前状态和情绪的策略（稍后在 useEffect 中处理）
  }, [rhythmManager]);

  // T4-C: 视觉反馈管理器绑定方法
  const bindVisualFeedbackManager = useCallback((manager: VisualFeedbackManager) => {
    console.log('[AnimatedPlayer] Binding visual feedback manager');
    setVisualFeedbackManager(manager);
    
    // 绑定组件引用到视觉反馈管理器
    if (componentRef.current) {
      manager.bindComponent({ current: componentRef.current });
    }

    // 注册节奏同步监听器
    manager.onRhythmSync((rhythmType) => {
      console.log('[AnimatedPlayer] Rhythm sync event:', rhythmType);
      
      // 触发节奏相关的视觉效果
      setAnimationState({
        isAnimating: true,
        animationType: 'pulse',
        intensity: 'medium'
      });

      // 自动停止动画
      setTimeout(() => {
        setAnimationState({
          isAnimating: false,
          animationType: '',
          intensity: ''
        });
      }, 1000);
    });
  }, []);

  // T4-C: 统一视觉反馈调度方法
  const dispatchVisualFeedback = useCallback((type: VisualCueType) => {
    console.log(`[AnimatedPlayer] Dispatching visual feedback: ${type}`);
    
    if (visualFeedbackManager) {
      visualFeedbackManager.dispatchVisualFeedback(type, {
        emotion: emotionType,
        intensity: 0.7,
        state: petState
      });
    } else {
      console.warn('[AnimatedPlayer] Visual feedback manager not bound');
      
      // 回退到本地动画处理
      const animationType = getAnimationFromCueType(type);
      setAnimationState({
        isAnimating: true,
        animationType,
        intensity: 'medium'
      });

      setTimeout(() => {
        setAnimationState({
          isAnimating: false,
          animationType: '',
          intensity: ''
        });
      }, 1000);
    }
  }, [visualFeedbackManager, emotionType, petState]);

  // T4-C: 节奏驱动的行为应用方法
  const applyBehavior = useCallback((behaviorName: string, rhythmMode?: RhythmModeType) => {
    console.log(`[AnimatedPlayer] Applying behavior: ${behaviorName} with rhythm mode: ${rhythmMode || 'default'}`);
    
    if (!rhythmManager) {
      console.warn('[AnimatedPlayer] Rhythm manager not initialized, falling back to immediate execution');
      executeRhythmBehavior(behaviorName);
      return;
    }

    // 如果提供了节奏模式，先设置节奏模式
    if (rhythmMode) {
      rhythmManager.setRhythmMode(rhythmMode);
    }

    // 使用节奏管理器的 tick 方法来执行节奏驱动的行为
    rhythmManager.tick(() => {
      executeRhythmBehavior(behaviorName);
    });
  }, [rhythmManager]);

  // 实际执行行为动画的方法
  const executeRhythmBehavior = useCallback((behaviorName: string) => {
    setCurrentBehavior(behaviorName);

    // 根据行为名称设置相应的动画和效果
    switch (behaviorName) {
      case 'play_idle':
        setAnimationState({
          isAnimating: true,
          animationType: 'pulse',
          intensity: 'low'
        });
        console.log('🎵 [Rhythm] Play idle animation');
        break;
      
      case 'play_alert':
        setAnimationState({
          isAnimating: true,
          animationType: 'shake',
          intensity: 'high'
        });
        console.log('⚠️ [Rhythm] Play alert animation');
        break;
      
      case 'show_happy':
        setAnimationState({
          isAnimating: true,
          animationType: 'bounce',
          intensity: 'medium'
        });
        console.log('😊 [Rhythm] Show happy emotion bubble');
        break;
      
      case 'show_excited':
        setAnimationState({
          isAnimating: true,
          animationType: 'spin',
          intensity: 'high'
        });
        console.log('🎉 [Rhythm] Show excited animation');
        break;
      
      case 'show_focused':
        setAnimationState({
          isAnimating: true,
          animationType: 'glow',
          intensity: 'medium'
        });
        console.log('🎯 [Rhythm] Show focused state');
        break;
      
      case 'show_curious':
        setAnimationState({
          isAnimating: true,
          animationType: 'tilt',
          intensity: 'medium'
        });
        console.log('🔍 [Rhythm] Show curious animation');
        break;
      
      case 'show_calm':
        setAnimationState({
          isAnimating: true,
          animationType: 'fade',
          intensity: 'low'
        });
        console.log('😌 [Rhythm] Show calm state');
        break;
      
      case 'hover_feedback':
        setAnimationState({
          isAnimating: true,
          animationType: 'pulse',
          intensity: 'medium'
        });
        console.log('👆 [Rhythm] Show hover feedback');
        break;
      
      default:
        console.warn(`[AnimatedPlayer] Unknown behavior: ${behaviorName}`);
        return;
    }

    // 动画完成后重置状态 - 根据节奏管理器的间隔调整
    const currentState = rhythmManager?.getCurrentState();
    const animationDuration = currentState?.config.baseInterval || 1500;
    setTimeout(() => {
      setAnimationState({
        isAnimating: false,
        animationType: '',
        intensity: ''
      });
      setCurrentBehavior('');
    }, Math.min(animationDuration * 0.8, 1500)); // 动画时长不超过节奏间隔的80%
  }, [rhythmManager]);

  // 辅助方法：将VisualCueType转换为动画类型
  const getAnimationFromCueType = useCallback((cueType: VisualCueType): string => {
    switch (cueType) {
      case VisualCueType.IDLE_PULSE:
        return 'pulse';
      case VisualCueType.GLOW:
        return 'glow';
      case VisualCueType.SHAKE:
        return 'shake';
      case VisualCueType.BOUNCE:
        return 'bounce';
      case VisualCueType.FADE:
        return 'fade';
      case VisualCueType.SPIN:
        return 'spin';
      case VisualCueType.TILT:
        return 'tilt';
      case VisualCueType.WAVE:
        return 'shake'; // 使用shake代替wave
      case VisualCueType.NOD:
        return 'bounce'; // 使用bounce代替nod
      case VisualCueType.EXPRESSION_SHIFT:
        return 'fade'; // 使用fade代替expression shift
      default:
        return 'pulse';
    }
  }, []);

  // 当状态或情绪变化时，自动应用策略（节奏驱动）
  useEffect(() => {
    if (currentStrategy) {
      const behaviorName = currentStrategy.getStrategy(petState, emotionType);
      if (behaviorName) {
        applyBehavior(behaviorName);
      }
    }
  }, [petState, emotionType, currentStrategy, applyBehavior]);

  // 节奏管理器集成方法
  const bindRhythmManager = useCallback((manager: BehaviorRhythmManager) => {
    console.log('[AnimatedPlayer] Binding rhythm manager');
    setRhythmManager(manager);
    setIsRhythmSynced(true);
    
    // 监听节奏状态变化
    manager.onRhythmChange((mode, config) => {
      console.log(`[AnimatedPlayer] Rhythm change: ${mode}`);
      setRhythmState(manager.getCurrentState());
      
      // 根据节奏模式调整UI节拍效果
      syncWithRhythm(mode, config.baseInterval);
    });
    
    // 注册节拍回调
    manager.tick((timestamp, interval) => {
      onRhythmTick(interval);
    });
  }, []);

  // 节拍同步方法
  const syncWithRhythm = useCallback((mode: RhythmModeType, interval: number) => {
    if (!componentRef.current) return;
    
    console.log(`[AnimatedPlayer] Syncing with rhythm: ${mode}, interval: ${interval}ms`);
    
    // 根据节奏模式添加CSS类
    const element = componentRef.current;
    element.classList.remove('rhythm-steady', 'rhythm-pulse', 'rhythm-sequence', 'rhythm-adaptive', 'rhythm-sync');
    element.classList.add(`rhythm-${mode}`);
    
    // 设置CSS变量控制动画节拍
    element.style.setProperty('--rhythm-interval', `${interval}ms`);
    
    // 触发相应的节拍动画
    switch (mode) {
      case RhythmMode.PULSE:
        setAnimationState({
          isAnimating: true,
          animationType: 'pulse',
          intensity: 'medium'
        });
        break;
      case RhythmMode.SEQUENCE:
        setAnimationState({
          isAnimating: true,
          animationType: 'bounce',
          intensity: 'low'
        });
        break;
      case RhythmMode.ADAPTIVE:
        // 根据情绪调整动画
        const animationType = emotionType === EmotionType.Excited ? 'bounce' : 
                             emotionType === EmotionType.Calm ? 'fade' : 'pulse';
        setAnimationState({
          isAnimating: true,
          animationType,
          intensity: 'medium'
        });
        break;
    }
  }, [emotionType]);

  // 节拍回调方法
  const onRhythmTick = useCallback((interval: number) => {
    if (!isRhythmSynced || !componentRef.current) return;
    
    // 在每个节拍触发时添加视觉反馈
    const element = componentRef.current;
    element.classList.add('rhythm-tick');
    
    // 短暂的节拍指示效果
    setTimeout(() => {
      element.classList.remove('rhythm-tick');
    }, Math.min(100, interval * 0.1)); // 节拍指示持续时间为间隔的10%，最多100ms
  }, [isRhythmSynced]);

  // 设置节奏模式
  const setRhythmMode = useCallback((mode: RhythmModeType) => {
    if (rhythmManager) {
      console.log(`[AnimatedPlayer] Setting rhythm mode: ${mode}`);
      rhythmManager.setRhythmMode(mode);
    }
  }, [rhythmManager]);

  // 启动/停止节奏
  const startRhythm = useCallback(() => {
    if (rhythmManager) {
      rhythmManager.start();
      console.log('[AnimatedPlayer] Rhythm started');
    }
  }, [rhythmManager]);

  const stopRhythm = useCallback(() => {
    if (rhythmManager) {
      rhythmManager.stop();
      console.log('[AnimatedPlayer] Rhythm stopped');
    }
  }, [rhythmManager]);

  // 暴露行为绑定管理器接口
  useImperativeHandle(ref, () => ({
    bindBehavior,
    unbindBehavior,
    triggerBehavior,
    getCurrentBindings,
    clearAllBindings,
    bindBehaviorStrategy,
    bindVisualFeedbackManager,
    dispatchVisualFeedback,
    bindRhythmManager,
    setRhythmMode,
    startRhythm,
    stopRhythm
  }), [bindBehavior, unbindBehavior, triggerBehavior, getCurrentBindings, clearAllBindings, bindBehaviorStrategy, bindVisualFeedbackManager, dispatchVisualFeedback, bindRhythmManager, setRhythmMode, startRhythm, stopRhythm]);

  // 处理按钮点击
  const handleButtonClick = useCallback((action: string, config: ControlButtonConfig) => {
    console.log(`[AnimatedPlayer] Action: ${action}`);
    
    // 更新历史记录
    setLastAction(action);
    setActionHistory(prev => [...prev.slice(-4), action]);
    
    // 调用行为调度钩子
    if (onBehaviorTrigger) {
      onBehaviorTrigger(action, {
        petState,
        emotionType,
        config,
        timestamp: Date.now()
      });
    }

    // 模拟实际行为（当前阶段）
    switch (action) {
      case 'play':
        console.log('▶️ Play');
        break;
      case 'pause':
        console.log('⏸️ Pause');
        break;
      case 'stop':
        console.log('⏹️ Stop');
        break;
      case 'prev':
        console.log('⏮️ Prev');
        break;
      case 'next':
        console.log('⏭️ Next');
        break;
      case 'cast':
        console.log('📺 Cast');
        break;
      case 'folder':
        console.log('📁 Folder');
        break;
      case 'openUrl':
        console.log('🌐 Open URL');
        break;
      default:
        console.log(`🤖 Unknown action: ${action}`);
    }
  }, [petState, emotionType, onBehaviorTrigger]);

  // 组件挂载时的日志
  useEffect(() => {
    console.log(`[AnimatedPlayer] Component mounted - State: ${petState}, Emotion: ${emotionType}`);
  }, []);

  // 状态变化时的日志
  useEffect(() => {
    console.log(`[AnimatedPlayer] State changed to: ${petState}`);
  }, [petState]);

  useEffect(() => {
    console.log(`[AnimatedPlayer] Emotion changed to: ${emotionType}`);
  }, [emotionType]);

  const containerClassNames = [
    'animated-player-container',
    `pet-state-${petState}`,
    `emotion-${emotionType}`,
    animationState.isAnimating ? `behavior-${animationState.animationType}` : '',
    animationState.isAnimating ? `intensity-${animationState.intensity}` : '',
    currentBehavior ? `current-behavior-${currentBehavior}` : '',
    disabled ? 'disabled' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div ref={componentRef} className={containerClassNames}>
      {/* 装饰性气泡 */}
      <DecorationBubble emotionType={emotionType} />
      
      {/* 控制按钮区域 */}
      <div className="controls-container">
        <div className="controls-row">
          {buttonConfigs.map(config => (
            <ControlButton
              key={config.id}
              config={config}
              petState={petState}
              emotionType={emotionType}
              onClick={handleButtonClick}
              disabled={disabled}
            />
          ))}
        </div>
      </div>

      {/* 状态显示区域 */}
      <div className="status-display">
        <div className="current-state">
          <span className="state-label">状态:</span>
          <span className={`state-value ${petState}`}>{petState}</span>
        </div>
        <div className="current-emotion">
          <span className="emotion-label">情绪:</span>
          <span className={`emotion-value ${emotionType}`}>{emotionType}</span>
        </div>
        {lastAction && (
          <div className="last-action">
            <span className="action-label">最后操作:</span>
            <span className="action-value">{lastAction}</span>
          </div>
        )}
        {currentBehavior && (
          <div className="current-behavior">
            <span className="behavior-label">当前行为:</span>
            <span className="behavior-value">{currentBehavior}</span>
          </div>
        )}
        {currentStrategy && (
          <div className="current-strategy">
            <span className="strategy-label">策略状态:</span>
            <span className="strategy-value">已绑定</span>
          </div>
        )}
      </div>

      {/* 行为绑定信息显示 */}
      <div className="behavior-hooks">
        <small>🔗 行为策略绑定: {behaviorBindings.length} 个</small>
        {animationState.isAnimating && (
          <div className="animation-indicator">
            🎬 {animationState.animationType} ({animationState.intensity})
          </div>
        )}
        {actionHistory.length > 0 && (
          <div className="action-history">
            历史: {actionHistory.slice(-3).join(' → ')}
          </div>
        )}
      </div>
    </div>
  );
});

// 设置显示名称
AnimatedPlayerComponent.displayName = 'AnimatedPlayerComponent';

// 导出组件
export default AnimatedPlayerComponent;
export { ControlButton, DecorationBubble };
export type { ControlButtonConfig, ControlButtonProps };
