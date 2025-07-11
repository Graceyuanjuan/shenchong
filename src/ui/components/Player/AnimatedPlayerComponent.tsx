/**
 * T4_UI_AnimatedPlayer_Controls_V1
 * 
 * 情绪感知的播放控制组件
 * 支持基础播放控制和未来的行为调度逻辑集成
 */

import React, { useState, useCallback, useEffect } from 'react';
import './AnimatedPlayer.css';

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

// 组件 Props 接口
export interface AnimatedPlayerProps {
  petState: PetState;
  emotionType: EmotionType;
  // 未来扩展的行为调度钩子
  onBehaviorTrigger?: (action: string, data?: any) => void;
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

// 主组件
const AnimatedPlayerComponent: React.FC<AnimatedPlayerProps> = ({
  petState,
  emotionType,
  onBehaviorTrigger,
  className = '',
  disabled = false
}) => {
  const [lastAction, setLastAction] = useState<string>('');
  const [actionHistory, setActionHistory] = useState<string[]>([]);

  // 处理按钮点击
  const handleButtonClick = useCallback((action: string, config: ControlButtonConfig) => {
    console.log(`[AnimatedPlayer] Action: ${action}`);
    
    // 更新历史记录
    setLastAction(action);
    setActionHistory(prev => [...prev.slice(-4), action]);
    
    // 调用行为触发器（未来扩展）
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
    disabled ? 'disabled' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClassNames}>
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
      </div>

      {/* 未来扩展：行为调度信息显示 */}
      <div className="behavior-hooks">
        <small>🔗 已预留行为调度接口</small>
        {actionHistory.length > 0 && (
          <div className="action-history">
            历史: {actionHistory.slice(-3).join(' → ')}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnimatedPlayerComponent;
export { ControlButton, DecorationBubble };
export type { ControlButtonConfig, ControlButtonProps };
