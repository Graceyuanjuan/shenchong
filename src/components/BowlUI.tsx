import React, { useState, useCallback, useEffect } from 'react';
import { PetState, EmotionType } from '../types';

interface BowlUIProps {
  onBowlStateChange: (state: PetState, emotion: EmotionType) => void;
  currentState: PetState;
  currentEmotion: EmotionType;
}

// 四种碗状态枚举 - 按任务卡规范
enum BowlState {
  Idle = "idle",        // ① 静碗 - 默认加载
  Hover = "hover",      // ② 感应碗 - 鼠标悬浮  
  Active = "active",    // ③ 唤醒碗 - 鼠标左键点击
  Control = "control"   // ④ 控制碗 - 鼠标右键点击
}

// 自定义Hook管理状态流转
const useBowlInteraction = (onBowlStateChange: (state: PetState, emotion: EmotionType) => void) => {
  const [bowlState, setBowlState] = useState<BowlState>(BowlState.Idle);
  const [showVoiceControls, setShowVoiceControls] = useState(false);
  const [showActionPopup, setShowActionPopup] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState(false);

  // 重置所有状态
  const resetAllStates = useCallback(() => {
    setBowlState(BowlState.Idle);
    setShowVoiceControls(false);
    setShowActionPopup(false);
    setShowContextMenu(false);
  }, []);

  // 状态二：感应碗 hover
  const handleHover = useCallback(() => {
    setBowlState(BowlState.Hover);
    setShowVoiceControls(true);
    setShowActionPopup(false);
    setShowContextMenu(false);
    console.log('[🍚 BOWL] 状态切换: hover');
    onBowlStateChange(PetState.Hover, EmotionType.Curious);
  }, [onBowlStateChange]);

  // 状态三：唤醒碗 active
  const handleClick = useCallback(() => {
    setBowlState(BowlState.Active);
    setShowActionPopup(true);
    setShowVoiceControls(false);
    setShowContextMenu(false);
    console.log('[🍚 BOWL] 状态切换: active');
    onBowlStateChange(PetState.Awaken, EmotionType.Excited);
  }, [onBowlStateChange]);

  // 状态四：控制碗 control
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setBowlState(BowlState.Control);
    setShowContextMenu(true);
    setShowVoiceControls(false);
    setShowActionPopup(false);
    console.log('[🍚 BOWL] 状态切换: control');
    onBowlStateChange(PetState.Control, EmotionType.Focused);
  }, [onBowlStateChange]);

  return {
    bowlState,
    showVoiceControls,
    showActionPopup,
    showContextMenu,
    playbackSpeed,
    setPlaybackSpeed,
    isPlaying,
    setIsPlaying,
    handleHover,
    handleClick,
    handleContextMenu,
    resetAllStates
  };
};

const BowlUI: React.FC<BowlUIProps> = ({ onBowlStateChange, currentState, currentEmotion }) => {
  const {
    bowlState,
    showVoiceControls,
    showActionPopup,
    showContextMenu,
    playbackSpeed,
    setPlaybackSpeed,
    isPlaying,
    setIsPlaying,
    handleHover,
    handleClick,
    handleContextMenu,
    resetAllStates
  } = useBowlInteraction(onBowlStateChange);

  // 自动隐藏定时器
  useEffect(() => {
    if (bowlState !== BowlState.Idle) {
      const timer = setTimeout(() => {
        resetAllStates();
      }, 10000); // 10秒后自动隐藏，给用户更多时间

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [bowlState, resetAllStates]);

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
      userSelect: 'none' as const,
      border: '3px solid',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
    };

    switch (bowlState) {
      case BowlState.Idle:
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #a8a8ff 0%, #d4a5ff 100%)',
          borderColor: '#a8a8ff',
          transform: 'scale(1)'
        };
      case BowlState.Hover:
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #82e0aa 0%, #a8e6cf 100%)',
          borderColor: '#82e0aa',
          transform: 'scale(1.05)',
          boxShadow: '0 6px 30px rgba(130, 224, 170, 0.4)'
        };
      case BowlState.Active:
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #ffd700 0%, #ffb347 100%)',
          borderColor: '#ffd700',
          transform: 'scale(1.1)',
          boxShadow: '0 8px 40px rgba(255, 215, 0, 0.5)'
        };
      case BowlState.Control:
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #ff8a80 0%, #ff5722 100%)',
          borderColor: '#ff8a80',
          transform: 'scale(1.08)',
          boxShadow: '0 6px 35px rgba(255, 138, 128, 0.4)'
        };
      default:
        return baseStyle;
    }
  };

  // 获取碗的表情
  const getBowlEmoji = () => {
    switch (bowlState) {
      case BowlState.Idle:
        return '😊';
      case BowlState.Hover:
        return '🤔';
      case BowlState.Active:
        return '🌟';
      case BowlState.Control:
        return '⚙️';
      default:
        return '😊';
    }
  };

  // 语音控制功能
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    console.log(`[🎵 AUDIO] ${isPlaying ? '暂停' : '播放'}`);
  };

  const skipForward = () => {
    console.log('[⏭️ AUDIO] 快进');
  };

  const skipBackward = () => {
    console.log('[⏮️ AUDIO] 快退');
  };

  // 快捷操作功能
  const handleScreenshot = () => {
    console.log('[📸 ACTION] 截图');
  };

  const handleCopy = () => {
    console.log('[📋 ACTION] 复制');
  };

  const handleNote = () => {
    console.log('[📝 ACTION] 记要');
  };

  const handleCast = () => {
    console.log('[📺 ACTION] 投屏');
  };

  // 控制菜单功能
  const handleChangeSkin = () => {
    console.log('[🎨 MENU] 换肤');
  };

  const handleAIChat = () => {
    console.log('[🤖 MENU] AI对话');
  };

  const handleControlPanel = () => {
    console.log('[🎛️ MENU] 控制面板');
  };

  const handleWebsite = () => {
    console.log('[🌐 MENU] 网页跳转');
  };

  return (
    <div style={{
      // 根据运行环境调整定位
      position: window.electronAPI ? 'fixed' : 'absolute',
      bottom: window.electronAPI ? '24px' : '50%',
      right: window.electronAPI ? '24px' : '50%',
      top: window.electronAPI ? 'auto' : '50%',
      left: window.electronAPI ? 'auto' : '50%',
      transform: window.electronAPI ? 'none' : 'translate(-50%, -50%)',
      width: '180px',
      height: '180px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      {/* 状态指示器 - 右上角蓝点 */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        background: bowlState === BowlState.Idle ? '#4a90e2' : '#ff4444',
        zIndex: 1001
      }} />

      {/* 主碗体 */}
      <div
        style={getBowlStyle()}
        onMouseEnter={handleHover}
        onMouseLeave={() => {
          // 只在hover状态时重置，避免干扰其他状态
          if (bowlState === BowlState.Hover) {
            setTimeout(() => {
              resetAllStates();
            }, 100);
          }
        }}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        title={`当前状态: ${bowlState}`}
      >
        {getBowlEmoji()}
      </div>

      {/* 状态二：感应碗 hover — 语音控制浮窗 */}
      {showVoiceControls && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: '12px',
          display: 'flex',
          gap: '8px',
          padding: '12px',
          background: 'rgba(0, 0, 0, 0.8)',
          borderRadius: '12px',
          zIndex: 1002,
          backdropFilter: 'blur(10px)'
        }}>
          <button
            onClick={skipBackward}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: 'none',
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              fontSize: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="快退"
          >
            ⏮️
          </button>
          <button
            onClick={togglePlay}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: 'none',
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              fontSize: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title={isPlaying ? '暂停' : '播放'}
          >
            {isPlaying ? '⏸️' : '▶️'}
          </button>
          <button
            onClick={skipForward}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: 'none',
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              fontSize: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="快进"
          >
            ⏭️
          </button>
          <select
            value={playbackSpeed}
            onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '4px',
              fontSize: '12px'
            }}
          >
            <option value={0.5}>0.5x</option>
            <option value={1}>1.0x</option>
            <option value={1.5}>1.5x</option>
            <option value={2}>2.0x</option>
          </select>
        </div>
      )}

      {/* 状态三：唤醒碗 active — 快捷操作浮窗 */}
      {showActionPopup && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: '12px',
          display: 'flex',
          gap: '8px',
          padding: '12px',
          background: 'rgba(255, 215, 0, 0.9)',
          borderRadius: '12px',
          zIndex: 1002,
          backdropFilter: 'blur(10px)'
        }}>
          <button
            onClick={handleScreenshot}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: 'none',
              background: 'rgba(255, 255, 255, 0.8)',
              fontSize: '18px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="截图"
          >
            📸
          </button>
          <button
            onClick={handleCopy}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: 'none',
              background: 'rgba(255, 255, 255, 0.8)',
              fontSize: '18px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="复制"
          >
            📋
          </button>
          <button
            onClick={handleNote}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: 'none',
              background: 'rgba(255, 255, 255, 0.8)',
              fontSize: '18px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="记要"
          >
            📝
          </button>
          <button
            onClick={handleCast}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: 'none',
              background: 'rgba(255, 255, 255, 0.8)',
              fontSize: '18px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="投屏"
          >
            📺
          </button>
        </div>
      )}

      {/* 状态四：控制碗 control — 系统菜单浮窗 */}
      {showContextMenu && (
        <div style={{
          position: 'fixed',
          bottom: '220px',
          right: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          padding: '12px',
          background: 'rgba(255, 87, 34, 0.9)',
          borderRadius: '12px',
          zIndex: 1002,
          backdropFilter: 'blur(10px)',
          minWidth: '120px'
        }}>
          <button
            onClick={handleChangeSkin}
            style={{
              padding: '8px 12px',
              border: 'none',
              background: 'rgba(255, 255, 255, 0.8)',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🎨 换肤
          </button>
          <button
            onClick={handleAIChat}
            style={{
              padding: '8px 12px',
              border: 'none',
              background: 'rgba(255, 255, 255, 0.8)',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🤖 AI对话
          </button>
          <button
            onClick={handleControlPanel}
            style={{
              padding: '8px 12px',
              border: 'none',
              background: 'rgba(255, 255, 255, 0.8)',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🎛️ 控制面板
          </button>
          <button
            onClick={handleWebsite}
            style={{
              padding: '8px 12px',
              border: 'none',
              background: 'rgba(255, 255, 255, 0.8)',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🌐 网页跳转
          </button>
        </div>
      )}
    </div>
  );
};

export default BowlUI;
