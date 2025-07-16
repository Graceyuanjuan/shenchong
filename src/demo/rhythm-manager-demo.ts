/**
 * 📌 T7-A BehaviorRhythmManager 演示文件
 * 运行命令: npm run dev 或 npx ts-node src/demo/rhythm-manager-demo.ts
 */

import { BehaviorRhythmManager, RhythmSteps, createBehaviorRhythmManager } from '../modules/behavior/BehaviorRhythmManager';

// 模拟神宠对象
class MockPet {
  private name: string;
  private emotion: string = 'neutral';

  constructor(name: string = '汤圆') {
    this.name = name;
  }

  async say(content: string, options?: { emotion?: string }): Promise<void> {
    const emotionIcon = this.getEmotionIcon(options?.emotion || this.emotion);
    console.log(`🐱 ${this.name} ${emotionIcon}: ${content}`);
    await this.delay(300); // 模拟说话时间
  }

  async playAnimation(name: string, options?: { speed?: number }): Promise<void> {
    const speed = options?.speed || 1.0;
    const duration = Math.round(500 / speed);
    console.log(`🎬 ${this.name} 播放动画: ${name} (速度: ${speed}x)`);
    await this.delay(duration);
  }

  setEmotion(emotion: string): void {
    this.emotion = emotion;
    console.log(`💭 ${this.name} 的情绪变为: ${emotion}`);
  }

  private getEmotionIcon(emotion: string): string {
    const icons: Record<string, string> = {
      happy: '😊',
      excited: '🤩',
      sad: '😢',
      angry: '😠',
      confused: '🤔',
      sleepy: '😴',
      neutral: '😐'
    };
    return icons[emotion] || '😐';
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 模拟插件管理器
class MockPluginManager {
  async trigger(pluginId: string, params?: any): Promise<void> {
    console.log(`🔌 触发插件: ${pluginId}`, params ? `参数: ${JSON.stringify(params)}` : '');
    await new Promise(resolve => setTimeout(resolve, 200));
  }
}

// 演示函数
async function demonstrateBasicRhythm() {
  console.log('\n🎭 === 基础节奏演示 ===');
  
  const pet = new MockPet('汤圆');
  const pluginManager = new MockPluginManager();

  // 创建节奏管理器
  const rhythmManager = createBehaviorRhythmManager(
    async (step) => {
      switch (step.type) {
        case 'say':
          await pet.say(step.content);
          break;
        case 'animate':
          await pet.playAnimation(step.name);
          break;
        case 'playPlugin':
          await pluginManager.trigger(step.pluginId, step.params);
          break;
      }
    },
    {
      onComplete: () => console.log('✅ 节奏序列完成！'),
      onError: (error, step) => console.error('❌ 步骤错误:', error.message, step)
    }
  );

  // 执行基础问候序列
  console.log('\n1. 基础问候序列:');
  const greetingSteps = RhythmSteps.greeting('小明');
  rhythmManager.scheduleWithRhythm(greetingSteps);
  
  // 等待完成
  await new Promise(resolve => setTimeout(resolve, 5000));
}

async function demonstrateComplexRhythm() {
  console.log('\n🎪 === 复杂节奏演示 ===');
  
  const pet = new MockPet('汤圆');
  
  const rhythmManager = createBehaviorRhythmManager(
    async (step) => {
      switch (step.type) {
        case 'say':
          await pet.say(step.content);
          break;
        case 'animate':
          await pet.playAnimation(step.name);
          break;
        case 'playPlugin':
          if (step.pluginId === 'emotion-changer') {
            pet.setEmotion(step.params?.emotion || 'neutral');
          } else {
            console.log(`🔌 触发插件: ${step.pluginId}`);
          }
          break;
      }
    },
    {
      onComplete: () => console.log('✅ 复杂序列完成！')
    }
  );

  // 复杂的情绪变化序列
  const complexSteps = [
    RhythmSteps.say('今天我要给大家表演一个特别的节目！'),
    RhythmSteps.wait(1000),
    RhythmSteps.playPlugin('emotion-changer', { emotion: 'excited' }),
    RhythmSteps.say('准备好了吗？'),
    RhythmSteps.animate('jump'),
    RhythmSteps.wait(500),
    RhythmSteps.say('开始！'),
    RhythmSteps.animate('spin'),
    RhythmSteps.wait(800),
    RhythmSteps.playPlugin('emotion-changer', { emotion: 'happy' }),
    RhythmSteps.say('怎么样？还不错吧～'),
    RhythmSteps.animate('bow'),
    RhythmSteps.wait(1000),
    RhythmSteps.say('谢谢大家！')
  ];

  rhythmManager.scheduleWithRhythm(complexSteps);
  
  // 等待完成
  await new Promise(resolve => setTimeout(resolve, 8000));
}

async function demonstrateControlFeatures() {
  console.log('\n🎮 === 控制功能演示 ===');
  
  const pet = new MockPet('汤圆');
  
  const rhythmManager = createBehaviorRhythmManager(
    async (step) => {
      switch (step.type) {
        case 'say':
          await pet.say(step.content);
          break;
        case 'animate':
          await pet.playAnimation(step.name);
          break;
      }
    }
  );

  // 长序列用于演示控制
  const longSteps = [
    RhythmSteps.say('这是一个很长的序列'),
    RhythmSteps.wait(1000),
    RhythmSteps.say('我会在中途被暂停'),
    RhythmSteps.wait(1000),
    RhythmSteps.say('然后恢复执行'),
    RhythmSteps.wait(1000),
    RhythmSteps.say('最后完成整个序列')
  ];

  console.log('\n开始执行长序列...');
  rhythmManager.scheduleWithRhythm(longSteps);

  // 2秒后暂停
  setTimeout(() => {
    console.log('\n⏸️  暂停执行...');
    rhythmManager.pause();
    console.log('状态:', rhythmManager.getStatus());
  }, 2000);

  // 4秒后恢复
  setTimeout(() => {
    console.log('\n▶️  恢复执行...');
    rhythmManager.resume();
  }, 4000);

  // 等待完成
  await new Promise(resolve => setTimeout(resolve, 8000));
}

async function demonstrateErrorHandling() {
  console.log('\n⚠️ === 错误处理演示 ===');
  
  let errorCount = 0;
  
  const rhythmManager = createBehaviorRhythmManager(
    async (step) => {
      if (step.type === 'say' && step.content.includes('错误')) {
        throw new Error('模拟执行错误');
      }
      console.log(`✅ 成功执行: ${step.type}`);
    },
    {
      onError: (error, step) => {
        errorCount++;
        console.log(`❌ 错误 #${errorCount}: ${error.message} (步骤: ${step.type})`);
      },
      onComplete: () => console.log(`✅ 序列完成，共处理 ${errorCount} 个错误`)
    }
  );

  const stepsWithErrors = [
    RhythmSteps.say('正常步骤1'),
    RhythmSteps.say('这会产生错误'),
    RhythmSteps.say('正常步骤2'),
    RhythmSteps.animate('dance'),
    RhythmSteps.say('又一个错误步骤'),
    RhythmSteps.say('最后的正常步骤')
  ];

  rhythmManager.scheduleWithRhythm(stepsWithErrors);
  
  await new Promise(resolve => setTimeout(resolve, 3000));
}

// 主演示函数
async function main() {
  console.log('🚀 BehaviorRhythmManager 完整演示开始\n');
  
  try {
    await demonstrateBasicRhythm();
    await demonstrateComplexRhythm();
    await demonstrateControlFeatures();
    await demonstrateErrorHandling();
    
    console.log('\n🎉 演示完成！');
    console.log('\n📋 演示总结:');
    console.log('✅ 基础节奏控制 - 支持say、wait、animate、playPlugin步骤');
    console.log('✅ 复杂序列编排 - 支持情绪变化和多段行为组合');
    console.log('✅ 执行控制 - 支持暂停、恢复、停止操作');
    console.log('✅ 错误处理 - 自动处理步骤执行错误并继续');
    console.log('✅ 状态监控 - 实时获取执行进度和状态');
    
  } catch (error) {
    console.error('演示过程中发生错误:', error);
  }
}

// 如果直接运行此文件，执行演示
if (require.main === module) {
  main().catch(console.error);
}

export { main as runRhythmManagerDemo };
