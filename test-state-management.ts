/**
 * 🎛️ 主脑状态管理核心模块测试
 * 验证 PetBrain 的状态管理功能是否正常工作
 */

import { PetBrain } from './src/core/PetBrain';
import { PetState, EmotionType } from './src/types';

async function testStateManagement() {
  console.log('🧪 ===== 主脑状态管理测试开始 =====\n');

  // 创建主脑实例
  const brain = new PetBrain({
    defaultState: PetState.Idle,
    defaultEmotion: EmotionType.Calm
  });

  console.log('1️⃣ 测试初始状态');
  console.log(`当前状态: ${brain.getCurrentState()}`);
  console.log(`状态统计:`, brain.getStateStatistics());
  console.log();

  console.log('2️⃣ 测试状态切换序列');
  
  // 测试状态切换: Idle → Hover
  console.log('测试: Idle → Hover');
  brain.handleStateChange(PetState.Hover);
  console.log(`切换后状态: ${brain.getCurrentState()}`);
  console.log();
  
  // 测试状态切换: Hover → Awaken
  console.log('测试: Hover → Awaken');
  brain.handleStateChange(PetState.Awaken);
  console.log(`切换后状态: ${brain.getCurrentState()}`);
  console.log();
  
  // 测试状态切换: Awaken → Control
  console.log('测试: Awaken → Control');
  brain.handleStateChange(PetState.Control);
  console.log(`切换后状态: ${brain.getCurrentState()}`);
  console.log();
  
  // 测试状态切换: Control → Idle
  console.log('测试: Control → Idle');
  brain.handleStateChange(PetState.Idle);
  console.log(`切换后状态: ${brain.getCurrentState()}`);
  console.log();

  console.log('3️⃣ 测试重复状态切换');
  console.log('测试: Idle → Idle (应该显示无变化)');
  brain.handleStateChange(PetState.Idle);
  console.log();

  console.log('4️⃣ 测试快速状态切换');
  const stateSequence = [
    PetState.Hover,
    PetState.Awaken,
    PetState.Control,
    PetState.Idle,
    PetState.Hover,
    PetState.Awaken,
    PetState.Idle
  ];

  console.log('快速状态切换序列:', stateSequence.join(' → '));
  stateSequence.forEach((state, index) => {
    console.log(`步骤 ${index + 1}: 切换到 ${state}`);
    brain.handleStateChange(state);
  });
  console.log();

  console.log('5️⃣ 最终状态统计');
  const finalStats = brain.getStateStatistics();
  console.log('最终状态统计:', finalStats);
  console.log(`当前状态: ${brain.getCurrentState()}`);
  console.log(`状态历史长度: ${finalStats.stateHistory.length}`);
  console.log(`状态历史: [${finalStats.stateHistory.join(' → ')}]`);

  console.log('\n🧪 ===== 主脑状态管理测试完成 =====');
}

async function testEnhancedStateTransition() {
  console.log('\n🚀 ===== 增强状态转换测试开始 =====\n');

  const brain = new PetBrain();
  await brain.initialize();

  console.log('1️⃣ 测试增强状态转换（包含情绪和插件）');
  
  // 注册示例插件
  const { ScreenshotPlugin, NotePlugin } = await import('./src/plugins/ExamplePlugins');
  await brain.registerPlugin(new ScreenshotPlugin());
  await brain.registerPlugin(new NotePlugin());

  console.log('\n2️⃣ 测试各状态的增强转换');
  
  console.log('测试: 转换到 Hover 状态');
  await brain.transitionToState(PetState.Hover);
  
  console.log('\n测试: 转换到 Awaken 状态（应触发插件）');
  await brain.transitionToState(PetState.Awaken);
  
  console.log('\n测试: 转换到 Control 状态');
  await brain.transitionToState(PetState.Control);
  
  console.log('\n测试: 转换回 Idle 状态');
  await brain.transitionToState(PetState.Idle);

  console.log('\n3️⃣ 最终系统状态');
  const systemStatus = brain.getSystemStatus();
  console.log('系统状态:', {
    currentState: systemStatus.state,
    currentEmotion: systemStatus.emotion,
    pluginCount: systemStatus.pluginCount
  });

  console.log('\n🚀 ===== 增强状态转换测试完成 =====');
  
  // 清理
  await brain.destroy();
}

// 运行测试
export async function runStateManagementTests() {
  try {
    await testStateManagement();
    await testEnhancedStateTransition();
  } catch (error) {
    console.error('❌ 测试执行失败:', error);
  }
}

// 如果直接运行此文件
if (typeof window === 'undefined') {
  runStateManagementTests().catch(console.error);
}
