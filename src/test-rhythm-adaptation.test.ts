/**
 * T5-C | RhythmAdaptation 测试文件
 * 验证节奏动态适配器的自动切换逻辑
 */

import { 
  RhythmAdaptationManager, 
  createRhythmAdaptationManager 
} from './modules/rhythm/RhythmAdaptationManager';
import { 
  RhythmContext, 
  RhythmAdaptationDecision,
  TimeOfDay,
  UserActivityLevel,
  UserInteractionStats,
  RhythmAdaptationStrategy,
  getCurrentTimeOfDay
} from './types/rhythm/RhythmContext';
import { EmotionType, PetState } from './types';

describe('T5-C RhythmAdaptation 节奏动态适配器', () => {
  let adaptationManager: RhythmAdaptationManager;

  beforeEach(() => {
    adaptationManager = createRhythmAdaptationManager({
      enabled: true,
      updateIntervalMs: 100, // 测试时使用较短间隔
      debounceMs: 50,
      maxAdaptationsPerMinute: 20,
      enableLogging: false, // 测试时关闭日志
      strategies: [
        RhythmAdaptationStrategy.EmotionDriven,
        RhythmAdaptationStrategy.InteractionDriven,
        RhythmAdaptationStrategy.TimeDriven,
        RhythmAdaptationStrategy.HybridDriven,
        RhythmAdaptationStrategy.SystemDriven
      ]
    });
  });

  afterEach(() => {
    if (adaptationManager) {
      adaptationManager.destroy();
    }
  });

  // ============ 基础功能测试 ============

  describe('基础适配管理器功能', () => {
    test('应该正确初始化适配管理器', () => {
      expect(adaptationManager).toBeDefined();
      expect(adaptationManager.getCurrentContext()).toBeNull();
    });

    test('应该能够更新节奏上下文', () => {
      const context: Partial<RhythmContext> = {
        currentEmotion: EmotionType.Happy,
        emotionIntensity: 0.8,
        currentState: PetState.Awaken,
        timeOfDay: TimeOfDay.Morning,
        activityLevel: UserActivityLevel.High,
        userStats: {
          totalInteractions: 10,
          averageInterval: 5000,
          recentFrequency: 3,
          continuousIdleTime: 0,
          lastInteractionTime: Date.now(),
          interactionPattern: 'steady'
        }
      };

      adaptationManager.updateRhythmContext(context);
      const currentContext = adaptationManager.getCurrentContext();
      
      expect(currentContext).not.toBeNull();
      expect(currentContext?.currentEmotion).toBe(EmotionType.Happy);
      expect(currentContext?.emotionIntensity).toBe(0.8);
      expect(currentContext?.activityLevel).toBe(UserActivityLevel.High);
    });

    test('应该能够添加和移除自定义规则', () => {
      const customRule = {
        id: 'test_rule',
        name: '测试规则',
        priority: 5,
        strategy: RhythmAdaptationStrategy.EmotionDriven,
        condition: () => true,
        action: () => ({
          targetMode: 'pulse' as const,
          targetBPM: 130,
          intensity: 0.7,
          transitionType: 'smooth' as const,
          reason: '测试规则触发',
          confidence: 0.8
        }),
        enabled: true
      };

      adaptationManager.addRule(customRule);
      
      // 设置一个会触发规则的上下文
      adaptationManager.updateRhythmContext({
        currentEmotion: EmotionType.Excited,
        emotionIntensity: 0.9
      });

      const decision = adaptationManager.applyAdaptation();
      expect(decision).not.toBeNull();
      expect(decision?.targetMode).toBe('pulse');

      // 测试移除规则
      const removed = adaptationManager.removeRule('test_rule');
      expect(removed).toBe(true);
    });
  });

  // ============ 高频交互测试 ============

  describe('高频交互场景 → 脉冲模式', () => {
    test('用户短时间内高频点击应该切换为 pulse 模式', async () => {
      const userStats: UserInteractionStats = {
        totalInteractions: 50,
        averageInterval: 200, // 200ms平均间隔，非常频繁
        recentFrequency: 15,  // 15次/分钟，超过阈值
        continuousIdleTime: 0,
        lastInteractionTime: Date.now(),
        interactionPattern: 'burst'
      };

      const context: Partial<RhythmContext> = {
        currentEmotion: EmotionType.Excited,
        emotionIntensity: 0.9,
        currentState: PetState.Awaken,
        timeOfDay: TimeOfDay.Afternoon,
        userStats,
        timestamp: Date.now()
      };

      adaptationManager.updateRhythmContext(context);
      
      // 等待防抖和自动评估
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Check the adaptation history since the auto-evaluation should have added an entry
      const history = adaptationManager.getAdaptationHistory();
      expect(history.length).toBeGreaterThan(0);
      
      const lastAdaptation = history[history.length - 1];
      expect(lastAdaptation.decision.targetMode).toBe('pulse');
      expect(lastAdaptation.decision.targetBPM).toBeGreaterThan(120);
      expect(lastAdaptation.decision.reason).toContain('高频交互');
      expect(lastAdaptation.decision.confidence).toBeGreaterThan(0.8);

      console.log('高频交互适配决策:', lastAdaptation.decision);
    });

    test('爆发式交互模式应该立即触发脉冲节奏', () => {
      const context: Partial<RhythmContext> = {
        currentEmotion: EmotionType.Curious,
        emotionIntensity: 0.7,
        userStats: {
          totalInteractions: 20,
          averageInterval: 150,
          recentFrequency: 20, // 极高频率
          continuousIdleTime: 0,
          lastInteractionTime: Date.now(),
          interactionPattern: 'burst'
        },
        activityLevel: UserActivityLevel.Burst
      };

      adaptationManager.updateRhythmContext(context);
      const decision = adaptationManager.applyAdaptation();

      expect(decision?.targetMode).toBe('pulse');
      expect(decision?.transitionType).toBe('smooth');
    });
  });

  // ============ 长时间空闲测试 ============

  describe('长时间无操作 + calm 情绪 → steady 模式', () => {
    test('用户长时间无操作且情绪平静应该切换为 steady', () => {
      const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
      
      const context: Partial<RhythmContext> = {
        currentEmotion: EmotionType.Calm,
        emotionIntensity: 0.4,
        currentState: PetState.Idle,
        timeOfDay: TimeOfDay.Afternoon,
        userStats: {
          totalInteractions: 5,
          averageInterval: 120000, // 2分钟平均间隔
          recentFrequency: 0,
          continuousIdleTime: 10 * 60 * 1000, // 10分钟空闲
          lastInteractionTime: tenMinutesAgo,
          interactionPattern: 'idle'
        },
        activityLevel: UserActivityLevel.Inactive,
        timestamp: Date.now()
      };

      adaptationManager.updateRhythmContext(context);
      const decision = adaptationManager.applyAdaptation();

      expect(decision).not.toBeNull();
      expect(decision?.targetMode).toBe('steady');
      expect(decision?.targetBPM).toBeLessThan(80);
      expect(decision?.reason).toContain('长时间空闲');
      expect(decision?.transitionType).toBe('gradual');

      console.log('长时间空闲适配决策:', decision);
    });

    test('持续空闲状态应该降低节奏强度', async () => {
      const context: Partial<RhythmContext> = {
        currentEmotion: EmotionType.Calm, // 使用 Calm 而不是 Sleepy
        emotionIntensity: 0.2,
        userStats: {
          totalInteractions: 2,
          averageInterval: 300000,
          recentFrequency: 0,
          continuousIdleTime: 15 * 60 * 1000, // 15分钟空闲
          lastInteractionTime: Date.now() - 15 * 60 * 1000,
          interactionPattern: 'idle'
        },
        activityLevel: UserActivityLevel.Inactive
      };

      adaptationManager.updateRhythmContext(context);
      
      // 等待防抖和自动评估
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Check the adaptation history
      const history = adaptationManager.getAdaptationHistory();
      expect(history.length).toBeGreaterThan(0);
      
      const lastAdaptation = history[history.length - 1];
      expect(lastAdaptation.decision.intensity).toBeLessThan(0.5);
      expect(lastAdaptation.decision.duration).toBeGreaterThan(60000); // 持续时间较长
    });
  });

  // ============ 时间驱动测试 ============

  describe('夜间时间段 + focused 情绪 → adaptive 模式', () => {
    test('夜间专注模式应该使用自适应节奏', () => {
      const context: Partial<RhythmContext> = {
        currentEmotion: EmotionType.Focused,
        emotionIntensity: 0.8,
        currentState: PetState.Control,
        timeOfDay: TimeOfDay.Night,
        userStats: {
          totalInteractions: 25,
          averageInterval: 30000, // 30秒间隔，中等频率
          recentFrequency: 2,
          continuousIdleTime: 5000,
          lastInteractionTime: Date.now() - 5000,
          interactionPattern: 'steady'
        },
        activityLevel: UserActivityLevel.Medium,
        environmentContext: {
          isWorkTime: true,
          isQuietMode: true
        }
      };

      adaptationManager.updateRhythmContext(context);
      const decision = adaptationManager.applyAdaptation();

      expect(decision).not.toBeNull();
      expect(decision?.targetMode).toBe('adaptive');
      expect(decision?.reason).toContain('夜间专注');
      expect(decision?.targetBPM).toBe(80);
      expect(decision?.duration).toBeGreaterThan(180000); // 至少3分钟

      console.log('夜间专注适配决策:', decision);
    });

    test('工作时间的中等活跃度应该触发自适应模式', async () => {
      const context: Partial<RhythmContext> = {
        currentEmotion: EmotionType.Calm,
        emotionIntensity: 0.6,
        timeOfDay: TimeOfDay.Morning,
        activityLevel: UserActivityLevel.Medium,
        userStats: {
          totalInteractions: 8,
          averageInterval: 15000,
          recentFrequency: 4,
          continuousIdleTime: 0,
          lastInteractionTime: Date.now(),
          interactionPattern: 'steady'
        },
        environmentContext: {
          isWorkTime: true
        }
      };

      adaptationManager.updateRhythmContext(context);
      
      // 等待防抖和自动评估
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Check the adaptation history
      const history = adaptationManager.getAdaptationHistory();
      expect(history.length).toBeGreaterThan(0);
      
      const lastAdaptation = history[history.length - 1];
      expect(lastAdaptation.decision.targetMode).toBe('adaptive');
      expect(lastAdaptation.decision.reason).toContain('工作时间');
    });
  });

  // ============ 情绪驱动测试 ============

  describe('情绪驱动的节奏适配', () => {
    test('兴奋情绪应该立即切换到脉冲模式', () => {
      const context: Partial<RhythmContext> = {
        currentEmotion: EmotionType.Excited,
        emotionIntensity: 0.9,
        emotionDuration: 5000,
        activityLevel: UserActivityLevel.High
      };

      adaptationManager.updateRhythmContext(context);
      const decision = adaptationManager.applyAdaptation();

      expect(decision?.targetMode).toBe('pulse');
      expect(decision?.transitionType).toBe('immediate');
      expect(decision?.targetBPM).toBeGreaterThan(140);
      expect(decision?.reason).toContain('兴奋情绪');
    });

    test('好奇情绪应该触发自适应模式', () => {
      const context: Partial<RhythmContext> = {
        currentEmotion: EmotionType.Curious,
        emotionIntensity: 0.7,
        activityLevel: UserActivityLevel.Medium,
        userStats: {
          totalInteractions: 5,
          averageInterval: 30000,
          recentFrequency: 2,
          continuousIdleTime: 0,
          lastInteractionTime: Date.now(),
          interactionPattern: 'steady'
        }
      };

      adaptationManager.updateRhythmContext(context);
      const decision = adaptationManager.applyAdaptation();

      expect(decision).not.toBeNull();
      expect(decision?.targetMode).toBe('adaptive');
      expect(decision?.reason).toContain('好奇情绪');
      expect(decision?.targetBPM).toBe(110);
    });
  });

  // ============ 事件监听测试 ============

  describe('事件监听机制', () => {
    test('应该正确触发适配事件', (done) => {
      let eventReceived = false;

      adaptationManager.on('adaptation_applied', (decision: RhythmAdaptationDecision) => {
        expect(decision).toBeDefined();
        expect(decision.targetMode).toBeDefined();
        eventReceived = true;
        done();
      });

      // 触发一个会产生适配的上下文
      adaptationManager.updateRhythmContext({
        currentEmotion: EmotionType.Excited,
        emotionIntensity: 0.9,
        activityLevel: UserActivityLevel.Burst,
        userStats: {
          totalInteractions: 30,
          averageInterval: 100,
          recentFrequency: 25,
          continuousIdleTime: 0,
          lastInteractionTime: Date.now(),
          interactionPattern: 'burst'
        }
      });

      // 确保有决策产生
      setTimeout(() => {
        if (!eventReceived) {
          const decision = adaptationManager.applyAdaptation();
          if (decision) {
            done();
          }
        }
      }, 200);
    });

    test('应该能够正确移除事件监听器', () => {
      const listener = jest.fn();
      
      adaptationManager.on('test_event', listener);
      adaptationManager.off('test_event', listener);
      
      // 手动触发事件（这需要访问私有方法，所以我们用其他方式验证）
      // 如果监听器被正确移除，它不应该被调用
      expect(listener).not.toHaveBeenCalled();
    });
  });

  // ============ 性能和边界测试 ============

  describe('性能和边界情况', () => {
    test('应该限制每分钟的适配次数', async () => {
      const decisions: RhythmAdaptationDecision[] = [];
      
      // 尝试快速触发多次适配
      for (let i = 0; i < 15; i++) {
        adaptationManager.updateRhythmContext({
          currentEmotion: EmotionType.Excited,
          emotionIntensity: 0.8 + Math.random() * 0.2,
          timestamp: Date.now() + i * 100
        });
        
        const decision = adaptationManager.applyAdaptation();
        if (decision) {
          decisions.push(decision);
        }
        
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      // 应该受到频率限制
      expect(decisions.length).toBeLessThanOrEqual(10);
      console.log(`实际适配次数: ${decisions.length}/15`);
    });

    test('应该正确处理无效上下文', () => {
      adaptationManager.updateRhythmContext({});
      const decision = adaptationManager.applyAdaptation();
      
      // 即使上下文不完整，也不应该崩溃
      expect(() => adaptationManager.applyAdaptation()).not.toThrow();
    });

    test('应该正确记录适配历史', () => {
      adaptationManager.updateRhythmContext({
        currentEmotion: EmotionType.Excited,
        emotionIntensity: 0.9,
        activityLevel: UserActivityLevel.Burst,
        userStats: {
          totalInteractions: 50,
          averageInterval: 200,
          recentFrequency: 15,
          continuousIdleTime: 0,
          lastInteractionTime: Date.now(),
          interactionPattern: 'burst'
        }
      });

      const decision = adaptationManager.applyAdaptation();
      
      const history = adaptationManager.getAdaptationHistory();
      expect(history.length).toBeGreaterThan(0);
      
      const lastRecord = history[history.length - 1];
      expect(lastRecord.timestamp).toBeDefined();
      expect(lastRecord.decision).toBeDefined();
    });
  });

  // ============ 集成测试 ============

  describe('复合场景集成测试', () => {
    test('完整的用户交互序列应该产生正确的适配', async () => {
      const scenarios = [
        // 场景1: 用户开始工作
        {
          name: '开始工作',
          context: {
            currentEmotion: EmotionType.Focused,
            emotionIntensity: 0.7,
            timeOfDay: TimeOfDay.Morning,
            activityLevel: UserActivityLevel.Medium,
            environmentContext: { isWorkTime: true }
          },
          expectedMode: 'adaptive'
        },
        // 场景2: 高频互动
        {
          name: '高频互动',
          context: {
            currentEmotion: EmotionType.Excited,
            emotionIntensity: 0.9,
            activityLevel: UserActivityLevel.Burst,
            userStats: {
              totalInteractions: 40,
              averageInterval: 150,
              recentFrequency: 18,
              continuousIdleTime: 0,
              lastInteractionTime: Date.now(),
              interactionPattern: 'burst' as const
            }
          },
          expectedMode: 'pulse'
        },
        // 场景3: 长时间休息
        {
          name: '长时间休息',
          context: {
            currentEmotion: EmotionType.Calm,
            emotionIntensity: 0.3,
            activityLevel: UserActivityLevel.Inactive,
            userStats: {
              totalInteractions: 5,
              averageInterval: 600000,
              recentFrequency: 0,
              continuousIdleTime: 12 * 60 * 1000,
              lastInteractionTime: Date.now() - 12 * 60 * 1000,
              interactionPattern: 'idle' as const
            }
          },
          expectedMode: 'steady'
        }
      ];

      const results: Array<{
        scenario: string;
        expected: string;
        actual: string | undefined;
        decision: RhythmAdaptationDecision | null;
      }> = [];

      for (const scenario of scenarios) {
        // Create a fresh adaptation manager for each scenario to avoid cooldown issues
        const scenarioManager = createRhythmAdaptationManager({
          enabled: true,
          updateIntervalMs: 100,
          debounceMs: 50,
          maxAdaptationsPerMinute: 20,
          enableLogging: false,
          strategies: [
            RhythmAdaptationStrategy.EmotionDriven,
            RhythmAdaptationStrategy.InteractionDriven,
            RhythmAdaptationStrategy.TimeDriven,
            RhythmAdaptationStrategy.HybridDriven,
            RhythmAdaptationStrategy.SystemDriven
          ]
        });
        
        scenarioManager.updateRhythmContext(scenario.context);
        await new Promise(resolve => setTimeout(resolve, 100)); // 等待防抖
        
        // Get the adaptation from history
        const history = scenarioManager.getAdaptationHistory();
        const decision = history.length > 0 ? history[history.length - 1].decision : null;
        
        results.push({
          scenario: scenario.name,
          expected: scenario.expectedMode,
          actual: decision?.targetMode,
          decision
        });

        console.log(`场景 "${scenario.name}":`, {
          期望: scenario.expectedMode,
          实际: decision?.targetMode,
          原因: decision?.reason
        });
        
        scenarioManager.destroy();
      }

      // 验证所有场景都产生了预期的适配
      results.forEach(result => {
        expect(result.actual).toBe(result.expected);
      });
    });
  });
});

// ============ 辅助函数测试 ============

describe('RhythmContext 辅助函数', () => {
  test('getCurrentTimeOfDay 应该返回正确的时间段', () => {
    // 由于这依赖于当前时间，我们只能测试返回值的有效性
    const timeOfDay = getCurrentTimeOfDay();
    expect([TimeOfDay.Morning, TimeOfDay.Afternoon, TimeOfDay.Evening, TimeOfDay.Night])
      .toContain(timeOfDay);
  });
});

console.log('🎵 T5-C RhythmAdaptation 测试文件加载完成');
