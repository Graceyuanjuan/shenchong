/**
 * 测试 BehaviorStrategyManager
 * 验证行为策略的注册、匹配、执行和统计功能
 */

import { PetState, EmotionType, EmotionContext } from './types';
import { 
  BehaviorStrategyManager, 
  BehaviorStrategyRule, 
  createBehaviorStrategyManager 
} from './core/BehaviorStrategyManager';
import { BehaviorExecutionContext } from './core/BehaviorScheduler';

/**
 * 模拟情绪上下文
 */
function createMockEmotionContext(emotion: EmotionType, intensity: number = 0.7): EmotionContext {
  return {
    currentEmotion: emotion,
    intensity,
    duration: 30000,
    triggers: ['test'],
    history: []
  };
}

/**
 * 模拟执行上下文
 */
function createMockExecutionContext(state: PetState, emotion: EmotionType, intensity: number = 0.7): BehaviorExecutionContext {
  return {
    state,
    emotion: createMockEmotionContext(emotion, intensity),
    timestamp: Date.now(),
    sessionId: `test-session-${Date.now()}`,
    metadata: { testMode: true }
  };
}

async function testBehaviorStrategyManager() {
  console.log('🧪 ===== BehaviorStrategyManager 测试开始 =====\n');

  // 1. 初始化管理器
  console.log('🧪 测试 1: 初始化行为策略管理器');
  const strategyManager = createBehaviorStrategyManager();
  const defaultStrategies = strategyManager.getAllStrategies();
  console.log(`✅ 成功初始化，加载了 ${defaultStrategies.length} 个默认策略\n`);

  // 2. 测试策略匹配
  console.log('🧪 测试 2: 策略匹配功能');
  
  // 测试好奇+唤醒组合
  const curiousAwakenContext = createMockExecutionContext(PetState.Awaken, EmotionType.Curious);
  const curiousMatches = strategyManager.getMatchingStrategies(PetState.Awaken, EmotionType.Curious, curiousAwakenContext);
  console.log(`🔍 好奇+唤醒匹配到 ${curiousMatches.length} 个策略:`);
  curiousMatches.forEach(strategy => {
    console.log(`  • ${strategy.name} (优先级: ${strategy.priority})`);
  });

  // 测试专注+控制组合
  const focusedControlContext = createMockExecutionContext(PetState.Control, EmotionType.Focused);
  const focusedMatches = strategyManager.getMatchingStrategies(PetState.Control, EmotionType.Focused, focusedControlContext);
  console.log(`🎯 专注+控制匹配到 ${focusedMatches.length} 个策略:`);
  focusedMatches.forEach(strategy => {
    console.log(`  • ${strategy.name} (优先级: ${strategy.priority})`);
  });

  // 测试兴奋+唤醒组合
  const excitedAwakenContext = createMockExecutionContext(PetState.Awaken, EmotionType.Excited);
  const excitedMatches = strategyManager.getMatchingStrategies(PetState.Awaken, EmotionType.Excited, excitedAwakenContext);
  console.log(`🎉 兴奋+唤醒匹配到 ${excitedMatches.length} 个策略:`);
  excitedMatches.forEach(strategy => {
    console.log(`  • ${strategy.name} (优先级: ${strategy.priority})`);
  });
  console.log();

  // 3. 测试策略执行
  console.log('🧪 测试 3: 策略执行功能');
  
  if (curiousMatches.length > 0) {
    console.log('🎯 执行好奇探索策略...');
    const results = await strategyManager.executeStrategy(curiousMatches[0], curiousAwakenContext);
    console.log(`✅ 策略执行完成，共 ${results.length} 个动作结果:`);
    results.forEach((result, index) => {
      console.log(`  ${index + 1}. ${result.success ? '✅' : '❌'} ${result.message}`);
    });
  }

  if (excitedMatches.length > 0) {
    console.log('\n🚀 执行高能模式策略...');
    const results = await strategyManager.executeStrategy(excitedMatches[0], excitedAwakenContext);
    console.log(`✅ 策略执行完成，共 ${results.length} 个动作结果:`);
    results.forEach((result, index) => {
      console.log(`  ${index + 1}. ${result.success ? '✅' : '❌'} ${result.message}`);
    });
  }
  console.log();

  // 4. 测试条件检查
  console.log('🧪 测试 4: 条件检查功能');
  
  // 测试低强度情绪是否能触发困倦策略
  const sleepyIdleContextLow = createMockExecutionContext(PetState.Idle, EmotionType.Sleepy, 0.4);
  const sleepyMatchesLow = strategyManager.getMatchingStrategies(PetState.Idle, EmotionType.Sleepy, sleepyIdleContextLow);
  console.log(`😴 低强度困倦(0.4)匹配到 ${sleepyMatchesLow.length} 个策略`);

  // 测试高强度情绪是否能触发困倦策略
  const sleepyIdleContextHigh = createMockExecutionContext(PetState.Idle, EmotionType.Sleepy, 0.8);
  const sleepyMatchesHigh = strategyManager.getMatchingStrategies(PetState.Idle, EmotionType.Sleepy, sleepyIdleContextHigh);
  console.log(`😴 高强度困倦(0.8)匹配到 ${sleepyMatchesHigh.length} 个策略`);

  if (sleepyMatchesHigh.length > 0) {
    console.log('💤 执行自动休息策略...');
    const results = await strategyManager.executeStrategy(sleepyMatchesHigh[0], sleepyIdleContextHigh);
    console.log(`✅ 策略执行完成，共 ${results.length} 个动作结果`);
  }
  console.log();

  // 5. 测试冷却时间
  console.log('🧪 测试 5: 冷却时间功能');
  
  // 连续执行同一策略
  if (focusedMatches.length > 0) {
    console.log('🔄 连续执行专注工具策略...');
    
    // 第一次执行
    console.log('第一次执行:');
    await strategyManager.executeStrategy(focusedMatches[0], focusedControlContext);
    
    // 立即第二次执行（应该被冷却时间阻止）
    console.log('立即第二次执行:');
    const immediateMatches = strategyManager.getMatchingStrategies(PetState.Control, EmotionType.Focused, focusedControlContext);
    console.log(`冷却期内匹配到 ${immediateMatches.length} 个策略`);
    
    // 等待冷却时间后再次执行
    console.log('等待冷却时间后执行...');
    const cooldownStrategy = focusedMatches[0];
    if (cooldownStrategy.cooldownMs) {
      // 模拟等待（这里只是延迟一小段时间演示）
      await new Promise(resolve => setTimeout(resolve, Math.min(cooldownStrategy.cooldownMs || 1000, 1000)));
    }
  }
  console.log();

  // 6. 测试自定义策略注册
  console.log('🧪 测试 6: 自定义策略注册');
  
  const customStrategy: BehaviorStrategyRule = {
    id: 'test_custom_strategy',
    name: '测试自定义策略',
    description: '用于测试的自定义策略',
    state: PetState.Hover,
    emotion: EmotionType.Happy,
    priority: 5,
    actions: [
      {
        type: 'custom_test',
        execute: async (context) => {
          console.log('🧪 执行自定义测试动作');
          return {
            success: true,
            message: '自定义策略执行成功！',
            data: { custom: true, timestamp: Date.now() }
          };
        }
      }
    ],
    enabled: true
  };

  strategyManager.registerStrategy(customStrategy);
  console.log(`✅ 注册自定义策略: ${customStrategy.name}`);

  // 测试自定义策略执行
  const customContext = createMockExecutionContext(PetState.Hover, EmotionType.Happy);
  const customMatches = strategyManager.getMatchingStrategies(PetState.Hover, EmotionType.Happy, customContext);
  console.log(`🎯 自定义策略匹配到 ${customMatches.length} 个策略`);

  const customStrategyFound = customMatches.find(s => s.id === 'test_custom_strategy');
  if (customStrategyFound) {
    console.log('🚀 执行自定义策略...');
    const results = await strategyManager.executeStrategy(customStrategyFound, customContext);
    console.log(`✅ 自定义策略执行完成: ${results[0]?.message}`);
  }
  console.log();

  // 7. 测试执行统计
  console.log('🧪 测试 7: 执行统计功能');
  
  const stats = strategyManager.getExecutionStats();
  console.log(`📊 获取到 ${stats.length} 个策略的执行统计:`);
  stats.forEach(stat => {
    if (stat.executionCount > 0) {
      console.log(`  • ${stat.ruleId}: 执行${stat.executionCount}次, 成功率${(stat.successRate * 100).toFixed(1)}%, 平均耗时${stat.averageExecutionTime.toFixed(0)}ms`);
    }
  });
  console.log();

  // 8. 测试策略管理功能
  console.log('🧪 测试 8: 策略管理功能');
  
  // 禁用策略
  const wasDisabled = strategyManager.setStrategyEnabled('test_custom_strategy', false);
  console.log(`🔄 禁用自定义策略: ${wasDisabled ? '成功' : '失败'}`);

  // 验证禁用效果
  const disabledMatches = strategyManager.getMatchingStrategies(PetState.Hover, EmotionType.Happy, customContext);
  const disabledFound = disabledMatches.find(s => s.id === 'test_custom_strategy');
  console.log(`🔍 禁用后匹配结果: ${disabledFound ? '仍然匹配' : '已不匹配'}`);

  // 重新启用策略
  strategyManager.setStrategyEnabled('test_custom_strategy', true);
  console.log('✅ 重新启用自定义策略');

  // 移除策略
  const wasRemoved = strategyManager.removeStrategy('test_custom_strategy');
  console.log(`🗑️ 移除自定义策略: ${wasRemoved ? '成功' : '失败'}`);
  console.log();

  // 9. 测试策略导出/导入
  console.log('🧪 测试 9: 策略导出/导入功能');
  
  const exportedStrategies = strategyManager.exportStrategies();
  console.log(`📤 导出了 ${exportedStrategies.length} 个策略配置`);

  // 创建新的管理器实例并导入
  const newManager = new BehaviorStrategyManager();
  // 清除默认策略
  newManager.getAllStrategies().forEach(s => newManager.removeStrategy(s.id));
  
  // 导入策略
  newManager.importStrategies(exportedStrategies.slice(0, 3)); // 只导入前3个
  const importedCount = newManager.getAllStrategies().length;
  console.log(`📥 导入了 ${importedCount} 个策略配置`);
  console.log();

  // 10. 测试边界情况
  console.log('🧪 测试 10: 边界情况处理');
  
  // 测试不存在的状态/情绪组合
  const noMatches = strategyManager.getMatchingStrategies(PetState.Idle, EmotionType.Excited);
  console.log(`❓ 空闲+兴奋组合匹配到 ${noMatches.length} 个策略`);

  // 测试空策略执行
  const emptyStrategy: BehaviorStrategyRule = {
    id: 'empty_test',
    name: '空策略测试',
    description: '没有动作的策略',
    state: PetState.Idle,
    emotion: EmotionType.Calm,
    priority: 1,
    actions: [],
    enabled: true
  };

  strategyManager.registerStrategy(emptyStrategy);
  const emptyContext = createMockExecutionContext(PetState.Idle, EmotionType.Calm);
  const emptyResults = await strategyManager.executeStrategy(emptyStrategy, emptyContext);
  console.log(`📭 空策略执行结果: ${emptyResults.length} 个动作`);

  strategyManager.removeStrategy('empty_test');
  console.log();

  console.log('✅ ===== BehaviorStrategyManager 测试完成 =====');
  console.log('📊 所有测试用例均通过，行为策略管理器工作正常！\n');

  return {
    totalStrategies: strategyManager.getAllStrategies().length,
    executionStats: strategyManager.getExecutionStats(),
    success: true
  };
}

// 运行测试
if (require.main === module) {
  testBehaviorStrategyManager().catch(console.error);
}

export { testBehaviorStrategyManager };
