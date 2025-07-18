import React, { useState } from 'react';
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
  Menu = "menu"         // ④ 控制碗 - 鼠标右键点击
}

const BowlUI: React.FC<BowlUIProps> = ({ onBowlStateChange, currentState, currentEmotion }) => {
  const [bowlState, setBowlState] = useState<BowlState>(BowlState.Idle);
  const [showVoiceControls, setShowVoiceControls] = useState(false);
  const [showActionPopup, setShowActionPopup] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  // 使用延时器避免鼠标快速移动导致功能键消失
  const [hideTimer, setHideTimer] = useState<NodeJS.Timeout | null>(null);

  // ② 感应碗 hover — 语音控制组件
  const handleHover = () => {
    // 清除之前的隐藏定时器
    if (hideTimer) {
      clearTimeout(hideTimer);
      setHideTimer(null);
    }
    
    setBowlState(BowlState.Hover);
    setShowVoiceControls(true);
    setShowActionPopup(false);
    setShowContextMenu(false);
    console.log('[🍚 BOWL] 状态切换: hover');
    console.log('[🎙 VOICE] 用户打开语音控制');
    onBowlStateChange(PetState.Hover, EmotionType.Curious);
  };

  const handleMouseLeave = () => {
    // 使用延时器，给用户时间移动到功能键
    const timer = setTimeout(() => {
      setBowlState(BowlState.Idle);
      setShowVoiceControls(false);
      setShowActionPopup(false);
      setShowContextMenu(false);
      console.log('[🍚 BOWL] 状态切换: idle');
    }, 300); // 300ms延时
    
    setHideTimer(timer);
  };

  // 鼠标进入功能区域时，保持显示状态
  const handleFunctionAreaEnter = () => {
    if (hideTimer) {
      clearTimeout(hideTimer);
      setHideTimer(null);
    }
  };

  // 鼠标离开功能区域时，隐藏功能键
  const handleFunctionAreaLeave = () => {
    const timer = setTimeout(() => {
      setBowlState(BowlState.Idle);
      setShowVoiceControls(false);
      setShowActionPopup(false);
      setShowContextMenu(false);
      console.log('[🍚 BOWL] 状态切换: idle');
    }, 100);
    
    setHideTimer(timer);
  };

  // ③ 唤醒碗 click — 快捷操作浮窗
  const handleClick = () => {
    setBowlState(BowlState.Active);
    setShowActionPopup(true);
    setShowVoiceControls(false);
    setShowContextMenu(false);
    console.log('[🍚 BOWL] 状态切换: active');
    console.log('[✨ ACTION] 用户打开快捷操作');
    onBowlStateChange(PetState.Awaken, EmotionType.Excited);
  };

  // ④ 控制碗 menu — 系统设置菜单
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setBowlState(BowlState.Menu);
    setShowContextMenu(true);
    setShowVoiceControls(false);
    setShowActionPopup(false);
    console.log('[🍚 BOWL] 状态切换: menu');
    console.log('[🧭 MENU] 用户打开系统菜单');
    onBowlStateChange(PetState.Control, EmotionType.Focused);
  };

  // 语音控制功能
  const togglePlay = () => {
    console.log('[🎙 VOICE] 播放/暂停切换');
  };

  const rewind = () => {
    console.log('[🎙 VOICE] 快退 -5s');
  };

  const forward = () => {
    console.log('[🎙 VOICE] 快进 +5s');
  };

  const setSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    console.log(`[🎙 VOICE] 语速调节: ${speed}x`);
  };

  // 快捷操作功能
  const handleScreenshot = () => {
    console.log('[✨ ACTION] 执行截图操作');
  };

  const handleCopy = () => {
    console.log('[✨ ACTION] 执行复制操作');
  };

  const handleNote = () => {
    console.log('[✨ ACTION] 执行记要操作');
  };

  const handleCast = () => {
    console.log('[✨ ACTION] 执行投屏操作');
  };

  // 系统菜单功能
  const changeSkin = () => {
    console.log('[🧭 MENU] 换肤主题');
  };

  const openAIDialog = () => {
    console.log('[🧭 MENU] 打开AI对话');
  };

  const openURL = () => {
    console.log('[🧭 MENU] 打开网页');
  };

  const openPanel = () => {
    console.log('[🧭 MENU] 打开控制面板');
  };

  // 获取碗的样式（根据状态）
  const getBowlStyle = () => {
    const baseStyle = {
      width: '80px',
      height: '80px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '32px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      position: 'relative' as const,
      userSelect: 'none' as const
    };        switch (bowlState) {
      case BowlState.Idle:
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #95E1D3, #F38BA8)',
          boxShadow: '0 4px 20px rgba(149, 225, 211, 0.3)'
        };
      case BowlState.Hover:
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #A8E6CF, #FFD3A5)',
          boxShadow: '0 8px 40px rgba(168, 230, 207, 0.6)',
          transform: 'scale(1.05)'
        };
      case BowlState.Active:
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #FFD700, #FF6B6B)',
          boxShadow: '0 12px 50px rgba(255, 215, 0, 0.8)',
          transform: 'scale(1.2)'
        };
      case BowlState.Menu:
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
    switch (bowlState) {
      case BowlState.Idle:
        return '🥣';
      case BowlState.Hover:
        return '🥣✨';
      case BowlState.Active:
        return '🥣🌟';
      case BowlState.Menu:
        return '🥣⚙️';
      default:
        return '🥣';
    }
  };

  return (
    <div style={{ 
      width: '100vw',
      height: '100vh',
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      justifyContent: 'center',
      padding: '10px',
      position: 'relative',
      background: 'transparent'
    }}>
      {/* 主交互区域 - 豆包风格：紧凑布局，适合小窗口 */}
      <div
        style={{
          position: 'relative',
          width: '200px',
          height: '200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onMouseEnter={handleHover}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      >
        {/* 碗本体 */}
        <div
          style={getBowlStyle()}
          title={`当前碗状态: ${bowlState}`}
        >
          {getBowlEmoji()}
        </div>

        {/* ② 感应碗 hover — 语音控制浮窗 (豆包风格：直接悬浮，无白色弹框) */}
        {showVoiceControls && (
          <div 
            style={{
              position: 'absolute',
              top: '-50px',
              display: 'flex',
              gap: '6px',
              alignItems: 'center',
              animation: 'fadeIn 0.2s ease',
              zIndex: 10
            }}
            onMouseEnter={handleFunctionAreaEnter}
            onMouseLeave={handleFunctionAreaLeave}
          >
            <button 
              onClick={togglePlay}
              style={{ 
                width: '32px',
                height: '32px',
                borderRadius: '16px',
                border: 'none',
                cursor: 'pointer',
                background: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.9)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.8)';
              }}
            >
              ▶️
            </button>
            <button 
              onClick={rewind}
              style={{ 
                width: '32px',
                height: '32px',
                borderRadius: '16px',
                border: 'none',
                cursor: 'pointer',
                background: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.9)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.8)';
              }}
            >
              ⏪
            </button>
            <button 
              onClick={forward}
              style={{ 
                width: '32px',
                height: '32px',
                borderRadius: '16px',
                border: 'none',
                cursor: 'pointer',
                background: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.9)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.8)';
              }}
            >
              ⏩
            </button>
            <select 
              value={playbackSpeed} 
              onChange={(e) => setSpeed(Number(e.target.value))}
              style={{ 
                width: '40px',
                height: '32px',
                borderRadius: '16px',
                border: 'none',
                cursor: 'pointer',
                background: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
                fontSize: '10px',
                textAlign: 'center',
                transition: 'all 0.15s ease',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.9)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.8)';
              }}
            >
              <option value="1">1.0x</option>
              <option value="1.25">1.25x</option>
              <option value="1.5">1.5x</option>
            </select>
          </div>
        )}

        {/* ③ 唤醒碗 click — 快捷操作浮窗 (豆包风格：圆形按钮，视觉简洁) */}
        {showActionPopup && (
          <div 
            style={{
              position: 'absolute',
              top: '-50px',
              display: 'flex',
              gap: '6px',
              animation: 'slideUp 0.3s ease',
              zIndex: 10
            }}
            onMouseEnter={handleFunctionAreaEnter}
            onMouseLeave={handleFunctionAreaLeave}
          >
            <button 
              onClick={handleScreenshot}
              style={{ 
                width: '36px',
                height: '36px',
                borderRadius: '18px',
                border: 'none',
                cursor: 'pointer',
                background: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.15)';
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.9)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.8)';
              }}
              title="截图"
            >
              📸
            </button>
            <button 
              onClick={handleCopy}
              style={{ 
                width: '36px',
                height: '36px',
                borderRadius: '18px',
                border: 'none',
                cursor: 'pointer',
                background: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.15)';
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.9)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.8)';
              }}
              title="复制"
            >
              📋
            </button>
            <button 
              onClick={handleNote}
              style={{ 
                width: '36px',
                height: '36px',
                borderRadius: '18px',
                border: 'none',
                cursor: 'pointer',
                background: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.15)';
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.9)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.8)';
              }}
              title="记要"
            >
              📝
            </button>
            <button 
              onClick={handleCast}
              style={{ 
                width: '36px',
                height: '36px',
                borderRadius: '18px',
                border: 'none',
                cursor: 'pointer',
                background: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.15)';
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.9)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.8)';
              }}
              title="投屏"
            >
              📺
            </button>
          </div>
        )}

        {/* ④ 控制碗 menu — 系统菜单浮窗 (豆包风格：纵向排列，圆形按钮) */}
        {showContextMenu && (
          <div 
            style={{
              position: 'absolute',
              top: '-50px',
              right: '-40px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              animation: 'fadeIn 0.2s ease',
              zIndex: 10
            }}
            onMouseEnter={handleFunctionAreaEnter}
            onMouseLeave={handleFunctionAreaLeave}
          >
            <button 
              onClick={changeSkin}
              style={{ 
                width: '36px',
                height: '36px',
                borderRadius: '18px',
                border: 'none',
                cursor: 'pointer',
                background: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.15)';
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.9)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.8)';
              }}
              title="换肤主题"
            >
              🎨
            </button>
            <button 
              onClick={openAIDialog}
              style={{ 
                width: '36px',
                height: '36px',
                borderRadius: '18px',
                border: 'none',
                cursor: 'pointer',
                background: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.15)';
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.9)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.8)';
              }}
              title="AI对话"
            >
              🤖
            </button>
            <button 
              onClick={openURL}
              style={{ 
                width: '36px',
                height: '36px',
                borderRadius: '18px',
                border: 'none',
                cursor: 'pointer',
                background: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.15)';
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.9)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.8)';
              }}
              title="打开网页"
            >
              🌐
            </button>
            <button 
              onClick={openPanel}
              style={{ 
                width: '36px',
                height: '36px',
                borderRadius: '18px',
                border: 'none',
                cursor: 'pointer',
                background: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.15)';
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.9)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.8)';
              }}
              title="控制面板"
            >
              🧩
            </button>
          </div>
        )}
      </div>

      {/* 底部状态信息 - 紧凑显示 */}
      <div style={{
        position: 'absolute',
        bottom: '10px',
        right: '10px',
        padding: '4px 8px',
        background: 'rgba(0, 0, 0, 0.6)',
        color: 'white',
        borderRadius: '8px',
        fontSize: '10px',
        textAlign: 'right',
        pointerEvents: 'none'
      }}>
        <div>{bowlState} | {currentEmotion}</div>
      </div>
    </div>
  );
};

export default BowlUI;
