/**
 * T5-B | AI情绪驱动器测试
 * 验证状态→情绪映射、插件机制、异常处理等
 */

import { 
  AIEmotionDriver, 
  RuleBasedEmotionModel, 
  PluginBasedEmotionDriver,
  AIEmotionDriverFactory,
  IAIEmotionProvider,
  EmotionLog 
} from '../src/modules/AIEmotionDriver';
import { PetState, EmotionType } from '../src/types';

// Jest 测试用例
describe('T5-B AIEmotionDriver', () => {
  let emotionDriver: RuleBasedEmotionModel;

  beforeEach(() => {
    emotionDriver = new RuleBasedEmotionModel();
  });

  describe('基础情绪推断规则', () => {
    test('空闲状态应该返回平静情绪', () => {
      const emotion = emotionDriver.decideEmotion({
        state: PetState.Idle
      });
      expect(emotion).toBe(EmotionType.Calm);
    });

    test('悬停状态应该返回好奇情绪', () => {
      const emotion = emotionDriver.decideEmotion({
        state: PetState.Hover
      });
      expect(emotion).toBe(EmotionType.Curious);
    });

    test('唤醒状态应该返回开心情绪', () => {
      const emotion = emotionDriver.decideEmotion({
        state: PetState.Awaken
      });
      expect(emotion).toBe(EmotionType.Happy);
    });

    test('控制状态应该返回专注情绪', () => {
      const emotion = emotionDriver.decideEmotion({
        state: PetState.Control
      });
      expect(emotion).toBe(EmotionType.Focused);
    });
  });

  describe('复杂情绪推断规则', () => {
    test('悬停状态+最近被唤醒应该返回好奇情绪', (done) => {
      // 先触发唤醒状态
      emotionDriver.decideEmotion({ state: PetState.Awaken });
      
      // 立即切换到悬停状态
      setTimeout(() => {
        const emotion = emotionDriver.decideEmotion({ state: PetState.Hover });
        expect(emotion).toBe(EmotionType.Curious);
        done();
      }, 100);
    });

    test('频繁交互应该触发兴奋情绪', () => {
      // 模拟频繁交互
      for (let i = 0; i < 6; i++) {
        emotionDriver.decideEmotion({ state: PetState.Awaken });
      }
      
      const emotion = emotionDriver.decideEmotion({ state: PetState.Awaken });
      expect(emotion).toBe(EmotionType.Excited);
    });

    test('长时间空闲应该返回困倦情绪', (done) => {
      // 创建自定义配置，缩短空闲时间用于测试
      const customDriver = new RuleBasedEmotionModel({ idleTimeoutMs: 100 });
      
      // 等待超过空闲时间
      setTimeout(() => {
        const emotion = customDriver.decideEmotion({ state: PetState.Idle });
        expect(emotion).toBe(EmotionType.Sleepy);
        done();
      }, 150);
    });
  });

  describe('情绪历史和统计', () => {
    test('应该正确记录情绪历史', () => {
      emotionDriver.decideEmotion({ state: PetState.Idle });
      emotionDriver.decideEmotion({ state: PetState.Hover });
      emotionDriver.decideEmotion({ state: PetState.Awaken });

      const history = emotionDriver.getEmotionHistory();
      expect(history).toHaveLength(3);
      expect(history[0].emotion).toBe(EmotionType.Calm);
      expect(history[1].emotion).toBe(EmotionType.Curious);
      expect(history[2].emotion).toBe(EmotionType.Happy);
    });

    test('应该提供统计信息', () => {
      emotionDriver.decideEmotion({ state: PetState.Idle });
      emotionDriver.decideEmotion({ state: PetState.Hover });
      emotionDriver.decideEmotion({ state: PetState.Awaken });

      const stats = emotionDriver.getStatistics();
      expect(stats.totalInteractions).toBeGreaterThan(0);
      expect(stats.emotionDistribution).toBeDefined();
      expect(stats.averageEmotionIntensity).toBeGreaterThan(0);
      expect(stats.lastEmotionChange).toBeGreaterThan(0);
    });

    test('应该能清空历史记录', () => {
      emotionDriver.decideEmotion({ state: PetState.Idle });
      emotionDriver.clearHistory();

      const history = emotionDriver.getEmotionHistory();
      const stats = emotionDriver.getStatistics();
      
      expect(history).toHaveLength(0);
      expect(stats.totalInteractions).toBe(0);
    });
  });

  describe('异常处理', () => {
    test('空输入应该返回默认情绪', () => {
      const emotion = emotionDriver.decideEmotion({
        state: undefined as any
      });
      expect(emotion).toBe(EmotionType.Calm);
    });

    test('未知状态应该返回默认情绪', () => {
      const emotion = emotionDriver.decideEmotion({
        state: 'unknown' as any
      });
      expect(emotion).toBe(EmotionType.Calm);
    });

    test('无效上下文应该不影响推断', () => {
      const emotion = emotionDriver.decideEmotion({
        state: PetState.Hover,
        context: null,
        history: undefined
      });
      expect(emotion).toBe(EmotionType.Curious);
    });
  });

  describe('工厂方法', () => {
    test('应该能创建基于规则的驱动器', () => {
      const driver = AIEmotionDriverFactory.createRuleBased();
      expect(driver).toBeInstanceOf(RuleBasedEmotionModel);
    });

    test('应该能创建支持插件的驱动器', () => {
      const driver = AIEmotionDriverFactory.createPluginBased();
      expect(driver).toBeInstanceOf(PluginBasedEmotionDriver);
    });

    test('应该能创建默认驱动器', () => {
      const driver = AIEmotionDriverFactory.createDefault();
      expect(driver).toBeDefined();
      expect(typeof driver.decideEmotion).toBe('function');
    });
  });
});

describe('T5-B 插件机制测试', () => {
  let pluginDriver: PluginBasedEmotionDriver;
  let mockPlugin: IAIEmotionProvider;

  beforeEach(() => {
    pluginDriver = new PluginBasedEmotionDriver();
    
    // Mock AI 插件
    mockPlugin = {
      inferEmotion: jest.fn((context: any) => {
        // 模拟复杂的AI推理
        if (context.baseEmotion === EmotionType.Curious) {
          return EmotionType.Excited; // AI增强：好奇→兴奋
        }
        return context.baseEmotion;
      })
    };
  });

  test('无插件时应该使用基础模型', () => {
    const emotion = pluginDriver.decideEmotion({ state: PetState.Hover });
    expect(emotion).toBe(EmotionType.Curious);
  });

  test('应该能注册和使用插件', () => {
    pluginDriver.registerPlugin(mockPlugin);
    
    const emotion = pluginDriver.decideEmotion({ state: PetState.Hover });
    expect(emotion).toBe(EmotionType.Excited); // 插件增强的结果
    expect(mockPlugin.inferEmotion).toHaveBeenCalled();
  });

  test('插件异常时应该回退到基础模型', () => {
    const errorPlugin: IAIEmotionProvider = {
      inferEmotion: jest.fn(() => {
        throw new Error('插件错误');
      })
    };

    pluginDriver.registerPlugin(errorPlugin);
    
    const emotion = pluginDriver.decideEmotion({ state: PetState.Hover });
    expect(emotion).toBe(EmotionType.Curious); // 回退到基础情绪
  });

  test('应该能移除插件', () => {
    pluginDriver.registerPlugin(mockPlugin);
    pluginDriver.removePlugin(mockPlugin);
    
    const emotion = pluginDriver.decideEmotion({ state: PetState.Hover });
    expect(emotion).toBe(EmotionType.Curious); // 回到基础模型
  });
});

describe('T5-B 集成测试', () => {
  test('模拟用户交互序列', () => {
    const driver = new RuleBasedEmotionModel();
    const interactions: Array<{ state: PetState; expected: EmotionType }> = [
      { state: PetState.Idle, expected: EmotionType.Calm },
      { state: PetState.Hover, expected: EmotionType.Curious },
      { state: PetState.Awaken, expected: EmotionType.Happy },
      { state: PetState.Control, expected: EmotionType.Focused },
      { state: PetState.Idle, expected: EmotionType.Calm }
    ];

    interactions.forEach(({ state, expected }) => {
      const emotion = driver.decideEmotion({ state });
      expect(emotion).toBe(expected);
    });

    // 验证历史记录
    const history = driver.getEmotionHistory();
    expect(history).toHaveLength(5);
  });

  test('模拟长期使用模式', () => {
    const driver = new RuleBasedEmotionModel();
    
    // 模拟一段时间的正常使用
    for (let i = 0; i < 10; i++) {
      driver.decideEmotion({ state: PetState.Hover });
      driver.decideEmotion({ state: PetState.Awaken });
      driver.decideEmotion({ state: PetState.Idle });
    }

    const stats = driver.getStatistics();
    expect(stats.totalInteractions).toBeGreaterThan(15); // Hover + Awaken 算作交互
    expect(stats.emotionDistribution[EmotionType.Curious]).toBeGreaterThan(0);
    expect(stats.emotionDistribution[EmotionType.Happy]).toBeGreaterThan(0);
    expect(stats.emotionDistribution[EmotionType.Calm]).toBeGreaterThan(0);
  });
});

// 运行测试
console.log('🧪 T5-B AIEmotionDriver 测试套件已加载');
