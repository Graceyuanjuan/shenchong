/**
 * 📌 T7-A｜神宠行为节奏管理器 BehaviorRhythmManager
 * 
 * 模块目标：
 * 构建一个行为节奏控制器，支持多段行为链的节奏控制、等待时间与组合触发，
 * 实现神宠行为逻辑的节奏感与控制感。
 */

export type RhythmStep =
  | { type: 'say'; content: string }
  | { type: 'wait'; duration: number }
  | { type: 'animate'; name: string }
  | { type: 'playPlugin'; pluginId: string; params?: any };

export interface RhythmManagerConfig {
  maxSteps?: number;
  defaultWaitDuration?: number;
  onComplete?: () => void;
  onError?: (error: Error, step: RhythmStep) => void;
}

export class BehaviorRhythmManager {
  private queue: RhythmStep[] = [];
  private currentIndex = 0;
  private isPaused = false;
  private timer: any = null;
  private isRunning = false;
  private config: RhythmManagerConfig;

  constructor(
    private executeStep: (step: RhythmStep) => Promise<void>,
    config: RhythmManagerConfig = {}
  ) {
    this.config = {
      maxSteps: 100,
      defaultWaitDuration: 500,
      ...config
    };
  }

  /**
   * 调度执行节奏步骤序列
   */
  public scheduleWithRhythm(steps: RhythmStep[]): void {
    if (steps.length > (this.config.maxSteps || 100)) {
      throw new Error(`Steps count exceeds maximum limit: ${this.config.maxSteps}`);
    }

    this.queue = [...steps]; // 创建副本避免外部修改
    this.currentIndex = 0;
    this.isPaused = false;
    this.isRunning = true;
    this.runNext();
  }

  /**
   * 暂停节奏执行
   */
  public pause(): void {
    this.isPaused = true;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  /**
   * 恢复节奏执行
   */
  public resume(): void {
    if (!this.isPaused || !this.isRunning) return;
    this.isPaused = false;
    this.runNext();
  }

  /**
   * 停止并清空队列
   */
  public stop(): void {
    this.isPaused = false;
    this.isRunning = false;
    this.queue = [];
    this.currentIndex = 0;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  /**
   * 添加步骤到当前队列末尾
   */
  public appendStep(step: RhythmStep): void {
    this.queue.push(step);
  }

  /**
   * 获取当前执行状态
   */
  public getStatus() {
    return {
      isRunning: this.isRunning,
      isPaused: this.isPaused,
      currentStep: this.currentIndex,
      totalSteps: this.queue.length,
      progress: this.queue.length > 0 ? this.currentIndex / this.queue.length : 0
    };
  }

  /**
   * 私有方法：执行下一个步骤
   */
  private async runNext(): Promise<void> {
    if (this.isPaused || this.currentIndex >= this.queue.length) {
      if (this.currentIndex >= this.queue.length) {
        this.isRunning = false;
        this.config.onComplete?.();
      }
      return;
    }

    const step = this.queue[this.currentIndex];
    this.currentIndex++;

    try {
      if (step.type === 'wait') {
        const duration = step.duration || this.config.defaultWaitDuration || 500;
        this.timer = setTimeout(() => this.runNext(), duration);
      } else {
        await this.executeStep(step);
        // 非等待步骤立即执行下一步
        this.runNext();
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.config.onError?.(err, step);
      // 错误后继续执行下一步（可配置是否停止）
      this.runNext();
    }
  }
}

/**
 * 工厂函数：创建预配置的节奏管理器
 */
export function createBehaviorRhythmManager(
  executeStep: (step: RhythmStep) => Promise<void>,
  config?: RhythmManagerConfig
): BehaviorRhythmManager {
  return new BehaviorRhythmManager(executeStep, config);
}

/**
 * 辅助函数：创建常用的节奏步骤
 */
export const RhythmSteps = {
  say: (content: string): RhythmStep => ({ type: 'say', content }),
  wait: (duration: number): RhythmStep => ({ type: 'wait', duration }),
  animate: (name: string): RhythmStep => ({ type: 'animate', name }),
  playPlugin: (pluginId: string, params?: any): RhythmStep => ({ 
    type: 'playPlugin', 
    pluginId, 
    params 
  }),
  
  // 组合步骤生成器
  greeting: (name: string = '用户') => [
    RhythmSteps.say(`你好，${name}！`),
    RhythmSteps.wait(800),
    RhythmSteps.animate('wave'),
    RhythmSteps.wait(500),
    RhythmSteps.say('今天心情怎么样呀？')
  ],
  
  celebration: () => [
    RhythmSteps.say('太棒了！'),
    RhythmSteps.animate('jump'),
    RhythmSteps.wait(300),
    RhythmSteps.animate('sparkle'),
    RhythmSteps.wait(500),
    RhythmSteps.say('你真厉害！')
  ]
};
