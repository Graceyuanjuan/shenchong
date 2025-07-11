/**
 * T4-0: 神宠播放器 UI 动画组件 (纯 TypeScript 版本)
 * 
 * 不依赖 React，使用原生 DOM API 实现
 * 支持 FBX 模型动画和情绪驱动的播放控制
 */

// 重新导出类型定义
export enum ButtonState {
  Idle = 'idle',
  Hover = 'hover', 
  Active = 'active',
  Disabled = 'disabled'
}

export enum PlayerUIState {
  Stopped = 'stopped',
  Playing = 'playing',
  Paused = 'paused',
  Loading = 'loading',
  Error = 'error'
}

export interface AnimationFrame {
  id: string;
  state: ButtonState;
  frameIndex: number;
  duration: number;
  fbxPath?: string;
}

export interface PlayerButton {
  id: string;
  type: 'play' | 'pause' | 'stop' | 'seek' | 'volume';
  states: Record<ButtonState, AnimationFrame>;
  onClick?: () => void;
  onHover?: () => void;
  onDoubleClick?: () => void;
  disabled?: boolean;
}

export interface AnimatedPlayerConfig {
  containerSelector: string;
  playerState?: PlayerUIState;
  currentVideo?: {
    id: string;
    title: string;
    duration: number;
    currentTime: number;
  };
  onPlayClick?: (videoId?: string) => void;
  onPauseClick?: () => void;
  onStopClick?: () => void;
  onSeekClick?: (position: number) => void;
  onVolumeChange?: (volume: number) => void;
  emotionDrivenTrigger?: (emotion: string) => void;
  debug?: boolean;
}

/**
 * 神宠播放器动画组件 (纯 TypeScript 实现)
 */
export class AnimatedPlayerComponent {
  private container: HTMLElement;
  private config: AnimatedPlayerConfig;
  
  // DOM 元素
  private elements: {
    canvas?: HTMLCanvasElement;
    playBtn?: HTMLButtonElement;
    pauseBtn?: HTMLButtonElement;
    stopBtn?: HTMLButtonElement;
    seekBtn?: HTMLButtonElement;
    volumeSlider?: HTMLInputElement;
    progressBar?: HTMLElement;
    statusDot?: HTMLElement;
  } = {};
  
  // 状态
  private buttonStates: Record<string, ButtonState> = {};
  private isAnimating = false;
  private currentFrame = 0;
  private volume = 0.7;
  private animationFrameId?: number;
  
  constructor(config: AnimatedPlayerConfig) {
    this.config = { playerState: PlayerUIState.Stopped, debug: false, ...config };
    
    const container = document.querySelector(config.containerSelector) as HTMLElement;
    if (!container) {
      throw new Error(`容器元素未找到: ${config.containerSelector}`);
    }
    
    this.container = container;
    this.initialize();
  }

  /**
   * 初始化组件
   */
  private initialize(): void {
    this.log('AnimatedPlayer 组件初始化');
    
    // 创建 DOM 结构
    this.createDOM();
    
    // 绑定事件
    this.bindEvents();
    
    // 初始化按钮状态
    this.initializeButtonStates();
    
    // 启动动画循环
    this.startAnimation();
    
    this.log('AnimatedPlayer 组件初始化完成');
  }

  /**
   * 创建 DOM 结构
   */
  private createDOM(): void {
    this.container.innerHTML = `
      <div class="animated-player" data-player-state="${this.config.playerState}">
        <!-- 播放器标题 -->
        <div class="player-header">
          <h3 class="player-title">🎬 神宠播放器</h3>
          <span class="video-title">${this.config.currentVideo?.title || ''}</span>
        </div>

        <!-- 动画画布 -->
        <div class="animation-canvas-container">
          <canvas class="animation-canvas" width="300" height="80"></canvas>
        </div>

        <!-- 控制按钮组 -->
        <div class="control-buttons">
          <button class="control-btn btn-play" data-button-id="btn_play" title="播放">
            <span class="btn-label">▶</span>
          </button>
          <button class="control-btn btn-pause" data-button-id="btn_pause" title="暂停">
            <span class="btn-label">⏸</span>
          </button>
          <button class="control-btn btn-stop" data-button-id="btn_stop" title="停止">
            <span class="btn-label">⏹</span>
          </button>
          <button class="control-btn btn-seek" data-button-id="btn_seek" title="双击跳转">
            <span class="btn-label">⏭</span>
          </button>
        </div>

        <!-- 进度条 -->
        <div class="progress-container" style="display: ${this.config.currentVideo ? 'block' : 'none'}">
          <div class="progress-bar">
            <div class="progress-fill" style="width: 0%"></div>
          </div>
          <span class="time-display">0s / 0s</span>
        </div>

        <!-- 音量控制 -->
        <div class="volume-control">
          <label>🔊</label>
          <input type="range" class="volume-slider" min="0" max="1" step="0.1" value="${this.volume}">
          <span class="volume-display">${Math.round(this.volume * 100)}%</span>
        </div>

        <!-- 状态指示器 -->
        <div class="status-indicator">
          <span class="status-dot status-${this.config.playerState}"></span>
          <span class="status-text">${this.config.playerState?.toUpperCase()}</span>
        </div>

        <!-- 调试信息 -->
        <div class="debug-panel" style="display: ${this.config.debug ? 'block' : 'none'}">
          <h4>调试信息</h4>
          <div class="debug-info">
            <div>播放器状态: <span class="debug-player-state">${this.config.playerState}</span></div>
            <div>当前帧: <span class="debug-current-frame">0</span></div>
            <div>按钮状态: <span class="debug-button-states">{}</span></div>
          </div>
        </div>
      </div>
    `;

    // 获取关键元素引用
    this.elements.canvas = this.container.querySelector('.animation-canvas') as HTMLCanvasElement;
    this.elements.playBtn = this.container.querySelector('[data-button-id="btn_play"]') as HTMLButtonElement;
    this.elements.pauseBtn = this.container.querySelector('[data-button-id="btn_pause"]') as HTMLButtonElement;
    this.elements.stopBtn = this.container.querySelector('[data-button-id="btn_stop"]') as HTMLButtonElement;
    this.elements.seekBtn = this.container.querySelector('[data-button-id="btn_seek"]') as HTMLButtonElement;
    this.elements.volumeSlider = this.container.querySelector('.volume-slider') as HTMLInputElement;
    this.elements.progressBar = this.container.querySelector('.progress-fill') as HTMLElement;
    this.elements.statusDot = this.container.querySelector('.status-dot') as HTMLElement;
    
    this.log('DOM 结构创建完成');
  }

  /**
   * 绑定事件
   */
  private bindEvents(): void {
    // 播放按钮
    this.elements.playBtn?.addEventListener('click', () => {
      this.handleButtonClick('btn_play', 'play');
    });
    
    this.elements.playBtn?.addEventListener('mouseenter', () => {
      this.handleButtonHover('btn_play');
    });

    // 暂停按钮
    this.elements.pauseBtn?.addEventListener('click', () => {
      this.handleButtonClick('btn_pause', 'pause');
    });
    
    this.elements.pauseBtn?.addEventListener('mouseenter', () => {
      this.handleButtonHover('btn_pause');
    });

    // 停止按钮
    this.elements.stopBtn?.addEventListener('click', () => {
      this.handleButtonClick('btn_stop', 'stop');
    });
    
    this.elements.stopBtn?.addEventListener('mouseenter', () => {
      this.handleButtonHover('btn_stop');
    });

    // 跳转按钮（双击）
    this.elements.seekBtn?.addEventListener('dblclick', () => {
      this.handleSeekDoubleClick();
    });
    
    this.elements.seekBtn?.addEventListener('mouseenter', () => {
      this.handleButtonHover('btn_seek');
    });

    // 音量滑块
    this.elements.volumeSlider?.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      this.handleVolumeChange(parseFloat(target.value));
    });

    this.log('事件绑定完成');
  }

  /**
   * 初始化按钮状态
   */
  private initializeButtonStates(): void {
    this.buttonStates = {
      btn_play: ButtonState.Idle,
      btn_pause: ButtonState.Idle,
      btn_stop: ButtonState.Idle,
      btn_seek: ButtonState.Idle
    };
    
    this.updateButtonStates();
  }

  /**
   * 按钮点击处理
   */
  private handleButtonClick(buttonId: string, action: string): void {
    this.log(`按钮点击: ${buttonId} (${action})`);
    
    // 设置按钮为激活状态
    this.buttonStates[buttonId] = ButtonState.Active;
    this.updateButtonStates();
    
    // 延时恢复状态
    setTimeout(() => {
      this.buttonStates[buttonId] = ButtonState.Idle;
      this.updateButtonStates();
    }, 200);
    
    // 调用对应的回调
    switch (action) {
      case 'play':
        if (this.config.onPlayClick) {
          const videoId = this.config.currentVideo?.id || 'intro.mp4';
          this.log(`触发播放回调，视频ID: ${videoId}`);
          this.config.onPlayClick(videoId);
        }
        break;
        
      case 'pause':
        if (this.config.onPauseClick) {
          this.log('触发暂停回调');
          this.config.onPauseClick();
        }
        break;
        
      case 'stop':
        if (this.config.onStopClick) {
          this.log('触发停止回调');
          this.config.onStopClick();
        }
        break;
    }
  }

  /**
   * 按钮悬浮处理
   */
  private handleButtonHover(buttonId: string): void {
    this.log(`按钮悬浮: ${buttonId}`);
    
    this.buttonStates[buttonId] = ButtonState.Hover;
    this.updateButtonStates();
    
    // 延时恢复状态
    setTimeout(() => {
      if (this.buttonStates[buttonId] === ButtonState.Hover) {
        this.buttonStates[buttonId] = ButtonState.Idle;
        this.updateButtonStates();
      }
    }, 1000);
  }

  /**
   * 跳转双击处理
   */
  private handleSeekDoubleClick(): void {
    if (!this.config.currentVideo) return;
    
    this.log('跳转按钮双击');
    
    // 计算跳转位置（示例：跳转到中间）
    const position = Math.floor(this.config.currentVideo.duration / 2);
    
    if (this.config.onSeekClick) {
      this.log(`触发跳转回调，位置: ${position}s`);
      this.config.onSeekClick(position);
    }
  }

  /**
   * 音量变化处理
   */
  private handleVolumeChange(volume: number): void {
    this.volume = volume;
    this.log(`音量调节: ${Math.round(volume * 100)}%`);
    
    // 更新显示
    const volumeDisplay = this.container.querySelector('.volume-display');
    if (volumeDisplay) {
      volumeDisplay.textContent = `${Math.round(volume * 100)}%`;
    }
    
    if (this.config.onVolumeChange) {
      this.config.onVolumeChange(volume);
    }
  }

  /**
   * 更新按钮状态样式
   */
  private updateButtonStates(): void {
    Object.keys(this.buttonStates).forEach(buttonId => {
      const button = this.container.querySelector(`[data-button-id="${buttonId}"]`) as HTMLElement;
      if (button) {
        // 移除所有状态类
        button.classList.remove('state-idle', 'state-hover', 'state-active', 'state-disabled');
        
        // 添加当前状态类
        button.classList.add(`state-${this.buttonStates[buttonId]}`);
      }
    });
    
    // 更新调试信息
    if (this.config.debug) {
      const debugButtonStates = this.container.querySelector('.debug-button-states');
      if (debugButtonStates) {
        debugButtonStates.textContent = JSON.stringify(this.buttonStates);
      }
    }
  }

  /**
   * 绘制动画帧
   */
  private drawAnimationFrame(): void {
    const canvas = this.elements.canvas;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制背景
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制播放器状态可视化
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // 根据播放器状态绘制不同效果
    switch (this.config.playerState) {
      case PlayerUIState.Playing:
        this.drawPlayingAnimation(ctx, centerX, centerY);
        break;
        
      case PlayerUIState.Paused:
        this.drawPausedAnimation(ctx, centerX, centerY);
        break;
        
      case PlayerUIState.Loading:
        this.drawLoadingAnimation(ctx, centerX, centerY);
        break;
        
      case PlayerUIState.Error:
        this.drawErrorAnimation(ctx, centerX, centerY);
        break;
        
      default:
        this.drawStoppedAnimation(ctx, centerX, centerY);
    }
    
    // 绘制调试信息
    if (this.config.debug) {
      ctx.fillStyle = '#000';
      ctx.font = '10px Arial';
      ctx.fillText(`帧: ${this.currentFrame}`, 5, 15);
      ctx.fillText(`状态: ${this.config.playerState}`, 5, 25);
    }
  }

  /**
   * 绘制播放动画
   */
  private drawPlayingAnimation(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.fillStyle = '#4CAF50';
    
    // 绘制跳动的音频波形
    for (let i = 0; i < 8; i++) {
      const barX = x - 80 + (i * 20);
      const barHeight = 20 + Math.sin((this.currentFrame * 0.1) + i) * 15;
      
      ctx.fillRect(barX, y - barHeight / 2, 15, barHeight);
    }
  }

  /**
   * 绘制暂停动画
   */
  private drawPausedAnimation(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.fillStyle = '#FF9800';
    
    // 绘制暂停图标
    ctx.fillRect(x - 20, y - 15, 8, 30);
    ctx.fillRect(x + 12, y - 15, 8, 30);
  }

  /**
   * 绘制加载动画
   */
  private drawLoadingAnimation(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.strokeStyle = '#2196F3';
    ctx.lineWidth = 3;
    
    // 绘制旋转圆圈
    ctx.beginPath();
    const angle = (this.currentFrame * 0.1) % (Math.PI * 2);
    ctx.arc(x, y, 20, angle, angle + Math.PI * 1.5);
    ctx.stroke();
  }

  /**
   * 绘制错误动画
   */
  private drawErrorAnimation(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.fillStyle = '#f44336';
    
    // 绘制错误 X
    ctx.fillRect(x - 15, y - 2, 30, 4);
    ctx.fillRect(x - 2, y - 15, 4, 30);
    
    // 旋转效果
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(-15, -2, 30, 4);
    ctx.fillRect(-2, -15, 4, 30);
    ctx.restore();
  }

  /**
   * 绘制停止动画
   */
  private drawStoppedAnimation(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.fillStyle = '#666666';
    
    // 绘制停止方块
    ctx.fillRect(x - 15, y - 15, 30, 30);
  }

  /**
   * 动画循环
   */
  private animate(): void {
    if (!this.isAnimating) return;
    
    this.currentFrame++;
    
    // 绘制动画帧
    this.drawAnimationFrame();
    
    // 更新调试信息
    if (this.config.debug) {
      const debugFrame = this.container.querySelector('.debug-current-frame');
      if (debugFrame) {
        debugFrame.textContent = this.currentFrame.toString();
      }
    }
    
    // 请求下一帧
    this.animationFrameId = requestAnimationFrame(() => this.animate());
  }

  /**
   * 启动动画
   */
  private startAnimation(): void {
    this.isAnimating = true;
    this.animate();
    this.log('动画已启动');
  }

  /**
   * 停止动画
   */
  private stopAnimation(): void {
    this.isAnimating = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.log('动画已停止');
  }

  /**
   * 更新播放器状态
   */
  updatePlayerState(state: PlayerUIState): void {
    this.config.playerState = state;
    
    // 更新 DOM 属性
    const playerElement = this.container.querySelector('.animated-player');
    if (playerElement) {
      playerElement.setAttribute('data-player-state', state);
    }
    
    // 更新状态指示器
    if (this.elements.statusDot) {
      this.elements.statusDot.className = `status-dot status-${state}`;
    }
    
    const statusText = this.container.querySelector('.status-text');
    if (statusText) {
      statusText.textContent = state.toUpperCase();
    }
    
    // 更新调试信息
    if (this.config.debug) {
      const debugPlayerState = this.container.querySelector('.debug-player-state');
      if (debugPlayerState) {
        debugPlayerState.textContent = state;
      }
    }
    
    this.log(`播放器状态更新: ${state}`);
  }

  /**
   * 更新当前视频信息
   */
  updateCurrentVideo(video?: { id: string; title: string; duration: number; currentTime: number }): void {
    this.config.currentVideo = video;
    
    // 更新视频标题
    const videoTitle = this.container.querySelector('.video-title');
    if (videoTitle) {
      videoTitle.textContent = video?.title || '';
    }
    
    // 更新进度条容器可见性
    const progressContainer = this.container.querySelector('.progress-container') as HTMLElement;
    if (progressContainer) {
      progressContainer.style.display = video ? 'block' : 'none';
    }
    
    // 更新时间显示
    if (video) {
      this.updateProgress(video.currentTime, video.duration);
    }
    
    this.log('当前视频更新', video);
  }

  /**
   * 更新播放进度
   */
  updateProgress(currentTime: number, duration: number): void {
    const percentage = (currentTime / duration) * 100;
    
    // 更新进度条
    if (this.elements.progressBar) {
      this.elements.progressBar.style.width = `${percentage}%`;
    }
    
    // 更新时间显示
    const timeDisplay = this.container.querySelector('.time-display');
    if (timeDisplay) {
      timeDisplay.textContent = `${Math.floor(currentTime)}s / ${Math.floor(duration)}s`;
    }
  }

  /**
   * 日志输出
   */
  private log(message: string, data?: any): void {
    if (this.config.debug) {
      console.log(`🎬 [AnimatedPlayer] ${message}`, data || '');
    }
  }

  /**
   * 销毁组件
   */
  destroy(): void {
    this.stopAnimation();
    this.container.innerHTML = '';
    this.log('AnimatedPlayer 组件已销毁');
  }
}

export default AnimatedPlayerComponent;
