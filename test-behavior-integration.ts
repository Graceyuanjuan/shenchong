/**
 * 测试行为调度集成器和策略系统
 */

import { PetState, EmotionType } from './dist/types';
import { createBehaviorSchedulingManager, EventDrivenBehaviorScheduler, BehaviorScheduleEvent } from './dist/core/BehaviorSchedulingIntegrator';
import { BaseBehaviorStrategy, StrategyContext, IBehaviorStrategy } from './dist/core/BehaviorStrategy';
import { BehaviorType, BehaviorDefinition } from './dist/core/BehaviorScheduler';

// 自定义策略示例
class CustomWorkModeStrategy extends BaseBehaviorStrategy {
  name = 'CustomWorkMode';
  description = '自定义工作模式策略';
  priority = 9;
  
  canApply(context: StrategyContext): boolean {
    // 当用户在工作时间且处于专注状态时触发
    const isWorkHours = context.environmentFactors?.timeOfDay === 'morning' || 
                       context.environmentFactors?.timeOfDay === 'afternoon';
    return isWorkHours && context.emotion === EmotionType.Focused && context.state === PetState.Control;
  }
  
  generateBehaviors(context: StrategyContext): BehaviorDefinition[] {
    return [
      {
        type: BehaviorType.PLUGIN_TRIGGER,
        priority: 10,
        duration: 500,
        message: '🚀 进入高效工作模式！',
        pluginId: 'screenshot',
        metadata: { 
          mode: 'work_boost',
          autoTrigger: true,
          workSession: true
        }
      },
      {
        type: BehaviorType.SYSTEM_NOTIFICATION,
        priority: 8,
        delay: 1000,
        message: '💪 专注模式已激活，建议关闭干扰源',
        metadata: { notificationType: 'productivity_tip' }
      }
    ];
  }
}

// 模拟情绪引擎
class MockEmotionEngine {
  private currentEmotion = EmotionType.Calm;
  private intensity = 0.5;
  
  getCurrentContext() {
    return {
      currentEmotion: this.currentEmotion,
      intensity: this.intensity,
      duration: 30000,
      triggers: ['test'],
      history: []
    };
  }
  
  setEmotion(emotion: EmotionType, intensity: number) {
    this.currentEmotion = emotion;
    this.intensity = intensity;
  }
}

// 模拟插件注册器
class MockPluginRegistry {
  async triggerByState(state: PetState, emotion: EmotionType, context: any) {
    console.log(`📝 [MockPlugin] 状态触发: ${state} | 情绪: ${emotion} | 上下文:`, context);
    return { success: true, triggered: true, mockResponse: '模拟插件执行成功' };
  }
  
  async executePlugin(pluginId: string, context: any) {
    console.log(`📝 [MockPlugin] 执行插件: ${pluginId} | 上下文:`, context);
    return { success: true, pluginId, executed: true, mockResponse: '模拟特定插件执行成功' };
  }
}

async function testBehaviorSchedulingIntegration() {
  console.log('🧪 ===== 行为调度集成测试开始 =====\n');
  
  // 创建模拟依赖
  const mockEmotionEngine = new MockEmotionEngine();
  const mockPluginRegistry = new MockPluginRegistry();
  
  // 创建行为调度管理器
  const schedulingManager = createBehaviorSchedulingManager(mockEmotionEngine, mockPluginRegistry);
  
  console.log('📋 当前可用策略:');
  schedulingManager.getStrategies().forEach(strategy => {
    console.log(`  • ${strategy.name}: ${strategy.description} (优先级: ${strategy.priority})`);
  });
  console.log();
  
  // 注册自定义策略
  console.log('🎯 注册自定义策略...');
  schedulingManager.registerStrategy(new CustomWorkModeStrategy());
  console.log();
  
  // 测试场景1：空闲状态 + 开心情绪
  console.log('🎭 场景1: 空闲状态 + 开心情绪');
  mockEmotionEngine.setEmotion(EmotionType.Happy, 0.8);
  const result1 = await schedulingManager.schedule(PetState.Idle, EmotionType.Happy);
  console.log('结果:', result1.success ? '✅ 成功' : '❌ 失败', `| 执行了 ${result1.executedBehaviors.length} 个行为`);
  console.log();
  
  // 测试场景2：悬停状态 + 兴奋情绪
  console.log('🎭 场景2: 悬停状态 + 兴奋情绪');
  mockEmotionEngine.setEmotion(EmotionType.Excited, 0.9);
  const result2 = await schedulingManager.schedule(PetState.Hover, EmotionType.Excited);
  console.log('结果:', result2.success ? '✅ 成功' : '❌ 失败', `| 执行了 ${result2.executedBehaviors.length} 个行为`);
  console.log();
  
  // 测试场景3：唤醒状态 + 好奇情绪
  console.log('🎭 场景3: 唤醒状态 + 好奇情绪');
  mockEmotionEngine.setEmotion(EmotionType.Curious, 0.7);
  const result3 = await schedulingManager.schedule(PetState.Awaken, EmotionType.Curious);
  console.log('结果:', result3.success ? '✅ 成功' : '❌ 失败', `| 执行了 ${result3.executedBehaviors.length} 个行为`);
  console.log();
  
  // 测试场景4：控制状态 + 专注情绪（触发自定义策略）
  console.log('🎭 场景4: 控制状态 + 专注情绪 (自定义策略)');
  mockEmotionEngine.setEmotion(EmotionType.Focused, 0.8);
  const result4 = await schedulingManager.schedule(PetState.Control, EmotionType.Focused);
  console.log('结果:', result4.success ? '✅ 成功' : '❌ 失败', `| 执行了 ${result4.executedBehaviors.length} 个行为`);
  console.log();
  
  // 测试情绪变化调度
  console.log('🎭 场景5: 情绪变化调度 (平静 -> 兴奋)');
  const emotionScheduler = schedulingManager as any;
  if (emotionScheduler.scheduleByEmotionChange) {
    const result5 = await emotionScheduler.scheduleByEmotionChange(
      EmotionType.Calm, 
      EmotionType.Excited, 
      PetState.Idle
    );
    console.log('结果:', result5.success ? '✅ 成功' : '❌ 失败', `| 执行了 ${result5.executedBehaviors.length} 个行为`);
  }
  console.log();
  
  // 测试状态变化调度
  console.log('🎭 场景6: 状态变化调度 (空闲 -> 控制)');
  if (emotionScheduler.scheduleByStateChange) {
    const result6 = await emotionScheduler.scheduleByStateChange(
      PetState.Idle,
      PetState.Control,
      EmotionType.Happy
    );
    console.log('结果:', result6.success ? '✅ 成功' : '❌ 失败', `| 执行了 ${result6.executedBehaviors.length} 个行为`);
  }
  console.log();
  
  console.log('✅ ===== 行为调度集成测试完成 =====');
}

async function testEventDrivenScheduler() {
  console.log('\n🧪 ===== 事件驱动调度器测试开始 =====\n');
  
  const mockEmotionEngine = new MockEmotionEngine();
  const mockPluginRegistry = new MockPluginRegistry();
  
  const eventScheduler = new EventDrivenBehaviorScheduler(mockEmotionEngine, mockPluginRegistry);
  
  // 监听事件
  eventScheduler.on(BehaviorScheduleEvent.SCHEDULE_STARTED, (data) => {
    console.log('📡 [Event] 调度开始:', data.state, data.emotion);
  });
  
  eventScheduler.on(BehaviorScheduleEvent.SCHEDULE_COMPLETED, (data) => {
    console.log('📡 [Event] 调度完成:', data.result.success ? '✅' : '❌', `执行了 ${data.result.executedBehaviors.length} 个行为`);
  });
  
  // 测试事件驱动调度
  console.log('🎭 测试事件驱动调度...');
  await eventScheduler.schedule(PetState.Awaken, EmotionType.Happy);
  
  console.log('\n✅ ===== 事件驱动调度器测试完成 =====');
}

// 运行测试
async function runAllTests() {
  try {
    await testBehaviorSchedulingIntegration();
    await testEventDrivenScheduler();
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

runAllTests();
