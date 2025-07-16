/**
 * 📌 BehaviorRhythmManager 集成示例
 * 展示如何在神宠系统中集成和使用行为节奏管理器
 */

import { BehaviorRhythmManager, RhythmStep, RhythmSteps, createBehaviorRhythmManager } from './BehaviorRhythmManager';

/**
 * 示例1：在 BehaviorScheduler 中集成节奏管理器
 */
export class EnhancedBehaviorScheduler {
  private rhythmManager: BehaviorRhythmManager;

  constructor(
    private pet: any, // 假设的宠物对象
    private pluginManager: any, // 插件管理器
    private animationPlayer: any // 动画播放器
  ) {
    // 创建节奏管理器，定义步骤执行逻辑
    this.rhythmManager = createBehaviorRhythmManager(
      async (step: RhythmStep) => this.executeRhythmStep(step),
      {
        maxSteps: 50,
        defaultWaitDuration: 800,
        onComplete: () => console.log('节奏序列执行完成'),
        onError: (error, step) => console.error('步骤执行错误:', error, step)
      }
    );
  }

  /**
   * 执行单个节奏步骤
   */
  private async executeRhythmStep(step: RhythmStep): Promise<void> {
    switch (step.type) {
      case 'say':
        await this.pet.say(step.content);
        break;
      case 'animate':
        await this.animationPlayer.play(step.name);
        break;
      case 'playPlugin':
        await this.pluginManager.trigger(step.pluginId, step.params);
        break;
      default:
        console.warn('未知步骤类型:', step);
    }
  }

  /**
   * 执行问候序列
   */
  public performGreeting(userName?: string): void {
    const greetingSteps = RhythmSteps.greeting(userName);
    this.rhythmManager.scheduleWithRhythm(greetingSteps);
  }

  /**
   * 执行庆祝序列
   */
  public performCelebration(): void {
    const celebrationSteps = RhythmSteps.celebration();
    this.rhythmManager.scheduleWithRhythm(celebrationSteps);
  }

  /**
   * 自定义复杂行为序列
   */
  public performComplexBehavior(): void {
    const steps: RhythmStep[] = [
      RhythmSteps.say('让我想想...'),
      RhythmSteps.wait(1200),
      RhythmSteps.animate('thinking'),
      RhythmSteps.wait(800),
      RhythmSteps.say('我有个好主意！'),
      RhythmSteps.animate('lightbulb'),
      RhythmSteps.wait(500),
      RhythmSteps.playPlugin('music-player', { song: 'happy-tune' }),
      RhythmSteps.say('来听首歌吧～')
    ];

    this.rhythmManager.scheduleWithRhythm(steps);
  }

  /**
   * 暂停/恢复控制
   */
  public pauseCurrentRhythm(): void {
    this.rhythmManager.pause();
  }

  public resumeCurrentRhythm(): void {
    this.rhythmManager.resume();
  }

  public stopCurrentRhythm(): void {
    this.rhythmManager.stop();
  }

  /**
   * 获取执行状态
   */
  public getRhythmStatus() {
    return this.rhythmManager.getStatus();
  }
}

/**
 * 示例2：情绪驱动的节奏行为
 */
export class EmotionDrivenRhythm {
  private rhythmManager: BehaviorRhythmManager;

  constructor(private emotionState: string, private pet: any) {
    this.rhythmManager = createBehaviorRhythmManager(
      async (step) => this.executeEmotionalStep(step)
    );
  }

  private async executeEmotionalStep(step: RhythmStep): Promise<void> {
    // 根据情绪状态调整步骤执行
    const emotionModifier = this.getEmotionModifier();
    
    switch (step.type) {
      case 'say':
        await this.pet.say(step.content, { emotion: this.emotionState });
        break;
      case 'animate':
        await this.pet.playAnimation(step.name, { speed: emotionModifier.speed });
        break;
      case 'wait':
        // 情绪影响等待时间
        const adjustedDuration = step.duration * emotionModifier.waitMultiplier;
        await new Promise(resolve => setTimeout(resolve, adjustedDuration));
        break;
    }
  }

  private getEmotionModifier() {
    switch (this.emotionState) {
      case 'excited':
        return { speed: 1.5, waitMultiplier: 0.7 };
      case 'sad':
        return { speed: 0.8, waitMultiplier: 1.5 };
      case 'angry':
        return { speed: 1.3, waitMultiplier: 0.5 };
      default:
        return { speed: 1.0, waitMultiplier: 1.0 };
    }
  }

  public expressEmotion(): void {
    const emotionSteps = this.createEmotionSteps(this.emotionState);
    this.rhythmManager.scheduleWithRhythm(emotionSteps);
  }

  private createEmotionSteps(emotion: string): RhythmStep[] {
    switch (emotion) {
      case 'happy':
        return [
          RhythmSteps.say('我好开心！'),
          RhythmSteps.animate('bounce'),
          RhythmSteps.wait(300),
          RhythmSteps.animate('smile')
        ];
      case 'sad':
        return [
          RhythmSteps.say('有点难过...'),
          RhythmSteps.wait(1000),
          RhythmSteps.animate('sigh'),
          RhythmSteps.wait(800),
          RhythmSteps.say('但没关系的')
        ];
      case 'excited':
        return [
          RhythmSteps.say('哇！'),
          RhythmSteps.animate('jump'),
          RhythmSteps.wait(200),
          RhythmSteps.say('太激动了！'),
          RhythmSteps.animate('spin')
        ];
      default:
        return [RhythmSteps.say('...'), RhythmSteps.wait(500)];
    }
  }
}

/**
 * 示例3：使用示例和测试用例
 */
export function demonstrateBehaviorRhythm() {
  console.log('🎭 BehaviorRhythmManager 演示');

  // 模拟宠物和管理器
  const mockPet = {
    say: async (content: string) => console.log(`🐱 说: ${content}`),
    playAnimation: async (name: string) => console.log(`🎬 动画: ${name}`)
  };

  const mockPluginManager = {
    trigger: async (id: string, params?: any) => 
      console.log(`🔌 插件: ${id}`, params || '')
  };

  // 创建增强的行为调度器
  const scheduler = new EnhancedBehaviorScheduler(
    mockPet,
    mockPluginManager,
    { play: mockPet.playAnimation }
  );

  // 演示不同行为
  console.log('\n1. 问候序列:');
  scheduler.performGreeting('小明');

  setTimeout(() => {
    console.log('\n2. 庆祝序列:');
    scheduler.performCelebration();
  }, 3000);

  setTimeout(() => {
    console.log('\n3. 复杂行为序列:');
    scheduler.performComplexBehavior();
  }, 6000);

  // 演示控制功能
  setTimeout(() => {
    console.log('\n4. 暂停控制演示');
    scheduler.pauseCurrentRhythm();
    console.log('状态:', scheduler.getRhythmStatus());
    
    setTimeout(() => {
      console.log('恢复执行...');
      scheduler.resumeCurrentRhythm();
    }, 2000);
  }, 8000);
}
