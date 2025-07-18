import React from 'react';
import { PetState, EmotionType } from '../types';

interface BowlUIProps {
  onBowlStateChange: (state: PetState, emotion: EmotionType) => void;
  currentState: PetState;
  currentEmotion: EmotionType;
}

interface StateButtonConfig {
  id: string;
  state: PetState;
  emotion: EmotionType;
  icon: string;
  label: string;
  color: string;
}

const stateButtons: StateButtonConfig[] = [
  {
    id: 'idle-calm',
    state: PetState.Idle,
    emotion: EmotionType.Calm,
    icon: '�',
    label: '静默',
    color: '#95E1D3'
  },
  {
    id: 'awaken-excited',
    state: PetState.Awaken,
    emotion: EmotionType.Excited,
    icon: '🤩',
    label: '活跃',
    color: '#FFD700'
  },
  {
    id: 'hover-curious',
    state: PetState.Hover,
    emotion: EmotionType.Curious,
    icon: '🤔',
    label: '互动',
    color: '#A8E6CF'
  },
  {
    id: 'control-focused',
    state: PetState.Control,
    emotion: EmotionType.Focused,
    icon: '🎯',
    label: '专注',
    color: '#DDA0DD'
  }
];

const BowlUI: React.FC<BowlUIProps> = ({ onBowlStateChange, currentState, currentEmotion }) => {
  const handleStateButtonClick = (config: StateButtonConfig) => {
    // 控制台日志输出
    console.log(`[🍚 BOWL STATE] 碗状态切换至: ${config.state}, 情绪切换至: ${config.emotion}`);
    
    // 调用父组件的处理函数
    onBowlStateChange(config.state, config.emotion);
  };

  const getBowlStyle = () => {
    // 根据当前状态获取对应的配置
    const currentConfig = stateButtons.find(
      btn => btn.state === currentState && btn.emotion === currentEmotion
    ) || stateButtons[0];

    // 根据状态调整大小和效果
    const getSizeAndEffects = () => {
      switch (currentState) {
        case PetState.Idle:
          return { size: '100px', glow: '0 4px 20px', animation: 'none' };
        case PetState.Awaken:
          return { size: '130px', glow: '0 8px 40px', animation: 'pulse 2s infinite' };
        case PetState.Hover:
          return { size: '120px', glow: '0 6px 30px', animation: 'bounce 1.5s infinite' };
        case PetState.Control:
          return { size: '110px', glow: '0 4px 25px', animation: 'none' };
        default:
          return { size: '120px', glow: '0 8px 32px', animation: 'none' };
      }
    };

    const { size, glow, animation } = getSizeAndEffects();

    return {
      width: size,
      height: size,
      borderRadius: '50%',
      background: `linear-gradient(135deg, ${currentConfig.color}, #F38BA8)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '48px',
      cursor: 'pointer',
      boxShadow: `${glow} ${currentConfig.color}50`,
      transition: 'all 0.3s ease',
      marginBottom: '20px',
      animation: animation
    };
  };

  const getBowlEmoji = () => {
    // 根据状态返回不同的碗表情
    switch (currentState) {
      case PetState.Idle:
        return '🥣😴'; // 静默状态 - 睡觉的碗
      case PetState.Awaken:
        return '🥣🤩'; // 活跃状态 - 兴奋的碗
      case PetState.Hover:
        return '🥣🤔'; // 互动状态 - 好奇的碗
      case PetState.Control:
        return '🥣🎯'; // 专注状态 - 专注的碗
      default:
        return '🥣😊';
    }
  };

  const getButtonStyle = (config: StateButtonConfig) => {
    const isActive = config.state === currentState && config.emotion === currentEmotion;
    
    return {
      padding: '10px 16px',
      margin: '5px',
      backgroundColor: isActive ? config.color : '#f0f0f0',
      color: isActive ? 'white' : '#333',
      border: isActive ? `2px solid ${config.color}` : '2px solid #ddd',
      borderRadius: '20px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 'bold',
      transition: 'all 0.3s ease',
      boxShadow: isActive ? `0 4px 12px ${config.color}40` : '0 2px 4px rgba(0,0,0,0.1)'
    };
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      padding: '20px'
    }}>
      {/* 状态标题显示 */}
      <div style={{
        marginBottom: '15px',
        padding: '8px 16px',
        background: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '20px',
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#333',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        🍚 神宠状态切换控制面板
      </div>

      {/* 主碗显示 */}
      <div
        style={getBowlStyle()}
        title={`当前状态: ${currentState} | 情绪: ${currentEmotion}`}
      >
        {getBowlEmoji()}
      </div>

      {/* 当前状态信息显示 */}
      <div style={{
        marginBottom: '15px',
        padding: '10px 20px',
        background: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        borderRadius: '15px',
        fontSize: '14px',
        textAlign: 'center'
      }}>
        <div>状态: <strong>{currentState}</strong></div>
        <div>情绪: <strong>{currentEmotion}</strong></div>
      </div>

      {/* 状态切换按钮组 */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '8px',
        maxWidth: '300px'
      }}>
        {stateButtons.map((config) => (
          <button
            key={config.id}
            style={getButtonStyle(config)}
            onClick={() => handleStateButtonClick(config)}
            onMouseEnter={(e) => {
              if (config.state !== currentState || config.emotion !== currentEmotion) {
                e.currentTarget.style.backgroundColor = `${config.color}20`;
                e.currentTarget.style.borderColor = config.color;
              }
            }}
            onMouseLeave={(e) => {
              if (config.state !== currentState || config.emotion !== currentEmotion) {
                e.currentTarget.style.backgroundColor = '#f0f0f0';
                e.currentTarget.style.borderColor = '#ddd';
              }
            }}
          >
            {config.icon} {config.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BowlUI;
