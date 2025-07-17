/**
 * SaintGrid 神宠系统 - 完整功能测试
 * 测试状态机、插件触发、情绪引擎等所有增强功能
 */

import { SaintGridPetSystem, PetState, EmotionType } from './index';

async function main() {
  console.log('🎭 ===== SaintGrid 神宠系统完整功能测试 =====\n');

  const petSystem = new SaintGridPetSystem();

  try {
    // 1. 启动系统
    console.log('🚀 启动神宠系统...');
    await petSystem.start();

    // 2. 测试基本状态切换
    console.log('\n🔄 ===== 测试基本状态切换 =====');
    await testBasicStateTransitions(petSystem);

    // 3. 测试用户交互事件
    console.log('\n🖱️ ===== 测试用户交互事件 =====');
    await testUserInteractionEvents(petSystem);

    // 4. 测试插件触发机制
    console.log('\n🔌 ===== 测试插件触发机制 =====');
    await testPluginTriggerMechanism(petSystem);

    // 5. 测试情绪状态变化
    console.log('\n😊 ===== 测试情绪状态变化 =====');
    await testEmotionChanges(petSystem);

    // 6. 测试状态统计功能
    console.log('\n📊 ===== 测试状态统计功能 =====');
    testStateStatistics(petSystem);

    // 7. 测试组合交互
    console.log('\n🎪 ===== 测试组合交互 =====');
    await testCombinedInteractions(petSystem);

    console.log('\n✅ 所有测试完成！');

  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error);
  } finally {
    await petSystem.stop();
    console.log('\n🎭 ===== 测试结束 =====');
  }
}

/**
 * 测试基本状态切换
 */
async function testBasicStateTransitions(petSystem: SaintGridPetSystem): Promise<void> {
  const states = [
    { state: PetState.Hover, name: '感应碗' },
    { state: PetState.Awaken, name: '唤醒碗' },
    { state: PetState.Control, name: '控制碗' },
    { state: PetState.Idle, name: '静碗' }
  ];

  console.log(`📍 初始状态: ${petSystem.getCurrentState()}`);

  for (const { state, name } of states) {
    console.log(`\n🎯 切换到 ${name} (${state})`);
    await petSystem.switchToState(state);
    
    const currentState = petSystem.getCurrentState();
    const emotionDetails = petSystem.getEmotionDetails();
    const actions = petSystem.getAvailableActions();
    
    console.log(`✅ 当前状态: ${currentState}`);
    console.log(`😊 当前情绪: ${emotionDetails.emotion} (强度: ${emotionDetails.intensity.toFixed(2)})`);
    console.log(`📋 可用操作: ${actions.join(', ')}`);
    console.log(`💬 状态描述: 当前状态为 ${currentState}`);
    
    await delay(1500);
  }
}

/**
 * 测试用户交互事件
 */
async function testUserInteractionEvents(petSystem: SaintGridPetSystem): Promise<void> {
  // 确保从静态开始
  await petSystem.switchToState(PetState.Idle);
  console.log(`📍 起始状态: ${petSystem.getCurrentState()}`);

  // 测试鼠标悬浮
  console.log('\n🖱️ 模拟鼠标悬浮...');
  await petSystem.onMouseHover();
  console.log(`✅ 悬浮后状态: ${petSystem.getCurrentState()}`);
  await delay(1000);

  // 测试左键点击
  console.log('\n👆 模拟左键点击...');
  await petSystem.onLeftClick();
  console.log(`✅ 点击后状态: ${petSystem.getCurrentState()}`);
  await delay(1000);

  // 测试右键点击
  console.log('\n👆 模拟右键点击...');
  await petSystem.onRightClick();
  console.log(`✅ 右键后状态: ${petSystem.getCurrentState()}`);
  await delay(1000);

  // 测试鼠标离开
  console.log('\n🖱️ 模拟鼠标离开 (需要先回到悬浮状态)...');
  await petSystem.switchToState(PetState.Hover);
  await petSystem.onMouseLeave();
  console.log(`✅ 离开后状态: ${petSystem.getCurrentState()} (将在3秒后自动返回静态)`);
  await delay(3500);
  console.log(`✅ 延迟后状态: ${petSystem.getCurrentState()}`);
}

/**
 * 测试插件触发机制
 */
async function testPluginTriggerMechanism(petSystem: SaintGridPetSystem): Promise<void> {
  const states = [PetState.Hover, PetState.Awaken, PetState.Control, PetState.Idle];

  for (const state of states) {
    console.log(`\n🔌 在 ${state} 状态下测试插件触发:`);
    await petSystem.switchToState(state);
    
    // 等待插件触发完成
    await delay(1000);
    
    const emotionDetails = petSystem.getEmotionDetails();
    console.log(`📊 插件触发后情绪: ${emotionDetails.emotion} (强度: ${emotionDetails.intensity.toFixed(2)})`);
  }
}

/**
 * 测试情绪状态变化
 */
async function testEmotionChanges(petSystem: SaintGridPetSystem): Promise<void> {
  // 测试不同输入对情绪的影响
  const emotionTests = [
    { input: '我今天很开心！', expected: 'happy emotions' },
    { input: '截图', expected: 'focused emotions for work' },
    { input: '我有点累了', expected: 'tired/sleepy emotions' },
    { input: '哇！太棒了！', expected: 'excited emotions' },
    { input: '帮助', expected: 'curious emotions' }
  ];

  for (const test of emotionTests) {
    console.log(`\n💬 测试输入: "${test.input}"`);
    console.log(`🎯 预期效果: ${test.expected}`);
    
    const beforeEmotion = petSystem.getEmotionDetails();
    console.log(`😊 输入前情绪: ${beforeEmotion.emotion} (${beforeEmotion.intensity.toFixed(2)})`);
    
    await petSystem.handleUserInput(test.input);
    
    const afterEmotion = petSystem.getEmotionDetails();
    console.log(`😊 输入后情绪: ${afterEmotion.emotion} (${afterEmotion.intensity.toFixed(2)})`);
    
    await delay(1500);
  }
}

/**
 * 测试状态统计功能
 */
function testStateStatistics(petSystem: SaintGridPetSystem): void {
  const stats = petSystem.getStateStatistics();
  const history = petSystem.getStateHistory();
  
  console.log('📊 状态统计信息:');
  console.log(`📍 当前状态: ${stats.currentState}`);
  console.log(`📈 最频繁状态: ${stats.mostFrequentState}`);
  console.log(`📝 状态历史: ${history.join(' → ')}`);
  console.log(`🔢 状态频率:`, stats.stateFrequency);
  
  const availableActions = petSystem.getAvailableActions();
  console.log(`\n📋 当前可用操作:`);
  console.log(`🎭 当前状态: ${petSystem.getCurrentState()}`);
  console.log(`⚡ 可用操作: ${availableActions.join(', ')}`);
  console.log(`💬 描述: 基于当前状态和情绪的推荐操作`);
  console.log(`😊 当前情绪: ${petSystem.getCurrentEmotion()}`);
}

/**
 * 测试组合交互
 */
async function testCombinedInteractions(petSystem: SaintGridPetSystem): Promise<void> {
  console.log('🎪 模拟真实用户交互场景...\n');

  // 场景1：工作流程
  console.log('💼 场景1: 工作流程');
  await petSystem.onMouseHover();  // 鼠标悬浮
  await delay(500);
  await petSystem.onLeftClick();   // 点击唤醒
  await delay(500);
  await petSystem.handleUserInput('截图');  // 执行截图
  await delay(1000);
  await petSystem.handleUserInput('记录：完成了重要工作');  // 记录笔记
  await delay(1000);
  
  console.log('✅ 工作流程完成\n');

  // 场景2：设置配置
  console.log('⚙️ 场景2: 设置配置');
  await petSystem.onRightClick();  // 右键进入设置
  await delay(1000);
  await petSystem.handleUserInput('设置');  // 配置系统
  await delay(1000);
  
  console.log('✅ 设置配置完成\n');

  // 场景3：情绪交互
  console.log('😊 场景3: 情绪交互');
  await petSystem.handleUserInput('我今天心情很好！');  // 表达情绪
  await delay(1000);
  await petSystem.handleUserInput('帮我截个图庆祝一下');  // 情绪 + 功能
  await delay(1000);
  
  console.log('✅ 情绪交互完成\n');

  // 最终状态
  const finalStats = petSystem.getStateStatistics();
  const finalEmotion = petSystem.getCurrentEmotion();
  
  console.log('🎯 最终状态总结:');
  console.log(`📍 最终状态: ${finalStats.currentState}`);
  const finalEmotionDetails = petSystem.getEmotionDetails();
  console.log(`😊 最终情绪: ${finalEmotionDetails.emotion} (强度: ${finalEmotionDetails.intensity.toFixed(2)})`);
  console.log(`📈 状态变化次数: ${finalStats.stateHistory.length}`);
  console.log(`🏆 最常用状态: ${finalStats.mostFrequentState}`);
}

/**
 * 延迟函数
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 运行测试
if (typeof require !== 'undefined' && require.main === module) {
  main().catch(console.error);
}

export { main as runCompleteTest };
