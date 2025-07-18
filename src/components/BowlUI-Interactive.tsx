import React, { useState } from 'react';
import { PetState, EmotionType } from '../types';

interface BowlUIProps {
  onBowlStateChange: (state: PetState, emotion: EmotionType) => void;
  currentState: PetState;
  currentEmotion: EmotionType;
}

// 四种碗状态枚举
enum BowlState {
  静碗 = 'idle',      // 默认展示
  感应碗 = 'hover',    // 鼠标悬浮
  唤醒碗 = 'awaken',   // 左键点击  
  控制碗 = 'control'   // 右键点击
}

const BowlUI: React.FC<BowlUIProps> = ({ onBowlStateChange, currentState, currentEmotion }) => {
  const [currentBowlState, setCurrentBowlState] = useState<BowlState>(BowlState.静碗);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showControlMenu, setShowControlMenu] = useState(false);
  const [showActionIcons, setShowActionIcons] = useState(false);

  // 状态处理逻辑
  const handleHover = () => {
    setCurrentBowlState(BowlState.感应碗);
    setShowTooltip(true);
    playGlowEffect();
    console.log('[🥣 BOWL] 感应碗状态 - 鼠标悬浮触发');
  };

  const handleMouseLeave = () => {
    setCurrentBowlState(BowlState.静碗);
    setShowTooltip(false);
    setShowActionIcons(false);
    setShowControlMenu(false);
    console.log('[🥣 BOWL] 返回静碗状态');
  };

  const handleLeftClick = () => {
    setCurrentBowlState(BowlState.唤醒碗);
    setShowActionIcons(true);
    triggerActions(['screenshot', 'copy', 'record']);
    onBowlStateChange(PetState.Awaken, EmotionType.Excited);
    console.log('[🥣 BOWL] 唤醒碗状态 - 左键点击触发');
  };

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentBowlState(BowlState.控制碗);
    setShowControlMenu(true);
    openControlMenu();
    onBowlStateChange(PetState.Control, EmotionType.Focused);
    console.log('[🥣 BOWL] 控制碗状态 - 右键点击触发');
  };

  // 播放光晕特效
  const playGlowEffect = () => {
    console.log('[✨ EFFECT] 播放泛光特效');
  };

  // 触发行为动作（可扩展）
  const triggerActions = (actions: string[]) => {
    console.log('[🎯 ACTIONS] 触发行为:', actions.join(', '));
    actions.forEach(action => {
      switch (action) {
        case 'screenshot':
          console.log('[📸 ACTION] 启动截图功能');
          break;
        case 'copy':
          console.log('[📋 ACTION] 启动复制功能');
          break;
        case 'record':
          console.log('[🎥 ACTION] 启动录制功能');
          break;
        default:
          console.log(`[🔧 ACTION] 未知行为: ${action}`);
      }
    });
  };

  // 打开控制菜单
  const openControlMenu = () => {
    console.log('[🎛️ MENU] 打开控制菜单');
  };

  // 获取碗的样式（根据状态）
  const getBowlStyle = () => {
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
      position: 'relative' as const,
      userSelect: 'none' as const
    };

    switch (currentBowlState) {
      case BowlState.静碗:
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #95E1D3, #F38BA8)',
          boxShadow: '0 4px 20px rgba(149, 225, 211, 0.3)'
        };
      case BowlState.感应碗:
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #A8E6CF, #FFD3A5)',
          boxShadow: '0 8px 40px rgba(168, 230, 207, 0.6)',
          transform: 'scale(1.05)',
          animation: 'glow 2s ease-in-out infinite alternate'
        };
      case BowlState.唤醒碗:
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #FFD700, #FF6B6B)',
          boxShadow: '0 12px 50px rgba(255, 215, 0, 0.8)',
          transform: 'scale(1.2)',
          animation: 'pulse 1.5s infinite'
        };
      case BowlState.控制碗:
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #DDA0DD, #B8860B)',
          boxShadow: '0 6px 30px rgba(221, 160, 221, 0.7)',
          transform: 'scale(1.1)'
        };
      default:
        return baseStyle;
    }
  };

  // 获取碗的表情
  const getBowlEmoji = () => {
    switch (currentBowlState) {
      case BowlState.静碗:
        return '🥣';
      case BowlState.感应碗:
        return '🥣✨';
      case BowlState.唤醒碗:
        return '🥣🌟';
      case BowlState.控制碗:
        return '🥣⚙️';
      default:
        return '🥣';
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      padding: '20px',
      position: 'relative'
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
        🍚 智能交互碗 - {currentBowlState}
      </div>

      {/* 主碗显示 */}
      <div
        style={getBowlStyle()}
        onMouseEnter={handleHover}
        onMouseLeave={handleMouseLeave}
        onClick={handleLeftClick}
        onContextMenu={handleRightClick}
        title={`当前碗状态: ${currentBowlState}`}
      >
        {getBowlEmoji()}
      </div>

      {/* 悬浮提示文字 */}
      {showTooltip && (
        <div style={{
          position: 'absolute',
          top: '110px',
          padding: '8px 12px',
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          borderRadius: '8px',
          fontSize: '14px',
          animation: 'fadeIn 0.3s ease',
          pointerEvents: 'none'
        }}>
          点击唤醒神宠！
        </div>
      )}

      {/* 唤醒状态的行为图标 */}
      {showActionIcons && (
        <div style={{
          position: 'absolute',
          top: '180px',
          display: 'flex',
          gap: '10px',
          animation: 'slideUp 0.5s ease'
        }}>
          <div style={{ fontSize: '24px', animation: 'bounce 1s infinite' }}>📸</div>
          <div style={{ fontSize: '24px', animation: 'bounce 1s infinite 0.2s' }}>📋</div>
          <div style={{ fontSize: '24px', animation: 'bounce 1s infinite 0.4s' }}>🎥</div>
        </div>
      )}

      {/* 控制菜单 */}
      {showControlMenu && (
        <div style={{
          position: 'absolute',
          top: '160px',
          left: '150px',
          padding: '15px',
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          animation: 'fadeIn 0.3s ease',
          minWidth: '150px'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#333' }}>🎛️ 控制菜单</div>
          <div style={{ margin: '5px 0', padding: '5px', cursor: 'pointer', borderRadius: '4px' }}>🎨 换肤</div>
          <div style={{ margin: '5px 0', padding: '5px', cursor: 'pointer', borderRadius: '4px' }}>💬 神宠聊天</div>
          <div style={{ margin: '5px 0', padding: '5px', cursor: 'pointer', borderRadius: '4px' }}>⚙️ 控制面板</div>
          <div style={{ margin: '5px 0', padding: '5px', cursor: 'pointer', borderRadius: '4px' }}>📊 数据统计</div>
        </div>
      )}

      {/* 当前状态信息显示 */}
      <div style={{
        marginTop: '20px',
        padding: '10px 20px',
        background: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        borderRadius: '15px',
        fontSize: '14px',
        textAlign: 'center'
      }}>
        <div>系统状态: <strong>{currentState}</strong></div>
        <div>当前情绪: <strong>{currentEmotion}</strong></div>
        <div>交互模式: <strong>{currentBowlState}</strong></div>
      </div>

      {/* 交互说明 */}
      <div style={{
        marginTop: '15px',
        padding: '10px',
        background: 'rgba(255, 255, 255, 0.8)',
        borderRadius: '10px',
        fontSize: '12px',
        color: '#666',
        textAlign: 'center'
      }}>
        💡 悬浮感应 | 左键唤醒 | 右键控制
      </div>
    </div>
  );
};

export default BowlUI;
