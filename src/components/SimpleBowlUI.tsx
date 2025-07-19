import React, { useState, useCallback } from 'react';
import { PetState, EmotionType } from '../types';

interface SimpleBowlUIProps {
  onBowlStateChange: (state: PetState, emotion: EmotionType) => void;
  currentState: PetState;
  currentEmotion: EmotionType;
}

const SimpleBowlUI: React.FC<SimpleBowlUIProps> = ({ onBowlStateChange, currentState, currentEmotion }) => {
  const [localState, setLocalState] = useState<string>('idle');
  const [interactionCount, setInteractionCount] = useState(0);

  const handleHover = useCallback(() => {
    console.log('🔥 HOVER TRIGGERED!');
    setLocalState('hover');
    setInteractionCount(prev => prev + 1);
    onBowlStateChange(PetState.Hover, EmotionType.Curious);
  }, [onBowlStateChange]);

  const handleClick = useCallback(() => {
    console.log('🔥 CLICK TRIGGERED!');
    setLocalState('active');
    setInteractionCount(prev => prev + 1);
    onBowlStateChange(PetState.Awaken, EmotionType.Excited);
  }, [onBowlStateChange]);

  const handleRightClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    console.log('🔥 RIGHT CLICK TRIGGERED!');
    setLocalState('control');
    setInteractionCount(prev => prev + 1);
    onBowlStateChange(PetState.Control, EmotionType.Focused);
  }, [onBowlStateChange]);

  const handleLeave = useCallback(() => {
    console.log('🔥 MOUSE LEAVE TRIGGERED!');
    setTimeout(() => {
      setLocalState('idle');
      onBowlStateChange(PetState.Idle, EmotionType.Calm);
    }, 500);
  }, [onBowlStateChange]);

  const getStyle = () => {
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
      userSelect: 'none' as const,
      position: 'relative' as const
    };

    switch (localState) {
      case 'idle':
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #a8a8ff 0%, #d4a5ff 100%)',
          borderColor: '#a8a8ff',
          transform: 'scale(1)'
        };
      case 'hover':
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #82e0aa 0%, #a8e6cf 100%)',
          borderColor: '#82e0aa',
          transform: 'scale(1.1)',
          boxShadow: '0 6px 30px rgba(130, 224, 170, 0.6)'
        };
      case 'active':
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #ffd700 0%, #ffb347 100%)',
          borderColor: '#ffd700',
          transform: 'scale(1.15)',
          boxShadow: '0 8px 40px rgba(255, 215, 0, 0.8)'
        };
      case 'control':
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #ff8a80 0%, #ff5722 100%)',
          borderColor: '#ff8a80',
          transform: 'scale(1.1)',
          boxShadow: '0 6px 35px rgba(255, 87, 34, 0.6)'
        };
      default:
        return baseStyle;
    }
  };

  const getEmoji = () => {
    switch (localState) {
      case 'idle': return '😊';
      case 'hover': return '🤔';
      case 'active': return '🌟';
      case 'control': return '⚙️';
      default: return '😊';
    }
  };

  const getStateText = () => {
    switch (localState) {
      case 'idle': return '静碗';
      case 'hover': return '感应碗';
      case 'active': return '唤醒碗';
      case 'control': return '控制碗';
      default: return '静碗';
    }
  };

  const getEmotionText = () => {
    switch (localState) {
      case 'idle': return '平静';
      case 'hover': return '好奇';
      case 'active': return '兴奋';
      case 'control': return '专注';
      default: return '平静';
    }
  };

  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px'
    }}>
      {/* 主碗体 */}
      <div
        style={getStyle()}
        onMouseEnter={handleHover}
        onMouseLeave={handleLeave}
        onClick={handleClick}
        onContextMenu={handleRightClick}
        title={`状态: ${getStateText()}`}
      >
        {getEmoji()}
      </div>

      {/* 状态信息 */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        padding: '16px',
        background: 'rgba(0, 0, 0, 0.8)',
        borderRadius: '12px',
        color: 'white',
        fontSize: '14px',
        fontWeight: 'bold',
        backdropFilter: 'blur(10px)',
        minWidth: '200px'
      }}>
        <div style={{ marginBottom: '8px' }}>
          <span style={{ color: '#4CAF50' }}>状态:</span> {getStateText()}
        </div>
        <div style={{ marginBottom: '8px' }}>
          <span style={{ color: '#2196F3' }}>情绪:</span> {getEmotionText()}
        </div>
        <div style={{ marginBottom: '8px' }}>
          <span style={{ color: '#FF9800' }}>互动次数:</span> {interactionCount}
        </div>
        <div style={{ fontSize: '12px', color: '#ccc', marginTop: '8px' }}>
          🖱️ 悬浮变绿 | 👆 点击变金 | 🖱️ 右键变红
        </div>
      </div>

      {/* 根据状态显示不同的弹出菜单 */}
      {localState === 'hover' && (
        <div style={{
          position: 'absolute',
          top: '50%',
          right: '20px',
          background: 'rgba(0, 0, 0, 0.9)',
          color: 'white',
          padding: '12px',
          borderRadius: '8px',
          fontSize: '14px'
        }}>
          🎵 语音控制模式
        </div>
      )}

      {localState === 'active' && (
        <div style={{
          position: 'absolute',
          top: '50%',
          right: '20px',
          background: 'rgba(255, 215, 0, 0.9)',
          color: 'black',
          padding: '12px',
          borderRadius: '8px',
          fontSize: '14px'
        }}>
          ⚡ 行为触发模式
        </div>
      )}

      {localState === 'control' && (
        <div style={{
          position: 'absolute',
          top: '50%',
          right: '20px',
          background: 'rgba(255, 87, 34, 0.9)',
          color: 'white',
          padding: '12px',
          borderRadius: '8px',
          fontSize: '14px'
        }}>
          🎛️ 控制面板模式
        </div>
      )}
    </div>
  );
};

export default SimpleBowlUI;
