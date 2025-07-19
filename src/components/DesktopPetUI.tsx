import React, { useState, useEffect } from 'react';
import './DesktopPetUI.css';

interface PetState {
  current: 'steady' | 'awaken' | 'pulse' | 'control';
  emotion: 'calm' | 'curious' | 'excited' | 'focused';
  interactionCount: number;
}

const DesktopPetUI: React.FC = () => {
  const [petState, setPetState] = useState<PetState>({
    current: 'steady',
    emotion: 'calm',
    interactionCount: 0
  });

  const [showStats, setShowStats] = useState(false);

  // 状态对应的颜色和动画
  const getStateStyle = () => {
    const baseStyle = {
      width: '120px',
      height: '120px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '48px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      border: '3px solid',
      position: 'relative' as const,
    };

    switch (petState.current) {
      case 'steady':
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderColor: '#764ba2',
          transform: 'scale(1)',
          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
        };
      case 'awaken':
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          borderColor: '#f5576c',
          transform: 'scale(1.1)',
          boxShadow: '0 6px 20px rgba(240, 147, 251, 0.4)',
          animation: 'pulse 1s infinite',
        };
      case 'pulse':
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          borderColor: '#00f2fe',
          transform: 'scale(1.05)',
          boxShadow: '0 8px 25px rgba(79, 172, 254, 0.5)',
          animation: 'rapidPulse 0.5s infinite',
        };
      case 'control':
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
          borderColor: '#fee140',
          transform: 'scale(0.95)',
          boxShadow: '0 10px 30px rgba(254, 225, 64, 0.6)',
          animation: 'glow 2s infinite',
        };
      default:
        return baseStyle;
    }
  };

  // 情绪对应的表情
  const getEmotionEmoji = () => {
    switch (petState.emotion) {
      case 'calm': return '😌';
      case 'curious': return '🤔';
      case 'excited': return '🤩';
      case 'focused': return '🧐';
      default: return '😊';
    }
  };

  // 点击事件处理
  const handleClick = (event: React.MouseEvent) => {
    const newCount = petState.interactionCount + 1;
    
    // 根据点击类型切换状态
    if (event.shiftKey) {
      // Shift+点击 = control状态
      setPetState(prev => ({
        ...prev,
        current: 'control',
        emotion: 'focused',
        interactionCount: newCount
      }));
    } else if (event.altKey) {
      // Alt+点击 = pulse状态
      setPetState(prev => ({
        ...prev,
        current: 'pulse',
        emotion: 'excited',
        interactionCount: newCount
      }));
    } else {
      // 普通点击 = awaken状态
      setPetState(prev => ({
        ...prev,
        current: 'awaken',
        emotion: 'curious',
        interactionCount: newCount
      }));
    }

    // 3秒后回到steady状态
    setTimeout(() => {
      setPetState(prev => ({
        ...prev,
        current: 'steady',
        emotion: 'calm'
      }));
    }, 3000);
  };

  // 右键显示/隐藏状态信息
  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setShowStats(!showStats);
  };

  // 双击重置
  const handleDoubleClick = () => {
    setPetState({
      current: 'steady',
      emotion: 'calm',
      interactionCount: 0
    });
    setShowStats(false);
  };

  return (
    <div className="desktop-pet-container">
      <div 
        className="desktop-pet"
        style={getStateStyle()}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        onDoubleClick={handleDoubleClick}
        title="左键唤醒 | Shift+左键控制 | Alt+左键兴奋 | 右键查看状态 | 双击重置"
      >
        <span className="pet-emoji">{getEmotionEmoji()}</span>
        
        {/* 状态指示器 */}
        <div className={`state-indicator ${petState.current}`} />
      </div>

      {/* 状态信息面板 - 只在右键时显示 */}
      {showStats && (
        <div className="stats-panel">
          <div className="stat-item">
            <span className="stat-label">状态:</span>
            <span className="stat-value">
              {petState.current === 'steady' ? '静谧' :
               petState.current === 'awaken' ? '觉醒' :
               petState.current === 'pulse' ? '脉动' : '专注'}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">情绪:</span>
            <span className="stat-value">
              {petState.emotion === 'calm' ? '平静' :
               petState.emotion === 'curious' ? '好奇' :
               petState.emotion === 'excited' ? '兴奋' : '专注'}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">互动:</span>
            <span className="stat-value">{petState.interactionCount}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DesktopPetUI;
