/**
 * 测试 PetBrainBridge 集成功能
 * 验证桥接器的所有调度方法、情绪上下文解析和事件驱动机制
 */

import { PetState, EmotionType } from './types';
import { 
  PetBrainBridge, 
  createPetBrainBridge, 
  BridgeEventType,
  PetBrainBridgeConfig,
  BridgeEventData
} from './core/PetBrainBridge';
import { EmotionEngine } from './core/EmotionEngine';
import { PluginRegistry } from './core/PluginRegistry';

/**
 * 模拟 EmotionEngine 类（用于测试）
 */
class MockEmotionEngine {
  private currentEmotion: EmotionType = EmotionType.Calm;
  private intensity: number = 0.7;

  getCurrentEmotion() {
    return {
      currentEmotion: this.currentEmotion,
      intensity: this.intensity,
      duration: 30000,
      triggers: ['test'],
      history: []
    };
  }

  setEmotion(emotion: EmotionType, intensity: number = 0.7) {
    this.currentEmotion = emotion;
    this.intensity = intensity;
    console.log(`🧠 [MockEmotionEngine] 情绪设置为: ${emotion} (强度: ${intensity})`);
  }

  // 模拟其他必要的方法
  analyzeInputEmotion() { return { emotion: EmotionType.Calm, intensity: 0.5, sentiment: 'neutral' as const }; }
  updateMoodFactors() {}
  getEmotionHistory() { return []; }
}

/**
 * 模拟 PluginRegistry 类（用于测试）
 */
class MockPluginRegistry {
  private plugins: string[] = ['screenshot', 'note', 'search'];

  async triggerByState(state: PetState, emotion: EmotionType, context: any) {
    console.log(`🔌 [MockPluginRegistry] 状态触发: ${state} | 情绪: ${emotion} | 上下文:`, context);
    return {
      success: true,
      triggered: true,
      plugins: this.plugins,
      mockResponse: `模拟插件执行成功 - ${state}:${emotion}`
    };
  }

  async executePlugin(pluginId: string, params: any) {
    console.log(`🔌 [MockPluginRegistry] 执行插件: ${pluginId}`, params);
    return {
      success: true,
      pluginId,
      result: `插件 ${pluginId} 执行成功`,
      mockData: params
    };
  }

  getRegisteredPlugins() {
    return this.plugins;
  }
}

/**
 * 主测试函数
 */
async function testPetBrainBridge() {
  console.log('🧪 ===== PetBrainBridge 集成测试开始 =====\n');

  // 创建模拟依赖
  const mockEmotionEngine = new MockEmotionEngine();
  const mockPluginRegistry = new MockPluginRegistry();

  // 测试 1: 基础桥接器创建和初始化
  console.log('🧪 测试 1: 桥接器创建和初始化');
  const bridgeConfig: PetBrainBridgeConfig = {
    enableEventDriven: true,
    enableLogging: true,
    autoEmotionUpdate: true,
    defaultEmotionIntensity: 0.8,
    bridgeId: 'test-bridge-001'
  };

  const bridge = new PetBrainBridge(bridgeConfig);
  
  // 显示初始状态
  console.log('📊 初始状态:', bridge.getStats());

  // 初始化桥接器
  await bridge.initPetBrainBridge(mockEmotionEngine as any, mockPluginRegistry as any);
  
  console.log('📊 初始化后状态:', bridge.getStats());
  console.log('');

  // 测试 2: 事件监听器设置
  console.log('🧪 测试 2: 事件监听器设置');
  
  bridge.on(BridgeEventType.STATE_CHANGED, (data: BridgeEventData) => {
    console.log('📡 [事件] 状态变化:', data.data);
  });
  
  bridge.on(BridgeEventType.EMOTION_CHANGED, (data: BridgeEventData) => {
    console.log('📡 [事件] 情绪变化:', data.data);
  });
  
  bridge.on(BridgeEventType.BEHAVIOR_DISPATCHED, (data: BridgeEventData) => {
    console.log('📡 [事件] 行为调度:', {
      state: data.data.state,
      emotion: data.data.emotion,
      behaviorCount: data.data.result.executedBehaviors.length,
      executionTime: data.data.executionTime
    });
  });

  bridge.on(BridgeEventType.ERROR_OCCURRED, (data: BridgeEventData) => {
    console.log('📡 [事件] 错误发生:', data.data);
  });

  console.log('✅ 事件监听器设置完成\n');

  // 测试 3: 自动情绪获取调度
  console.log('🧪 测试 3: 自动情绪获取调度 (dispatch)');
  
  mockEmotionEngine.setEmotion(EmotionType.Happy, 0.9);
  
  const result1 = await bridge.dispatch(PetState.Awaken);
  console.log('✅ 调度结果 1:', {
    success: result1.success,
    behaviorCount: result1.executedBehaviors.length,
    duration: result1.duration
  });
  console.log('');

  // 测试 4: 手动指定情绪调度
  console.log('🧪 测试 4: 手动指定情绪调度 (dispatchWithEmotion)');
  
  const result2 = await bridge.dispatchWithEmotion(PetState.Control, EmotionType.Focused);
  console.log('✅ 调度结果 2:', {
    success: result2.success,
    behaviorCount: result2.executedBehaviors.length,
    duration: result2.duration
  });
  console.log('');

  // 测试 5: 核心调度方法测试
  console.log('🧪 测试 5: 核心调度方法 (dispatchPetBehavior)');
  
  const customContext = {
    currentState: PetState.Hover,
    emotion: {
      currentEmotion: EmotionType.Curious,
      intensity: 0.8,
      duration: 45000,
      triggers: ['test_trigger'],
      history: []
    },
    userPreferences: {
      animation_speed: 'fast',
      sound_enabled: true
    },
    interaction: {
      type: 'active' as const,
      trigger: 'manual' as const,
      timestamp: Date.now()
    }
  };

  const result3 = await bridge.dispatchPetBehavior(PetState.Hover, EmotionType.Curious, customContext);
  console.log('✅ 调度结果 3:', {
    success: result3.success,
    behaviorCount: result3.executedBehaviors.length,
    duration: result3.duration
  });
  console.log('');

  // 测试 6: 事件驱动调度
  console.log('🧪 测试 6: 事件驱动调度 (dispatchEvent)');
  
  // 测试预定义事件
  console.log('🔸 测试预定义事件:');
  const events = [
    'user_interaction',
    'user_click', 
    'work_mode',
    'sleep_mode'
  ];

  for (const event of events) {
    try {
      const result = await bridge.dispatchEvent(event);
      console.log(`  📡 ${event}: ${result?.success ? '✅' : '❌'} (${result?.executedBehaviors.length || 0} 行为)`);
    } catch (error) {
      console.log(`  📡 ${event}: ❌ 错误 - ${error}`);
    }
  }

  // 测试自定义格式事件
  console.log('🔸 测试自定义格式事件:');
  const customEvents = [
    'idle:sleepy',
    'control:focused',
    'awaken:excited',
    'hover:curious'
  ];

  for (const event of customEvents) {
    try {
      const result = await bridge.dispatchEvent(event);
      console.log(`  📡 ${event}: ${result?.success ? '✅' : '❌'} (${result?.executedBehaviors.length || 0} 行为)`);
    } catch (error) {
      console.log(`  📡 ${event}: ❌ 错误 - ${error}`);
    }
  }

  // 测试单独状态/情绪事件
  console.log('🔸 测试单独状态/情绪事件:');
  const singleEvents = ['idle', 'happy', 'excited', 'control'];
  
  for (const event of singleEvents) {
    try {
      const result = await bridge.dispatchEvent(event);
      console.log(`  📡 ${event}: ${result?.success ? '✅' : '❌'} (${result?.executedBehaviors.length || 0} 行为)`);
    } catch (error) {
      console.log(`  📡 ${event}: ❌ 错误 - ${error}`);
    }
  }

  console.log('');

  // 测试 7: 状态和情绪变化检测
  console.log('🧪 测试 7: 状态和情绪变化检测');
  
  console.log('🔸 第一次调度 (建立基线):');
  await bridge.dispatchWithEmotion(PetState.Idle, EmotionType.Calm);
  
  console.log('🔸 状态变化 (Idle → Hover):');
  await bridge.dispatchWithEmotion(PetState.Hover, EmotionType.Calm);
  
  console.log('🔸 情绪变化 (Calm → Excited):');
  await bridge.dispatchWithEmotion(PetState.Hover, EmotionType.Excited);
  
  console.log('🔸 状态+情绪双重变化 (Hover:Excited → Control:Focused):');
  await bridge.dispatchWithEmotion(PetState.Control, EmotionType.Focused);
  
  console.log('');

  // 测试 8: 统计信息和状态查询
  console.log('🧪 测试 8: 统计信息和状态查询');
  
  const finalStats = bridge.getStats();
  console.log('📊 最终统计信息:', {
    dispatchCount: finalStats.dispatchCount,
    lastState: finalStats.lastState,
    lastEmotion: finalStats.lastEmotion,
    hasEmotionEngine: finalStats.hasEmotionEngine,
    hasPluginRegistry: finalStats.hasPluginRegistry,
    strategiesCount: finalStats.strategies.length
  });

  console.log('📋 可用策略列表:');
  finalStats.strategies.forEach((strategy: any) => {
    console.log(`  • ${strategy.name}: ${strategy.description} (优先级: ${strategy.priority})`);
  });

  console.log('');

  // 测试 9: 工厂函数测试
  console.log('🧪 测试 9: 工厂函数测试');
  
  const factoryBridge = await createPetBrainBridge(
    mockEmotionEngine as any,
    mockPluginRegistry as any,
    { 
      bridgeId: 'factory-bridge',
      enableLogging: false 
    }
  );

  const factoryResult = await factoryBridge.dispatch(PetState.Awaken);
  console.log('✅ 工厂创建的桥接器调度成功:', factoryResult.success);
  console.log('');

  // 测试 10: 错误处理测试
  console.log('🧪 测试 10: 错误处理测试');
  
  try {
    // 测试未初始化桥接器
    const uninitializedBridge = new PetBrainBridge();
    await uninitializedBridge.dispatch(PetState.Idle);
  } catch (error) {
    console.log('✅ 未初始化桥接器错误处理正确:', error instanceof Error ? error.message : '未知错误');
  }

  try {
    // 测试无效事件
    await bridge.dispatchEvent('invalid:unknown:event');
  } catch (error) {
    console.log('✅ 无效事件错误处理正确:', error instanceof Error ? error.message : '未知错误');
  }

  console.log('');

  // 测试 11: 重置和清理
  console.log('🧪 测试 11: 重置和清理');
  
  console.log('🔸 重置前统计:', bridge.getStats().dispatchCount);
  bridge.reset();
  console.log('🔸 重置后统计:', bridge.getStats().dispatchCount);
  
  // 最终清理
  bridge.destroy();
  console.log('✅ 桥接器已销毁');

  console.log('\n✅ ===== PetBrainBridge 集成测试完成 =====');
}

/**
 * 性能测试函数
 */
async function performanceTest() {
  console.log('\n🚀 ===== PetBrainBridge 性能测试开始 =====');

  const mockEmotionEngine = new MockEmotionEngine();
  const mockPluginRegistry = new MockPluginRegistry();

  const bridge = await createPetBrainBridge(
    mockEmotionEngine as any,
    mockPluginRegistry as any,
    { enableLogging: false }
  );

  const states = [PetState.Idle, PetState.Hover, PetState.Awaken, PetState.Control];
  const emotions = [EmotionType.Happy, EmotionType.Calm, EmotionType.Excited, EmotionType.Curious, EmotionType.Sleepy, EmotionType.Focused];

  const testCount = 50;
  const startTime = Date.now();

  console.log(`🧪 执行 ${testCount} 次随机调度...`);

  for (let i = 0; i < testCount; i++) {
    const randomState = states[Math.floor(Math.random() * states.length)];
    const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
    
    await bridge.dispatchWithEmotion(randomState, randomEmotion);
  }

  const endTime = Date.now();
  const totalTime = endTime - startTime;
  const avgTime = totalTime / testCount;

  console.log(`✅ 性能测试完成:`);
  console.log(`  📊 总调度次数: ${testCount}`);
  console.log(`  ⏱️ 总执行时间: ${totalTime}ms`);
  console.log(`  📈 平均执行时间: ${avgTime.toFixed(2)}ms/次`);
  console.log(`  🚀 调度频率: ${(1000 / avgTime).toFixed(2)} 次/秒`);

  bridge.destroy();
  console.log('\n✅ ===== PetBrainBridge 性能测试完成 =====');
}

/**
 * 运行所有测试
 */
async function runAllTests() {
  try {
    await testPetBrainBridge();
    await performanceTest();
  } catch (error) {
    console.error('❌ 测试执行失败:', error);
  }
}

// 执行测试
runAllTests().catch(console.error);
