/**
 * T4-0: 神宠播放器 UI 动画组件
 * 
 * 基于 FBX 模型的动画播放器组件，支持情绪驱动的播放控制
 * 通过 PetBrainBridge 与 PlayerPlugin 插件系统集成
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import './AnimatedPlayer.css';

// 动画按钮状态枚举
export enum ButtonState {
  Idle = 'idle',
  Hover = 'hover', 
  Active = 'active',
  Disabled = 'disabled'
}

// 播放器状态枚举
export enum PlayerUIState {
  Stopped = 'stopped',
  Playing = 'playing',
  Paused = 'paused',
  Loading = 'loading',
  Error = 'error'
}

// 动画帧配置接口
export interface AnimationFrame {
  id: string;
  state: ButtonState;
  frameIndex: number;
  duration: number;
  fbxPath?: string;
}

// 播放器按钮接口
export interface PlayerButton {
  id: string;
  type: 'play' | 'pause' | 'stop' | 'seek' | 'volume';
  states: Record<ButtonState, AnimationFrame>;
  onClick?: () => void;
  onHover?: () => void;
  onDoubleClick?: () => void;
  disabled?: boolean;
}

// 组件 Props 接口
export interface AnimatedPlayerProps {
  // 播放器状态
  playerState?: PlayerUIState;
  
  // 当前播放的视频信息
  currentVideo?: {
    id: string;
    title: string;
    duration: number;
    currentTime: number;
  };
  
  // 事件回调
  onPlayClick?: (videoId?: string) => void;
  onPauseClick?: () => void;
  onStopClick?: () => void;
  onSeekClick?: (position: number) => void;
  onVolumeChange?: (volume: number) => void;
  
  // 情绪驱动触发器（预留接口）
  emotionDrivenTrigger?: (emotion: string) => void;
  
  // 自定义样式
  className?: string;
  style?: React.CSSProperties;
  
  // 调试模式
  debug?: boolean;
}

/**
 * 神宠播放器动画组件
 */
export const AnimatedPlayer: React.FC<AnimatedPlayerProps> = ({
  playerState = PlayerUIState.Stopped,
  currentVideo,
  onPlayClick,
  onPauseClick,
  onStopClick,
  onSeekClick,
  onVolumeChange,
  emotionDrivenTrigger,
  className = '',
  style = {},
  debug = false
}) => {
  // 组件状态
  const [buttonStates, setButtonStates] = useState<Record<string, ButtonState>>({
    btn_play: ButtonState.Idle,
    btn_pause: ButtonState.Idle,
    btn_stop: ButtonState.Idle,
    btn_seek: ButtonState.Idle,
    btn_volume: ButtonState.Idle
  });
  
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [seekPosition, setSeekPosition] = useState(0);
  
  // 引用
  const animationFrameRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // 日志函数
  const log = useCallback((message: string, data?: any) => {
    if (debug) {
      console.log(`🎬 [AnimatedPlayer] ${message}`, data || '');
    }
  }, [debug]);

  // 动画按钮配置
  const playerButtons: Record<string, PlayerButton> = {
    btn_play: {
      id: 'btn_play_idle',
      type: 'play',
      states: {
        [ButtonState.Idle]: { id: 'play_idle', state: ButtonState.Idle, frameIndex: 0, duration: 1000 },
        [ButtonState.Hover]: { id: 'play_hover', state: ButtonState.Hover, frameIndex: 1, duration: 300 },
        [ButtonState.Active]: { id: 'play_active', state: ButtonState.Active, frameIndex: 2, duration: 200 },
        [ButtonState.Disabled]: { id: 'play_disabled', state: ButtonState.Disabled, frameIndex: 3, duration: 0 }
      },
      onClick: () => handlePlayClick(),
      onHover: () => handleButtonHover('btn_play'),
      disabled: playerState === PlayerUIState.Playing
    },
    
    btn_pause: {
      id: 'btn_pause_hover',
      type: 'pause',
      states: {
        [ButtonState.Idle]: { id: 'pause_idle', state: ButtonState.Idle, frameIndex: 0, duration: 1000 },
        [ButtonState.Hover]: { id: 'pause_hover', state: ButtonState.Hover, frameIndex: 1, duration: 300 },
        [ButtonState.Active]: { id: 'pause_active', state: ButtonState.Active, frameIndex: 2, duration: 200 },
        [ButtonState.Disabled]: { id: 'pause_disabled', state: ButtonState.Disabled, frameIndex: 3, duration: 0 }
      },
      onClick: () => handlePauseClick(),
      onHover: () => handleButtonHover('btn_pause'),
      disabled: playerState !== PlayerUIState.Playing
    },
    
    btn_stop: {
      id: 'btn_stop_idle',
      type: 'stop',
      states: {
        [ButtonState.Idle]: { id: 'stop_idle', state: ButtonState.Idle, frameIndex: 0, duration: 1000 },
        [ButtonState.Hover]: { id: 'stop_hover', state: ButtonState.Hover, frameIndex: 1, duration: 300 },
        [ButtonState.Active]: { id: 'stop_active', state: ButtonState.Active, frameIndex: 2, duration: 200 },
        [ButtonState.Disabled]: { id: 'stop_disabled', state: ButtonState.Disabled, frameIndex: 3, duration: 0 }
      },
      onClick: () => handleStopClick(),
      onHover: () => handleButtonHover('btn_stop'),
      disabled: playerState === PlayerUIState.Stopped
    },
    
    btn_seek: {
      id: 'btn_seek_active',
      type: 'seek',
      states: {
        [ButtonState.Idle]: { id: 'seek_idle', state: ButtonState.Idle, frameIndex: 0, duration: 1000 },
        [ButtonState.Hover]: { id: 'seek_hover', state: ButtonState.Hover, frameIndex: 1, duration: 300 },
        [ButtonState.Active]: { id: 'seek_active', state: ButtonState.Active, frameIndex: 2, duration: 200 },
        [ButtonState.Disabled]: { id: 'seek_disabled', state: ButtonState.Disabled, frameIndex: 3, duration: 0 }
      },
      onDoubleClick: () => handleSeekDoubleClick(),
      onHover: () => handleButtonHover('btn_seek'),
      disabled: !currentVideo
    }
  };

  // 按钮事件处理
  const handlePlayClick = useCallback(() => {
    log('播放按钮点击');
    setButtonStates(prev => ({ ...prev, btn_play: ButtonState.Active }));
    
    // 延时恢复按钮状态
    setTimeout(() => {
      setButtonStates(prev => ({ ...prev, btn_play: ButtonState.Idle }));
    }, 200);
    
    if (onPlayClick) {
      const videoId = currentVideo?.id || 'intro.mp4';
      log(`触发播放回调，视频ID: ${videoId}`);
      onPlayClick(videoId);
    }
  }, [onPlayClick, currentVideo, log]);

  const handlePauseClick = useCallback(() => {
    log('暂停按钮点击');
    setButtonStates(prev => ({ ...prev, btn_pause: ButtonState.Active }));
    
    setTimeout(() => {
      setButtonStates(prev => ({ ...prev, btn_pause: ButtonState.Idle }));
    }, 200);
    
    if (onPauseClick) {
      log('触发暂停回调');
      onPauseClick();
    }
  }, [onPauseClick, log]);

  const handleStopClick = useCallback(() => {
    log('停止按钮点击');
    setButtonStates(prev => ({ ...prev, btn_stop: ButtonState.Active }));
    
    setTimeout(() => {
      setButtonStates(prev => ({ ...prev, btn_stop: ButtonState.Idle }));
    }, 200);
    
    if (onStopClick) {
      log('触发停止回调');
      onStopClick();
    }
  }, [onStopClick, log]);

  const handleSeekDoubleClick = useCallback(() => {
    if (!currentVideo) return;
    
    log('跳转按钮双击');
    setButtonStates(prev => ({ ...prev, btn_seek: ButtonState.Active }));
    
    // 计算跳转位置（示例：跳转到中间）
    const position = Math.floor(currentVideo.duration / 2);
    setSeekPosition(position);
    
    setTimeout(() => {
      setButtonStates(prev => ({ ...prev, btn_seek: ButtonState.Idle }));
    }, 200);
    
    if (onSeekClick) {
      log(`触发跳转回调，位置: ${position}s`);
      onSeekClick(position);
    }
  }, [onSeekClick, currentVideo, log]);

  const handleButtonHover = useCallback((buttonId: string) => {
    log(`按钮悬浮: ${buttonId}`);
    setButtonStates(prev => ({
      ...prev,
      [buttonId]: ButtonState.Hover
    }));
    
    // 延时恢复状态
    setTimeout(() => {
      setButtonStates(prev => ({
        ...prev,
        [buttonId]: ButtonState.Idle
      }));
    }, 1000);
  }, [log]);

  // 音量控制
  const handleVolumeChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(event.target.value);
    setVolume(newVolume);
    log(`音量调节: ${Math.round(newVolume * 100)}%`);
    
    if (onVolumeChange) {
      onVolumeChange(newVolume);
    }
  }, [onVolumeChange, log]);

  // 模拟 FBX 动画帧绘制
  const drawAnimationFrame = useCallback((buttonId: string, frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制按钮背景
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 根据按钮状态绘制不同颜色
    const button = playerButtons[buttonId];
    const currentState = buttonStates[buttonId];
    
    let color = '#666666'; // idle
    if (currentState === ButtonState.Hover) color = '#4CAF50';
    if (currentState === ButtonState.Active) color = '#2196F3';
    if (button?.disabled) color = '#cccccc';
    
    // 绘制按钮形状（简化版本，实际应该加载 FBX 模型）
    ctx.fillStyle = color;
    ctx.beginPath();
    
    if (buttonId === 'btn_play') {
      // 播放三角形
      ctx.moveTo(20, 15);
      ctx.lineTo(45, 30);
      ctx.lineTo(20, 45);
      ctx.closePath();
    } else if (buttonId === 'btn_pause') {
      // 暂停矩形
      ctx.rect(20, 15, 8, 30);
      ctx.rect(35, 15, 8, 30);
    } else if (buttonId === 'btn_stop') {
      // 停止方块
      ctx.rect(20, 20, 25, 20);
    } else if (buttonId === 'btn_seek') {
      // 跳转箭头
      ctx.moveTo(15, 25);
      ctx.lineTo(35, 15);
      ctx.lineTo(35, 20);
      ctx.lineTo(50, 20);
      ctx.lineTo(50, 30);
      ctx.lineTo(35, 30);
      ctx.lineTo(35, 35);
      ctx.closePath();
    }
    
    ctx.fill();
    
    // 绘制帧信息（调试模式）
    if (debug) {
      ctx.fillStyle = '#000';
      ctx.font = '10px Arial';
      ctx.fillText(`${buttonId}-f${frameIndex}`, 5, 55);
      ctx.fillText(`${currentState}`, 5, 67);
    }
  }, [buttonStates, playerButtons, debug]);

  // 动画循环
  const animateButtons = useCallback(() => {
    if (!isAnimating) return;
    
    // 更新动画帧
    setCurrentFrame(prev => prev + 1);
    
    // 绘制所有按钮的当前帧
    Object.keys(playerButtons).forEach(buttonId => {
      const state = buttonStates[buttonId];
      const button = playerButtons[buttonId];
      const frameConfig = button.states[state];
      drawAnimationFrame(buttonId, frameConfig.frameIndex);
    });
    
    // 请求下一帧
    animationFrameRef.current = requestAnimationFrame(animateButtons);
  }, [isAnimating, buttonStates, playerButtons, drawAnimationFrame]);

  // 启动/停止动画
  useEffect(() => {
    if (isAnimating) {
      animationFrameRef.current = requestAnimationFrame(animateButtons);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isAnimating, animateButtons]);

  // 组件挂载时启动动画
  useEffect(() => {
    setIsAnimating(true);
    log('动画播放器已挂载');
    
    return () => {
      setIsAnimating(false);
      log('动画播放器已卸载');
    };
  }, [log]);

  // 播放器状态变化时更新按钮状态
  useEffect(() => {
    log(`播放器状态变化: ${playerState}`);
    
    // 根据播放器状态更新按钮可用性
    const newStates = { ...buttonStates };
    
    Object.keys(playerButtons).forEach(buttonId => {
      const button = playerButtons[buttonId];
      if (button.disabled) {
        newStates[buttonId] = ButtonState.Disabled;
      } else {
        newStates[buttonId] = ButtonState.Idle;
      }
    });
    
    setButtonStates(newStates);
  }, [playerState, log]);

  // 进度条计算
  const progressPercentage = currentVideo 
    ? (currentVideo.currentTime / currentVideo.duration) * 100 
    : 0;

  return (
    <div 
      className={`animated-player ${className}`}
      style={style}
      data-player-state={playerState}
    >
      {/* 播放器标题 */}
      <div className="player-header">
        <h3 className="player-title">🎬 神宠播放器</h3>
        {currentVideo && (
          <span className="video-title">{currentVideo.title}</span>
        )}
      </div>

      {/* 动画画布 */}
      <div className="animation-canvas-container">
        <canvas
          ref={canvasRef}
          width={300}
          height={80}
          className="animation-canvas"
        />
      </div>

      {/* 控制按钮组 */}
      <div className="control-buttons">
        {Object.entries(playerButtons).map(([buttonId, button]) => (
          <button
            key={buttonId}
            className={`control-btn btn-${button.type} state-${buttonStates[buttonId]}`}
            onClick={button.onClick}
            onMouseEnter={button.onHover}
            onDoubleClick={button.onDoubleClick}
            disabled={button.disabled}
            data-button-id={buttonId}
          >
            <span className="btn-label">
              {button.type === 'play' && '▶'}
              {button.type === 'pause' && '⏸'}
              {button.type === 'stop' && '⏹'}
              {button.type === 'seek' && '⏭'}
            </span>
          </button>
        ))}
      </div>

      {/* 进度条 */}
      {currentVideo && (
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <span className="time-display">
            {Math.floor(currentVideo.currentTime)}s / {Math.floor(currentVideo.duration)}s
          </span>
        </div>
      )}

      {/* 音量控制 */}
      <div className="volume-control">
        <label htmlFor="volume">🔊</label>
        <input
          id="volume"
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={handleVolumeChange}
          className="volume-slider"
        />
        <span className="volume-display">{Math.round(volume * 100)}%</span>
      </div>

      {/* 状态指示器 */}
      <div className="status-indicator">
        <span className={`status-dot status-${playerState}`} />
        <span className="status-text">{playerState.toUpperCase()}</span>
      </div>

      {/* 调试信息 */}
      {debug && (
        <div className="debug-panel">
          <h4>调试信息</h4>
          <div>播放器状态: {playerState}</div>
          <div>当前帧: {currentFrame}</div>
          <div>按钮状态: {JSON.stringify(buttonStates, null, 2)}</div>
          {currentVideo && (
            <div>当前视频: {currentVideo.id} ({progressPercentage.toFixed(1)}%)</div>
          )}
        </div>
      )}
    </div>
  );
};

export default AnimatedPlayer;
