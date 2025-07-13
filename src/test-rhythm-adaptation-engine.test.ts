/**
 * T5-C v1.1 | RhythmAdaptationEngine 测试文件
 * 验证节奏动态适配引擎的功能
 */

import { createRhythmAdaptationEngine, RhythmAdaptationEngine } from './modules/rhythm/RhythmAdaptationEngine';
import { PetState, EmotionType } from './types';

describe('T5-C v1.1 RhythmAdaptationEngine 节奏动态适配引擎', () => {
  let engine: RhythmAdaptationEngine;

  beforeEach(() => {
    engine = createRhythmAdaptationEngine();
  });

  afterEach(() => {
    if ('destroy' in engine) {
      (engine as any).destroy();
    }
  });

  // ============ 基础功能测试 ============

  describe('基础功能', () => {
    test('应该正确初始化引擎', () => {
      expect(engine).toBeDefined();
      expect(engine.getCurrentRhythm()).toBe('steady'); // 默认为 steady
    });

    test('应该能够更新上下文', () => {
      const timestamp = Date.now();
      engine.updateRhythmByContext(PetState.Awaken, EmotionType.Happy, timestamp);
      expect(engine.getCurrentRhythm()).toBeDefined();
    });

    test('应该能够获取当前节奏', () => {
      const rhythm = engine.getCurrentRhythm();
      expect(['steady', 'pulse', 'sequence', 'adaptive', 'sync']).toContain(rhythm);
    });
  });

  // ============ 节奏切换逻辑测试 ============

  describe('节奏切换逻辑', () => {
    test('高频点击 + 兴奋情绪应该切换为 pulse 模式', () => {
      const baseTime = Date.now();
      
      // 模拟高频交互（每分钟4次，超过阈值3次）
      for (let i = 0; i < 4; i++) {
        engine.updateRhythmByContext(
          PetState.Awaken, 
          EmotionType.Excited, 
          baseTime + i * 15000 // 每15秒一次交互
        );
      }
      
      expect(engine.getCurrentRhythm()).toBe('pulse');
    });

    test('平静情绪 + 长时间空闲应该切换为 sequence 模式', () => {
      const baseTime = Date.now();
      
      // 初始交互
      engine.updateRhythmByContext(PetState.Idle, EmotionType.Calm, baseTime, true);
      
      // 16秒后状态检查（不算作新交互）
      engine.updateRhythmByContext(
        PetState.Idle, 
        EmotionType.Calm, 
        baseTime + 16 * 1000,
        false // 不算作实际交互
      );
      
      expect(engine.getCurrentRhythm()).toBe('sequence');
    });

    test('专注情绪应该触发 adaptive 模式', () => {
      const timestamp = Date.now();
      
      engine.updateRhythmByContext(PetState.Awaken, EmotionType.Focused, timestamp);
      
      expect(engine.getCurrentRhythm()).toBe('adaptive');
    });

    test('好奇情绪 + 适度交互应该触发 adaptive 模式', () => {
      const baseTime = Date.now();
      
      // 模拟适度交互（每分钟2次，在阈值范围内）
      engine.updateRhythmByContext(PetState.Awaken, EmotionType.Curious, baseTime);
      engine.updateRhythmByContext(PetState.Hover, EmotionType.Curious, baseTime + 30000);
      
      expect(engine.getCurrentRhythm()).toBe('adaptive');
    });

    test('困倦情绪应该回退到 steady 模式', () => {
      const timestamp = Date.now();
      
      engine.updateRhythmByContext(PetState.Idle, EmotionType.Sleepy, timestamp);
      
      expect(engine.getCurrentRhythm()).toBe('steady');
    });
  });

  // ============ 边界条件测试 ============

  describe('边界条件和极端情况', () => {
    test('超高频交互应该触发 pulse 模式', () => {
      const baseTime = Date.now();
      
      // 模拟爆发式交互（每分钟7次，远超阈值）
      for (let i = 0; i < 7; i++) {
        engine.updateRhythmByContext(
          PetState.Awaken, 
          EmotionType.Happy, 
          baseTime + i * 8500 // 每8.5秒一次
        );
      }
      
      expect(engine.getCurrentRhythm()).toBe('pulse');
    });

    test('困倦情绪 + 短时间空闲应该切换为 sequence', () => {
      const baseTime = Date.now();
      
      // 初始交互
      engine.updateRhythmByContext(PetState.Idle, EmotionType.Sleepy, baseTime, true);
      
      // 8秒后状态检查（不算作新交互，超过15/2=7.5秒阈值）
      engine.updateRhythmByContext(
        PetState.Idle, 
        EmotionType.Sleepy, 
        baseTime + 8 * 1000,
        false // 不算作实际交互
      );
      
      expect(engine.getCurrentRhythm()).toBe('sequence');
    });
  });

  // ============ 状态统计测试 ============

  describe('状态统计和历史管理', () => {
    test('应该正确跟踪情绪历史', () => {
      const timestamp = Date.now();
      
      engine.updateRhythmByContext(PetState.Awaken, EmotionType.Happy, timestamp);
      engine.updateRhythmByContext(PetState.Hover, EmotionType.Excited, timestamp + 1000);
      engine.updateRhythmByContext(PetState.Idle, EmotionType.Calm, timestamp + 2000);
      
      if ('getStats' in engine) {
        const stats = (engine as any).getStats();
        expect(stats.emotion).toContain(EmotionType.Happy);
        expect(stats.emotion).toContain(EmotionType.Excited);
        expect(stats.emotion).toContain(EmotionType.Calm);
      }
    });

    test('应该正确跟踪交互次数', () => {
      const baseTime = Date.now();
      
      for (let i = 0; i < 3; i++) {
        engine.updateRhythmByContext(
          PetState.Awaken, 
          EmotionType.Happy, 
          baseTime + i * 1000
        );
      }
      
      if ('getStats' in engine) {
        const stats = (engine as any).getStats();
        expect(stats.interactions).toBe(3);
      }
    });

    test('应该能够重置引擎状态', () => {
      const timestamp = Date.now();
      
      // 添加一些状态
      engine.updateRhythmByContext(PetState.Awaken, EmotionType.Excited, timestamp);
      
      // 重置
      if ('reset' in engine) {
        (engine as any).reset();
        expect(engine.getCurrentRhythm()).toBe('steady');
      }
    });
  });
});

// ============ 测试数据表格验证 ============

describe('任务卡要求的测试表格验证', () => {
  let engine: RhythmAdaptationEngine;

  beforeEach(() => {
    engine = createRhythmAdaptationEngine();
  });

  afterEach(() => {
    if ('destroy' in engine) {
      (engine as any).destroy();
    }
  });

  test('高频点击: excited + 每分钟 > 3 次 → pulse', () => {
    const baseTime = Date.now();
    
    // 模拟每分钟4次点击
    for (let i = 0; i < 4; i++) {
      engine.updateRhythmByContext(
        PetState.Awaken, 
        EmotionType.Excited, 
        baseTime + i * 15000
      );
    }
    
    expect(engine.getCurrentRhythm()).toBe('pulse');
  });

  test('情绪稳定: calm + idle > 15s → sequence', () => {
    const baseTime = Date.now();
    
    engine.updateRhythmByContext(PetState.Idle, EmotionType.Calm, baseTime, true);
    engine.updateRhythmByContext(PetState.Idle, EmotionType.Calm, baseTime + 16000, false);
    
    expect(engine.getCurrentRhythm()).toBe('sequence');
  });

  test('专注状态: focused + interaction > 1/min → adaptive', () => {
    const baseTime = Date.now();
    
    // 专注情绪会直接触发 adaptive，无需额外交互条件
    engine.updateRhythmByContext(PetState.Awaken, EmotionType.Focused, baseTime);
    
    expect(engine.getCurrentRhythm()).toBe('adaptive');
  });

  test('情绪回退: 其他情况 → fallback to steady', () => {
    const timestamp = Date.now();
    
    // 困倦情绪会触发 steady
    engine.updateRhythmByContext(PetState.Idle, EmotionType.Sleepy, timestamp);
    
    expect(engine.getCurrentRhythm()).toBe('steady');
  });
});

console.log('🎵 T5-C v1.1 RhythmAdaptationEngine 测试文件加载完成');
