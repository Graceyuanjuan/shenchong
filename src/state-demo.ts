/**
 * SaintGrid 神宠系统 - 状态机演示
 * 展示四态切换和插件触发机制
 */

import { SaintGridPetSystem, PetState } from './index';

/**
 * 状态机演示程序
 */
class StateMachineDemo {
  private petSystem: SaintGridPetSystem;

  constructor() {
    this.petSystem = new SaintGridPetSystem();
  }

  /**
   * 运行完整演示
   */
  async run(): Promise<void> {
    console.log('🎭 ===== SaintGrid 神宠状态机演示开始 =====\n');

    try {
      // 1. 启动系统
      await this.petSystem.start();
      
      // 2. 演示四态切换
      await this.demonstrateStateMachine();
      
      // 3. 演示用户交互模拟
      await this.demonstrateUserInteractions();
      
      // 4. 演示插件触发
      await this.demonstratePluginTriggers();
      
      // 5. 演示状态统计
      this.demonstrateStateStatistics();

    } catch (error) {
      console.error('❌ 演示过程中出现错误:', error);
    } finally {
      console.log('\n🎭 ===== 状态机演示结束 =====');
      await this.petSystem.stop();
    }
  }

  /**
   * 演示状态机切换
   */
  private async demonstrateStateMachine(): Promise<void> {
    console.log('🔄 ===== 四态状态机切换演示 =====\n');

    // 初始状态：Idle
    console.log('📍 当前状态:', this.petSystem.getCurrentState());
    await this.delay(1000);

    // 演示所有状态切换
    const states = [
      PetState.Hover,   // 静碗 → 感应碗
      PetState.Awaken,  // 感应碗 → 唤醒碗
      PetState.Control, // 唤醒碗 → 控制碗
      PetState.Idle     // 控制碗 → 静碗
    ];

    for (const state of states) {
      console.log(`\n🎯 准备切换到状态: ${state}`);
      await this.petSystem.switchToState(state);
      
      // 显示当前可用操作
      const actions = this.getAvailableActionsForState(state);
      console.log(`📋 当前可用操作: ${actions.join(', ')}`);
      
      await this.delay(2000);
    }

    console.log('\n✅ 四态切换演示完成\n');
  }

  /**
   * 演示用户交互模拟
   */
  private async demonstrateUserInteractions(): Promise<void> {
    console.log('🖱️ ===== 用户交互模拟演示 =====\n');

    // 模拟鼠标悬浮
    console.log('🖱️ 模拟鼠标悬浮事件...');
    await this.simulateMouseHover();
    await this.delay(1500);

    // 模拟左键点击
    console.log('👆 模拟左键点击事件...');
    await this.simulateLeftClick();
    await this.delay(1500);

    // 模拟右键点击
    console.log('👆 模拟右键点击事件...');
    await this.simulateRightClick();
    await this.delay(1500);

    // 模拟鼠标离开
    console.log('🖱️ 模拟鼠标离开事件...');
    await this.simulateMouseLeave();
    await this.delay(3500); // 等待自动返回静态

    console.log('\n✅ 用户交互模拟完成\n');
  }

  /**
   * 演示插件触发机制
   */
  private async demonstratePluginTriggers(): Promise<void> {
    console.log('🔌 ===== 插件触发机制演示 =====\n');

    // 在不同状态下触发插件
    const states = [PetState.Hover, PetState.Awaken, PetState.Control];

    for (const state of states) {
      console.log(`\n🎯 在 ${state} 状态下触发插件:`);
      await this.petSystem.switchToState(state);
      
      // 等待插件触发完成
      await this.delay(1000);
      
      console.log(`✅ ${state} 状态下的插件触发完成`);
    }

    console.log('\n✅ 插件触发演示完成\n');
  }

  /**
   * 演示状态统计
   */
  private demonstrateStateStatistics(): void {
    console.log('📊 ===== 状态统计演示 =====\n');

    // 这里需要通过 petSystem 访问 petBrain 的方法
    // 在实际实现中应该暴露这些方法
    console.log('📈 状态统计信息:');
    console.log(`📍 当前状态: ${this.petSystem.getCurrentState()}`);
    
    const emotionDetails = this.petSystem.getEmotionDetails();
    console.log(`😊 当前情绪: ${emotionDetails.emotion} (强度: ${emotionDetails.intensity.toFixed(2)})`);
    
    const recommendations = this.petSystem.getRecommendations();
    console.log(`💡 推荐操作: ${recommendations.join(', ')}`);

    console.log('\n✅ 状态统计演示完成\n');
  }

  /**
   * 模拟鼠标悬浮
   */
  private async simulateMouseHover(): Promise<void> {
    // 在实际实现中，这些方法应该在 SaintGridPetSystem 中暴露
    // 这里我们通过状态切换来模拟
    if (this.petSystem.getCurrentState() === PetState.Idle) {
      await this.petSystem.switchToState(PetState.Hover);
    }
  }

  /**
   * 模拟左键点击
   */
  private async simulateLeftClick(): Promise<void> {
    if (this.petSystem.getCurrentState() === PetState.Hover) {
      await this.petSystem.switchToState(PetState.Awaken);
    } else if (this.petSystem.getCurrentState() === PetState.Idle) {
      await this.petSystem.switchToState(PetState.Hover);
    }
  }

  /**
   * 模拟右键点击
   */
  private async simulateRightClick(): Promise<void> {
    await this.petSystem.switchToState(PetState.Control);
  }

  /**
   * 模拟鼠标离开
   */
  private async simulateMouseLeave(): Promise<void> {
    if (this.petSystem.getCurrentState() === PetState.Hover) {
      console.log('⏰ 3秒后自动返回静态状态...');
      setTimeout(async () => {
        if (this.petSystem.getCurrentState() === PetState.Hover) {
          await this.petSystem.switchToState(PetState.Idle);
        }
      }, 3000);
    }
  }

  /**
   * 获取状态对应的可用操作
   */
  private getAvailableActionsForState(state: PetState): string[] {
    switch (state) {
      case PetState.Idle:
        return ['悬浮感应', '点击交互'];
      case PetState.Hover:
        return ['左键唤醒', '右键设置', '离开返回'];
      case PetState.Awaken:
        return ['截图', '记录', '复制', '投屏'];
      case PetState.Control:
        return ['系统设置', '插件管理', '皮肤切换', 'AI配置'];
      default:
        return [];
    }
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * 运行演示
 */
export async function runStateMachineDemo(): Promise<void> {
  const demo = new StateMachineDemo();
  await demo.run();
}

// 如果直接运行此文件
if (typeof require !== 'undefined' && require.main === module) {
  runStateMachineDemo().catch(console.error);
}
