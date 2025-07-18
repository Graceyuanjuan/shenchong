import React, { useState, useEffect, useRef } from 'react';
import { petStatsManager } from '../utils/PetStatsManager';

// 碗状态枚举
enum BowlState {
  Idle = 'idle',
  Hover = 'hover', 
  Active = 'active',
  Menu = 'menu'
}

// 检测运行环境
const isElectron = () => {
  return typeof window !== 'undefined' && window.navigator.userAgent.includes('Electron');
};

// 圆形桌宠UI组件 - 优化版
const CircularBowlUI: React.FC = () => {
  const [bowlState, setBowlState] = useState<BowlState>(BowlState.Idle);
  const [showControls, setShowControls] = useState(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const isDesktop = isElectron();

  // 清除定时器
  const clearHideTimeout = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  };

  // 鼠标悬浮主碗
  const handleMouseEnter = () => {
    clearHideTimeout();
    setBowlState(BowlState.Hover);
    setShowControls(true);
    petStatsManager.updateState('感应碗', '好奇');
    petStatsManager.recordInteraction('hover');
  };

  // 鼠标离开主碗
  const handleMouseLeave = () => {
    hideTimeoutRef.current = setTimeout(() => {
      setBowlState(BowlState.Idle);
      setShowControls(false);
      petStatsManager.updateState('静碗', '平静');
    }, 300);
  };

  // 鼠标进入功能键区域
  const handleControlsMouseEnter = () => {
    clearHideTimeout();
  };

  // 鼠标离开功能键区域
  const handleControlsMouseLeave = () => {
    handleMouseLeave();
  };

  // 左键点击
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    clearHideTimeout();
    setBowlState(BowlState.Active);
    setShowControls(true);
    petStatsManager.updateState('唤醒碗', '愉快');
    petStatsManager.recordInteraction('click');
  };

  // 右键点击
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    clearHideTimeout();
    setBowlState(BowlState.Menu);
    setShowControls(true);
    petStatsManager.updateState('控制碗', '专注');
    petStatsManager.recordInteraction('rightClick');
  };

  // 获取碗的表情符号
  const getBowlEmoji = () => {
    switch (bowlState) {
      case BowlState.Idle: return '😌';
      case BowlState.Hover: return '😊';
      case BowlState.Active: return '😃';
      case BowlState.Menu: return '🤔';
      default: return '😌';
    }
  };

  // 获取碗的样式（豆包风格，更紧凑简洁）
  const getBowlStyle = () => {
    const baseSize = isDesktop ? 60 : 100; // 进一步缩小
    const baseStyle = {
      width: `${baseSize}px`,
      height: `${baseSize}px`,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: isDesktop ? '24px' : '36px', // 更小的emoji
      cursor: 'pointer',
      transition: 'all 0.25s ease',
      position: 'relative' as const,
      userSelect: 'none' as const,
      border: '1px solid rgba(255, 255, 255, 0.3)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      WebkitAppRegion: 'no-drag' as const,
    };

    switch (bowlState) {
      case BowlState.Idle:
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
        };
      case BowlState.Hover:
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          boxShadow: '0 4px 12px rgba(240, 147, 251, 0.4)',
          transform: 'scale(1.05)',
        };
      case BowlState.Active:
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          boxShadow: '0 4px 12px rgba(79, 172, 254, 0.4)',
          transform: 'scale(1.08)',
        };
      case BowlState.Menu:
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
          boxShadow: '0 4px 12px rgba(168, 237, 234, 0.4)',
          transform: 'scale(1.05)',
        };
      default:
        return baseStyle;
    }
  };

  // 简洁的控制按钮（豆包风格）
  const getControlsForState = () => {
    const buttonSize = isDesktop ? '20px' : '28px';
    const buttonStyle = {
      width: buttonSize,
      height: buttonSize,
      borderRadius: '50%',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: isDesktop ? '10px' : '12px',
      background: 'rgba(0, 0, 0, 0.6)',
      color: 'white',
      transition: 'all 0.2s ease',
      WebkitAppRegion: 'no-drag' as const,
    };

    switch (bowlState) {
      case BowlState.Hover:
        return [
          { icon: '▶️', action: () => console.log('播放'), title: '播放', style: buttonStyle },
          { icon: '⏪', action: () => console.log('快退'), title: '快退', style: buttonStyle },
          { icon: '⏩', action: () => console.log('快进'), title: '快进', style: buttonStyle }
        ];
      case BowlState.Active:
        return [
          { icon: '⭐', action: () => console.log('收藏'), title: '收藏', style: buttonStyle },
          { icon: '📋', action: () => console.log('复制'), title: '复制', style: buttonStyle }
        ];
      case BowlState.Menu:
        return [
          { icon: '⚙️', action: () => console.log('设置'), title: '设置', style: buttonStyle },
          { icon: '❌', action: () => console.log('退出'), title: '退出', style: buttonStyle }
        ];
      default:
        return [];
    }
  };

  // 精简的按钮布局
  const renderControls = () => {
    const controls = getControlsForState();
    const radius = isDesktop ? 35 : 50; // 更紧凑的布局
    const containerSize = isDesktop ? 60 : 100;
    
    return controls.map((control, index) => {
      const angle = (index * (360 / controls.length)) * (Math.PI / 180) - Math.PI / 2;
      const x = containerSize/2 + radius * Math.cos(angle);
      const y = containerSize/2 + radius * Math.sin(angle);
      
      return (
        <button
          key={index}
          data-testid={`control-button-${index}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            control.action();
          }}
          onMouseEnter={handleControlsMouseEnter}
          onMouseLeave={handleControlsMouseLeave}
          style={{
            ...control.style,
            position: 'absolute',
            left: `${x - 10}px`,
            top: `${y - 10}px`,
            zIndex: 10,
          }}
          title={control.title}
        >
          {control.icon}
        </button>
      );
    });
  };

  // 组件清理
  useEffect(() => {
    return () => {
      clearHideTimeout();
    };
  }, []);

  // 渲染主组件
  const containerClass = isDesktop ? 'desktop-container' : 'web-container';
  const mainSize = isDesktop ? 60 : 100;
  
  return (
    <div className={containerClass}>
      <div 
        className="circular-pet-main"
        style={{
          width: `${mainSize + 30}px`,
          height: `${mainSize + 30}px`,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* 主碗 */}
        <div
          data-testid="main-bowl"
          style={getBowlStyle()}
          onClick={handleClick}
          onContextMenu={handleContextMenu}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <span data-testid="bowl-emoji">
            {getBowlEmoji()}
          </span>
        </div>

        {/* 功能按钮 */}
        {showControls && (
          <div
            data-testid="controls-container"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
            }}
          >
            <div style={{ pointerEvents: 'auto' }}>
              {renderControls()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CircularBowlUI;
