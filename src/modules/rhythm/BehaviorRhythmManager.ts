import { 
  RhythmMode, 
  RhythmIntensity, 
  RhythmConfig, 
  RhythmState, 
  RhythmTickCallback, 
  RhythmStateListener, 
  IRhythmManager
} from '../../types/BehaviorRhythm.d';

/**
 * 行为节奏管理器
 * 负责管理神宠的行为节拍和节奏模式
 */
export class BehaviorRhythmManager implements IRhythmManager {
  private state: RhythmState;
  private tickCallbacks: Set<RhythmTickCallback> = new Set();
  private stateListeners: Set<RhythmStateListener> = new Set();
  private timerId: NodeJS.Timeout | null = null;
  private lastTickTime: number = 0;
  
  // 默认配置
  private static readonly DEFAULT_CONFIGS: { [key: string]: RhythmConfig } = {
    'steady': {
      mode: 'steady',
      baseInterval: 1000,
      intensity: 'medium',
      variation: 0.1
    },
    'pulse': {
      mode: 'pulse',
      baseInterval: 400,
      intensity: 'medium',
      variation: 0.3
    },
    'sequence': {
      mode: 'sequence',
      baseInterval: 500,
      intensity: 'medium',
      variation: 0.2,
      sequence: [300, 600, 200, 800, 400]
    },
    'adaptive': {
      mode: 'adaptive',
      baseInterval: 600,
      intensity: 'medium',
      variation: 0.4
    },
    'sync': {
      mode: 'sync',
      baseInterval: 1000,
      intensity: 'medium',
      variation: 0.1
    }
  };

  constructor(initialMode: RhythmMode = 'steady') {
    this.state = {
      isActive: false,
      currentMode: initialMode,
      currentInterval: BehaviorRhythmManager.DEFAULT_CONFIGS[initialMode].baseInterval,
      lastTickTime: 0,
      tickCount: 0,
      config: { ...BehaviorRhythmManager.DEFAULT_CONFIGS[initialMode] }
    };
    
    console.log(`[RhythmManager] 初始化完成，默认模式: ${initialMode}`);
  }

  // 核心方法实现
  setRhythmMode(mode: RhythmMode, configOverride?: Partial<RhythmConfig>): void {
    console.log(`[RhythmManager] 切换节奏模式: ${this.state.currentMode} → ${mode}`);
    
    const baseConfig = BehaviorRhythmManager.DEFAULT_CONFIGS[mode];
    const newConfig: RhythmConfig = {
      ...baseConfig,
      ...configOverride
    };

    const wasActive = this.state.isActive;
    if (wasActive) {
      this.stop();
    }

    this.state.currentMode = mode;
    this.state.config = newConfig;
    this.state.currentInterval = newConfig.baseInterval;
    this.state.tickCount = 0;

    // 通知状态监听器
    this.stateListeners.forEach(listener => {
      try {
        listener(mode, newConfig);
      } catch (error) {
        console.error('[RhythmManager] 状态监听器错误:', error);
      }
    });

    if (wasActive) {
      this.start();
    }
  }

  tick(callback: RhythmTickCallback): void {
    this.tickCallbacks.add(callback);
    console.log(`[RhythmManager] 注册节拍回调，当前回调数: ${this.tickCallbacks.size}`);
  }

  start(): void {
    if (this.state.isActive) {
      console.warn('[RhythmManager] 节拍器已在运行');
      return;
    }

    console.log(`[RhythmManager] 启动节拍器，模式: ${this.state.currentMode}`);
    this.state.isActive = true;
    this.lastTickTime = Date.now();
    this.scheduleNextTick();
  }

  stop(): void {
    if (!this.state.isActive) {
      return;
    }

    console.log('[RhythmManager] 停止节拍器');
    this.state.isActive = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  pause(): void {
    if (this.state.isActive) {
      console.log('[RhythmManager] 暂停节拍器');
      this.stop();
    }
  }

  resume(): void {
    if (!this.state.isActive) {
      console.log('[RhythmManager] 恢复节拍器');
      this.start();
    }
  }

  // 状态查询方法
  getCurrentState(): RhythmState {
    return { ...this.state };
  }

  isActive(): boolean {
    return this.state.isActive;
  }

  getCurrentMode(): RhythmMode {
    return this.state.currentMode;
  }

  // 事件监听方法
  onRhythmChange(listener: RhythmStateListener): void {
    this.stateListeners.add(listener);
  }

  offRhythmChange(listener: RhythmStateListener): void {
    this.stateListeners.delete(listener);
  }

  // 高级功能
  syncWithExternal(source: string, interval: number): void {
    console.log(`[RhythmManager] 与外部源同步: ${source}, 间隔: ${interval}ms`);
    this.setRhythmMode('sync', {
      syncSource: source,
      baseInterval: interval,
      variation: 0.05 // 同步模式下减少变化
    });
  }

  adaptToEmotion(emotionIntensity: number): void {
    if (this.state.currentMode !== 'adaptive') {
      return;
    }

    // 根据情绪强度调整节拍
    const baseInterval = this.state.config.baseInterval;
    const intensityFactor = Math.max(0.3, 1 - emotionIntensity * 0.7);
    const newInterval = Math.round(baseInterval * intensityFactor);
    
    console.log(`[RhythmManager] 适应情绪强度: ${emotionIntensity}, 间隔调整: ${baseInterval} → ${newInterval}ms`);
    
    this.state.currentInterval = newInterval;
  }

  // 私有方法：计算下一个节拍间隔
  private calculateNextInterval(): number {
    const config = this.state.config;
    
    switch (config.mode) {
      case 'steady':
        // 稳定模式：固定间隔 + 小幅变化
        return config.baseInterval + (Math.random() - 0.5) * config.baseInterval * config.variation;
        
      case 'pulse':
        // 脉冲模式：心跳式变化
        const pulsePhase = (this.state.tickCount % 4) / 4 * Math.PI * 2;
        const pulseFactor = 0.8 + 0.4 * Math.sin(pulsePhase);
        return config.baseInterval * pulseFactor;
        
      case 'sequence':
        // 序列模式：按预设序列循环
        if (config.sequence && config.sequence.length > 0) {
          const index = this.state.tickCount % config.sequence.length;
          return config.sequence[index];
        }
        return config.baseInterval;
        
      case 'adaptive':
        // 自适应模式：使用当前间隔（由 adaptToEmotion 调整）
        return this.state.currentInterval + (Math.random() - 0.5) * this.state.currentInterval * config.variation;
        
      case 'sync':
        // 同步模式：精确间隔
        return config.baseInterval;
        
      default:
        return config.baseInterval;
    }
  }

  // 私有方法：调度下一个节拍
  private scheduleNextTick(): void {
    if (!this.state.isActive) {
      return;
    }

    const nextInterval = Math.max(50, this.calculateNextInterval()); // 最小间隔50ms
    
    this.timerId = setTimeout(() => {
      this.executeTick();
      this.scheduleNextTick();
    }, nextInterval);
  }

  // 私有方法：执行节拍回调
  private executeTick(): void {
    const now = Date.now();
    const actualInterval = now - this.lastTickTime;
    
    this.state.lastTickTime = now;
    this.state.tickCount++;
    this.lastTickTime = now;

    // 调用所有注册的回调
    this.tickCallbacks.forEach(callback => {
      try {
        callback(now, actualInterval);
      } catch (error) {
        console.error('[RhythmManager] 节拍回调执行错误:', error);
      }
    });

    // 调试日志（仅在开发模式）
    if (process.env.NODE_ENV === 'development' && this.state.tickCount % 10 === 0) {
      console.log(`[RhythmManager] 节拍统计: 模式=${this.state.currentMode}, 计数=${this.state.tickCount}, 间隔=${actualInterval}ms`);
    }
  }

  // 清理方法
  dispose(): void {
    this.stop();
    this.tickCallbacks.clear();
    this.stateListeners.clear();
    console.log('[RhythmManager] 已清理资源');
  }
}

// 导出默认节奏设置
export const DefaultRhythmSettings: { [key: string]: RhythmConfig } = {
  development: {
    mode: 'steady',
    baseInterval: 2000, // 开发环境使用较慢节拍
    intensity: 'low',
    variation: 0.1
  },
  production: {
    mode: 'adaptive',
    baseInterval: 800,
    intensity: 'medium',
    variation: 0.3
  },
  demo: {
    mode: 'pulse',
    baseInterval: 600,
    intensity: 'high',
    variation: 0.4
  }
};
