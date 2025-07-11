/**
 * SaintGrid 神宠系统 - 行为调度器测试脚本
 * 测试典型状态情绪组合的行为调度功能
 */

import { BehaviorScheduler, BehaviorType } from './src/core/BehaviorScheduler';
import { PetState, EmotionType, PluginContext } from './src/types';

/**
 * 测试辅助类
 */
class BehaviorSchedulerTest {
  private scheduler: BehaviorScheduler;
  private testResults: Map<string, boolean> = new Map();

  constructor() {
    this.scheduler = new BehaviorScheduler();
  }

  /**
   * 运行所有测试
   */
  async runAllTests(): Promise<void> {
    console.log('🧪 ===== BehaviorScheduler 测试开始 =====\n');

    // 基础状态情绪组合测试
    await this.testBasicStateEmotionCombinations();
    
    // 行为优先级测试
    await this.testBehaviorPriority();
    
    // 异步行为测试
    await this.testAsynchronousBehaviors();
    
    // 延时行为测试
    await this.testDelayedBehaviors();
    
    // 行为统计测试
    await this.testBehaviorStats();
    
    // 自定义行为规则测试
    await this.testCustomBehaviorRules();
    
    // 错误处理测试
    await this.testErrorHandling();

    // 输出测试结果
    this.printTestResults();

    // 清理资源
    this.cleanup();
  }

  /**
   * 测试基础状态情绪组合
   */
  async testBasicStateEmotionCombinations(): Promise<void> {
    console.log('📝 测试基础状态情绪组合...');
    
    const testCases = [
      // Idle 状态测试
      { state: PetState.Idle, emotion: EmotionType.Happy, expected: true },
      { state: PetState.Idle, emotion: EmotionType.Calm, expected: true },
      { state: PetState.Idle, emotion: EmotionType.Excited, expected: true },
      { state: PetState.Idle, emotion: EmotionType.Sleepy, expected: true },
      
      // Hover 状态测试
      { state: PetState.Hover, emotion: EmotionType.Happy, expected: true },
      { state: PetState.Hover, emotion: EmotionType.Curious, expected: true },
      { state: PetState.Hover, emotion: EmotionType.Excited, expected: true },
      
      // Awaken 状态测试
      { state: PetState.Awaken, emotion: EmotionType.Happy, expected: true },
      { state: PetState.Awaken, emotion: EmotionType.Excited, expected: true },
      { state: PetState.Awaken, emotion: EmotionType.Focused, expected: true },
      
      // Control 状态测试
      { state: PetState.Control, emotion: EmotionType.Happy, expected: true },
      { state: PetState.Control, emotion: EmotionType.Excited, expected: true },
      { state: PetState.Control, emotion: EmotionType.Focused, expected: true },
    ];

    for (const testCase of testCases) {
      try {
        const result = await this.scheduler.schedule(testCase.state, testCase.emotion);
        const success = result.success === testCase.expected;
        
        console.log(`  ${success ? '✅' : '❌'} ${testCase.state} + ${testCase.emotion}: ${result.executedBehaviors.length} 个行为`);
        
        if (result.executedBehaviors.length > 0) {
          result.executedBehaviors.forEach(behavior => {
            console.log(`    - ${behavior.type} (优先级: ${behavior.priority})`);
          });
        }
        
        this.testResults.set(`${testCase.state}_${testCase.emotion}`, success);
      } catch (error) {
        console.log(`  ❌ ${testCase.state} + ${testCase.emotion}: 错误 - ${error}`);
        this.testResults.set(`${testCase.state}_${testCase.emotion}`, false);
      }
    }
    
    console.log('');
  }

  /**
   * 测试行为优先级
   */
  async testBehaviorPriority(): Promise<void> {
    console.log('📝 测试行为优先级...');
    
    try {
      const result = await this.scheduler.schedule(PetState.Awaken, EmotionType.Excited);
      
      if (result.success && result.executedBehaviors.length > 1) {
        // 检查行为是否按优先级排序
        let isPriorityCorrect = true;
        for (let i = 1; i < result.executedBehaviors.length; i++) {
          if (result.executedBehaviors[i-1].priority < result.executedBehaviors[i].priority) {
            isPriorityCorrect = false;
            break;
          }
        }
        
        console.log(`  ${isPriorityCorrect ? '✅' : '❌'} 行为按优先级正确排序`);
        this.testResults.set('priority_test', isPriorityCorrect);
      } else {
        console.log('  ⚠️  无法测试优先级（行为数量不足）');
        this.testResults.set('priority_test', false);
      }
    } catch (error) {
      console.log(`  ❌ 优先级测试失败: ${error}`);
      this.testResults.set('priority_test', false);
    }
    
    console.log('');
  }

  /**
   * 测试异步行为
   */
  async testAsynchronousBehaviors(): Promise<void> {
    console.log('📝 测试异步行为...');
    
    try {
      const startTime = Date.now();
      const result = await this.scheduler.schedule(PetState.Control, EmotionType.Excited);
      const endTime = Date.now();
      
      const executionTime = endTime - startTime;
      const hasAsyncBehaviors = result.executedBehaviors.some(b => b.delay || b.duration);
      
      console.log(`  ${result.success ? '✅' : '❌'} 异步行为执行 (耗时: ${executionTime}ms)`);
      console.log(`  ${hasAsyncBehaviors ? '✅' : '❌'} 包含异步行为定义`);
      
      this.testResults.set('async_test', result.success && hasAsyncBehaviors);
    } catch (error) {
      console.log(`  ❌ 异步行为测试失败: ${error}`);
      this.testResults.set('async_test', false);
    }
    
    console.log('');
  }

  /**
   * 测试延时行为
   */
  async testDelayedBehaviors(): Promise<void> {
    console.log('📝 测试延时行为...');
    
    try {
      // 测试包含延时的状态情绪组合
      const result = await this.scheduler.schedule(PetState.Hover, EmotionType.Excited);
      
      const hasDelayedBehaviors = result.executedBehaviors.some(b => b.delay && b.delay > 0);
      
      console.log(`  ${result.success ? '✅' : '❌'} 延时行为调度成功`);
      console.log(`  ${hasDelayedBehaviors ? '✅' : '❌'} 包含延时行为`);
      
      this.testResults.set('delayed_test', result.success && hasDelayedBehaviors);
    } catch (error) {
      console.log(`  ❌ 延时行为测试失败: ${error}`);
      this.testResults.set('delayed_test', false);
    }
    
    console.log('');
  }

  /**
   * 测试行为统计
   */
  async testBehaviorStats(): Promise<void> {
    console.log('📝 测试行为统计...');
    
    try {
      const stats = this.scheduler.getBehaviorStats() as any;
      
      const hasSessionId = typeof stats.sessionId === 'string' && stats.sessionId.length > 0;
      const hasValidStats = typeof stats.activeBehaviors === 'number' && 
                          typeof stats.scheduledBehaviors === 'number' &&
                          typeof stats.totalRules === 'number';
      
      console.log(`  ${hasSessionId ? '✅' : '❌'} 会话ID正确`);
      console.log(`  ${hasValidStats ? '✅' : '❌'} 统计数据有效`);
      console.log(`  📊 统计数据:`, stats);
      
      this.testResults.set('stats_test', hasSessionId && hasValidStats);
    } catch (error) {
      console.log(`  ❌ 行为统计测试失败: ${error}`);
      this.testResults.set('stats_test', false);
    }
    
    console.log('');
  }

  /**
   * 测试自定义行为规则
   */
  async testCustomBehaviorRules(): Promise<void> {
    console.log('📝 测试自定义行为规则...');
    
    try {
      // 添加自定义行为规则
      const customBehavior = {
        type: BehaviorType.USER_PROMPT,
        priority: 10,
        duration: 1000,
        message: '这是一个自定义测试行为'
      };
      
      this.scheduler.addBehaviorRule(PetState.Idle, EmotionType.Happy, customBehavior);
      
      // 测试自定义规则是否生效
      const result = await this.scheduler.schedule(PetState.Idle, EmotionType.Happy);
      
      const hasCustomBehavior = result.executedBehaviors.some(b => 
        b.type === BehaviorType.USER_PROMPT && b.priority === 10
      );
      
      console.log(`  ${result.success ? '✅' : '❌'} 自定义规则添加成功`);
      console.log(`  ${hasCustomBehavior ? '✅' : '❌'} 自定义行为被执行`);
      
      this.testResults.set('custom_rule_test', result.success && hasCustomBehavior);
    } catch (error) {
      console.log(`  ❌ 自定义行为规则测试失败: ${error}`);
      this.testResults.set('custom_rule_test', false);
    }
    
    console.log('');
  }

  /**
   * 测试错误处理
   */
  async testErrorHandling(): Promise<void> {
    console.log('📝 测试错误处理...');
    
    try {
      // 测试无效状态和情绪组合
      const result = await this.scheduler.schedule('invalid_state' as any, 'invalid_emotion' as any);
      
      const handledGracefully = !result.success && Boolean(result.error);
      
      console.log(`  ${handledGracefully ? '✅' : '❌'} 错误处理正确`);
      
      this.testResults.set('error_handling_test', handledGracefully);
    } catch (error) {
      // 如果抛出异常，也算是正确的错误处理
      console.log(`  ✅ 错误处理正确 (抛出异常)`);
      this.testResults.set('error_handling_test', true);
    }
    
    console.log('');
  }

  /**
   * 输出测试结果
   */
  private printTestResults(): void {
    console.log('🏆 ===== 测试结果汇总 =====');
    
    const totalTests = this.testResults.size;
    const passedTests = Array.from(this.testResults.values()).filter(v => v).length;
    const failedTests = totalTests - passedTests;
    
    console.log(`总测试数: ${totalTests}`);
    console.log(`通过: ${passedTests} ✅`);
    console.log(`失败: ${failedTests} ❌`);
    console.log(`成功率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    
    console.log('\n详细结果:');
    this.testResults.forEach((passed, testName) => {
      console.log(`  ${passed ? '✅' : '❌'} ${testName}`);
    });
    
    console.log('\n🎯 ===== 测试完成 =====');
  }

  /**
   * 清理资源
   */
  private cleanup(): void {
    this.scheduler.destroy();
    console.log('🧹 测试资源已清理');
  }
}

/**
 * 主函数
 */
async function main(): Promise<void> {
  const test = new BehaviorSchedulerTest();
  await test.runAllTests();
}

// 运行测试
if (require.main === module) {
  main().catch(console.error);
}

export { BehaviorSchedulerTest };
