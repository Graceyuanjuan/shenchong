/**
 * 测试 PetBrain 的 getStateStatistics() 方法
 * 验证状态历史、当前状态、最频繁状态和状态频率统计功能
 */

import { PetBrain } from './core/PetBrain';
import { PetState } from './types';

async function testStateStatistics() {
  console.log('🧪 ===== 状态统计测试开始 =====\n');
  
  // 1. 初始化主脑
  const brain = new PetBrain({
    defaultState: PetState.Idle,
    memoryLimit: 100
  });
  
  await brain.initialize();
  
  console.log('📊 ===== 测试 1: 初始状态统计 =====');
  let stats = brain.getStateStatistics();
  console.log('初始统计结果:', JSON.stringify(stats, null, 2));
  console.log('');
  
  // 2. 执行一系列状态变化
  console.log('📊 ===== 测试 2: 模拟用户交互序列 =====');
  
  // 模拟鼠标悬浮
  console.log('🖱️ 模拟鼠标悬浮...');
  await brain.onMouseHover();
  
  // 模拟点击唤醒
  console.log('👆 模拟左键点击...');
  await brain.onLeftClick();
  
  // 模拟右键设置
  console.log('👆 模拟右键点击...');
  await brain.onRightClick();
  
  // 回到静态
  console.log('💤 回到静态状态...');
  await brain.enterIdleState();
  
  // 再次悬浮和唤醒
  console.log('🔄 再次悬浮和唤醒...');
  await brain.enterHoverState();
  await brain.enterAwakenState();
  
  // 获取统计信息
  console.log('\n📈 ===== 交互后的状态统计 =====');
  stats = brain.getStateStatistics();
  console.log('');
  
  // 3. 测试频繁状态切换
  console.log('📊 ===== 测试 3: 频繁状态切换模拟 =====');
  console.log('模拟用户频繁在 Idle 和 Hover 之间切换...');
  
  for (let i = 0; i < 5; i++) {
    await brain.enterIdleState();
    await brain.enterHoverState();
  }
  
  console.log('模拟用户多次使用 Awaken 功能...');
  for (let i = 0; i < 3; i++) {
    await brain.enterAwakenState();
    await brain.enterHoverState();
  }
  
  // 最终统计
  console.log('\n📈 ===== 最终状态统计 =====');
  stats = brain.getStateStatistics();
  
  // 4. 详细分析统计结果
  console.log('\n🔍 ===== 统计分析报告 =====');
  console.log(`📌 当前状态: ${stats.currentState}`);
  console.log(`🏆 最频繁状态: ${stats.mostFrequentState}`);
  console.log(`📜 状态历史长度: ${stats.stateHistory.length}`);
  console.log(`📊 状态历史序列: [${stats.stateHistory.join(' → ')}]`);
  
  console.log('\n📊 状态频率详细分析:');
  const totalStates = stats.stateHistory.length;
  Object.entries(stats.stateFrequency).forEach(([state, count]) => {
    const percentage = totalStates > 0 ? ((count / totalStates) * 100).toFixed(1) : '0.0';
    console.log(`   🎯 ${state}: ${count} 次 (${percentage}%)`);
  });
  
  // 5. 验证数据一致性
  console.log('\n✅ ===== 数据一致性验证 =====');
  
  // 验证当前状态
  const actualCurrentState = brain.getCurrentState();
  console.log(`当前状态一致性: ${stats.currentState === actualCurrentState ? '✅ 通过' : '❌ 失败'}`);
  
  // 验证频率计算
  const calculatedTotal = Object.values(stats.stateFrequency).reduce((sum, count) => sum + count, 0);
  const expectedTotal = stats.stateHistory.length;
  console.log(`频率统计一致性: ${calculatedTotal >= expectedTotal ? '✅ 通过' : '❌ 失败'} (计算总数: ${calculatedTotal}, 预期: ${expectedTotal})`);
  
  // 验证最频繁状态
  const maxCount = Math.max(...Object.values(stats.stateFrequency));
  const statesWithMaxCount = Object.entries(stats.stateFrequency)
    .filter(([, count]) => count === maxCount)
    .map(([state]) => state);
  console.log(`最频繁状态验证: ${statesWithMaxCount.includes(stats.mostFrequentState) ? '✅ 通过' : '❌ 失败'}`);
  
  // 6. 展示系统整体状态
  console.log('\n🎯 ===== 系统整体状态 =====');
  const systemStatus = brain.getSystemStatus();
  console.log(`💼 当前状态: ${systemStatus.state}`);
  console.log(`😊 当前情绪: ${systemStatus.emotion}`);
  console.log(`🔌 插件数量: ${systemStatus.pluginCount}`);
  console.log(`💾 内存使用: ${JSON.stringify(systemStatus.memoryUsage)}`);
  console.log(`⏱️ 运行时间: ${(systemStatus.uptime / 1000).toFixed(2)} 秒`);
  
  // 7. 测试边界情况
  console.log('\n🧪 ===== 边界情况测试 =====');
  
  // 测试重复状态切换（应该不增加历史）
  const beforeState = brain.getCurrentState();
  console.log(`当前状态: ${beforeState}`);
  await brain.handleStateChange(beforeState); // 切换到相同状态
  
  const afterStats = brain.getStateStatistics();
  console.log(`重复状态切换测试: ${stats.stateHistory.length === afterStats.stateHistory.length ? '✅ 通过' : '❌ 失败'}`);
  
  // 8. 性能测试
  console.log('\n⚡ ===== 性能测试 =====');
  const startTime = Date.now();
  
  for (let i = 0; i < 100; i++) {
    brain.getStateStatistics();
  }
  
  const endTime = Date.now();
  const avgTime = (endTime - startTime) / 100;
  console.log(`getStateStatistics() 平均执行时间: ${avgTime.toFixed(2)} ms`);
  console.log(`性能测试: ${avgTime < 10 ? '✅ 通过 (< 10ms)' : '⚠️ 需要优化'}`);
  
  console.log('\n🏁 ===== 状态统计测试完成 =====');
  
  // 清理资源
  await brain.destroy();
}

// 运行测试
if (require.main === module) {
  testStateStatistics().catch(console.error);
}

export { testStateStatistics };
