/**
 * 行为节奏管理器测试
 * Test file for BehaviorRhythmManager
 */

import { BehaviorRhythmManager, DefaultRhythmSettings } from '../modules/rhythm/BehaviorRhythmManager';
import { RhythmMode, RhythmIntensity, RhythmConfig } from '../types/BehaviorRhythm';

// 模拟测试环境
const mockConsole = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// 替换console以避免测试输出噪音
const originalConsole = console;
beforeAll(() => {
  global.console = mockConsole as any;
});

afterAll(() => {
  global.console = originalConsole;
});

describe('BehaviorRhythmManager', () => {
  let rhythmManager: BehaviorRhythmManager;

  beforeEach(() => {
    rhythmManager = new BehaviorRhythmManager();
    jest.clearAllMocks();
  });

  afterEach(() => {
    rhythmManager.dispose();
  });

  describe('基础功能测试', () => {
    it('应该正确初始化默认状态', () => {
      const state = rhythmManager.getCurrentState();
      
      expect(state.isActive).toBe(false);
      expect(state.currentMode).toBe('steady');
      expect(state.tickCount).toBe(0);
      expect(state.config.mode).toBe('steady');
    });

    it('应该正确切换节奏模式', () => {
      rhythmManager.setRhythmMode('pulse');
      
      const state = rhythmManager.getCurrentState();
      expect(state.currentMode).toBe('pulse');
      expect(state.config.mode).toBe('pulse');
    });

    it('应该正确启动和停止节拍器', () => {
      expect(rhythmManager.isActive()).toBe(false);
      
      rhythmManager.start();
      expect(rhythmManager.isActive()).toBe(true);
      
      rhythmManager.stop();
      expect(rhythmManager.isActive()).toBe(false);
    });
  });

  describe('节拍回调测试', () => {
    it('应该正确注册和调用节拍回调', (done) => {
      const callback = jest.fn();
      
      rhythmManager.tick(callback);
      rhythmManager.setRhythmMode('steady', { baseInterval: 100 });
      rhythmManager.start();
      
      setTimeout(() => {
        expect(callback).toHaveBeenCalled();
        expect(callback.mock.calls.length).toBeGreaterThan(0);
        
        const [timestamp, interval] = callback.mock.calls[0];
        expect(typeof timestamp).toBe('number');
        expect(typeof interval).toBe('number');
        
        rhythmManager.stop();
        done();
      }, 250); // 等待足够时间确保回调被调用
    });

    it('应该支持多个节拍回调', (done) => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      
      rhythmManager.tick(callback1);
      rhythmManager.tick(callback2);
      rhythmManager.setRhythmMode('steady', { baseInterval: 100 });
      rhythmManager.start();
      
      setTimeout(() => {
        expect(callback1).toHaveBeenCalled();
        expect(callback2).toHaveBeenCalled();
        
        rhythmManager.stop();
        done();
      }, 250);
    });
  });

  describe('节奏模式测试', () => {
    it('STEADY模式应该产生相对稳定的间隔', (done) => {
      const intervals: number[] = [];
      const callback = (timestamp: number, interval: number) => {
        intervals.push(interval);
      };
      
      rhythmManager.tick(callback);
      rhythmManager.setRhythmMode('steady', { 
        baseInterval: 100,
        variation: 0.1 
      });
      rhythmManager.start();
      
      setTimeout(() => {
        rhythmManager.stop();
        
        expect(intervals.length).toBeGreaterThan(2);
        
        // 检查间隔相对稳定（在变化范围内）
        const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
        const tolerance = 100 * 0.1 + 50; // 变化范围 + 一些容错
        
        intervals.forEach(interval => {
          expect(Math.abs(interval - avgInterval)).toBeLessThan(tolerance);
        });
        
        done();
      }, 350);
    });

    it('PULSE模式应该产生心跳式变化的间隔', (done) => {
      const intervals: number[] = [];
      const callback = (timestamp: number, interval: number) => {
        intervals.push(interval);
      };
      
      rhythmManager.tick(callback);
      rhythmManager.setRhythmMode('pulse', { 
        baseInterval: 150
      });
      rhythmManager.start();
      
      setTimeout(() => {
        rhythmManager.stop();
        
        expect(intervals.length).toBeGreaterThanOrEqual(3);
        
        // PULSE模式应该有显著的间隔变化
        if (intervals.length > 1) {
          const maxInterval = Math.max(...intervals);
          const minInterval = Math.min(...intervals);
          const variation = (maxInterval - minInterval) / maxInterval;
          
          expect(variation).toBeGreaterThan(0.2); // 期望至少20%的变化
        }
        
        done();
      }, 600);
    });

    it('SEQUENCE模式应该按照预设序列循环', (done) => {
      const sequence = [100, 200, 150, 250];
      const intervals: number[] = [];
      const callback = (timestamp: number, interval: number) => {
        intervals.push(interval);
      };
      
      rhythmManager.tick(callback);
      rhythmManager.setRhythmMode('sequence', { 
        baseInterval: 200,
        sequence: sequence
      });
      rhythmManager.start();
      
      setTimeout(() => {
        rhythmManager.stop();
        
        expect(intervals.length).toBeGreaterThan(sequence.length);
        
        // 检查是否按序列循环（允许一定误差）
        for (let i = 0; i < Math.min(intervals.length, sequence.length * 2); i++) {
          const expectedInterval = sequence[i % sequence.length];
          const actualInterval = intervals[i];
          const tolerance = 50; // 50ms容错
          
          expect(Math.abs(actualInterval - expectedInterval)).toBeLessThan(tolerance);
        }
        
        done();
      }, sequence.reduce((sum, interval) => sum + interval, 0) * 2.5);
    });
  });

  describe('自适应模式测试', () => {
    it('应该根据情绪强度调整节拍间隔', () => {
      rhythmManager.setRhythmMode('adaptive', { 
        baseInterval: 1000
      });
      
      const initialState = rhythmManager.getCurrentState();
      const initialInterval = initialState.currentInterval;
      
      // 高情绪强度应该减少间隔
      rhythmManager.adaptToEmotion(0.8);
      const highIntensityState = rhythmManager.getCurrentState();
      expect(highIntensityState.currentInterval).toBeLessThan(initialInterval);
      
      // 低情绪强度应该接近原始间隔
      rhythmManager.adaptToEmotion(0.2);
      const lowIntensityState = rhythmManager.getCurrentState();
      expect(lowIntensityState.currentInterval).toBeGreaterThan(highIntensityState.currentInterval);
    });

    it('非ADAPTIVE模式下adaptToEmotion应该无效果', () => {
      rhythmManager.setRhythmMode('steady');
      
      const initialState = rhythmManager.getCurrentState();
      const initialInterval = initialState.currentInterval;
      
      rhythmManager.adaptToEmotion(0.9);
      const afterState = rhythmManager.getCurrentState();
      
      expect(afterState.currentInterval).toBe(initialInterval);
    });
  });

  describe('同步模式测试', () => {
    it('应该支持外部同步', () => {
      const syncInterval = 500;
      
      rhythmManager.syncWithExternal('test-source', syncInterval);
      
      const state = rhythmManager.getCurrentState();
      expect(state.currentMode).toBe('sync');
      expect(state.config.baseInterval).toBe(syncInterval);
      expect(state.config.syncSource).toBe('test-source');
    });
  });

  describe('事件监听测试', () => {
    it('应该正确触发节奏变化监听器', () => {
      const listener = jest.fn();
      
      rhythmManager.onRhythmChange(listener);
      rhythmManager.setRhythmMode('pulse');
      
      expect(listener).toHaveBeenCalledWith(
        'pulse',
        expect.objectContaining({
          mode: 'pulse'
        })
      );
    });

    it('应该支持移除监听器', () => {
      const listener = jest.fn();
      
      rhythmManager.onRhythmChange(listener);
      rhythmManager.offRhythmChange(listener);
      rhythmManager.setRhythmMode('pulse');
      
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('错误处理测试', () => {
    it('应该优雅处理回调函数错误', (done) => {
      const errorCallback = jest.fn(() => {
        throw new Error('Test callback error');
      });
      const normalCallback = jest.fn();
      
      rhythmManager.tick(errorCallback);
      rhythmManager.tick(normalCallback);
      rhythmManager.setRhythmMode('steady', { baseInterval: 100 });
      rhythmManager.start();
      
      setTimeout(() => {
        rhythmManager.stop();
        
        // 错误回调应该被调用但不影响正常回调
        expect(errorCallback).toHaveBeenCalled();
        expect(normalCallback).toHaveBeenCalled();
        
        done();
      }, 250);
    });

    it('应该优雅处理监听器错误', () => {
      const errorListener = jest.fn(() => {
        throw new Error('Test listener error');
      });
      const normalListener = jest.fn();
      
      rhythmManager.onRhythmChange(errorListener);
      rhythmManager.onRhythmChange(normalListener);
      
      expect(() => {
        rhythmManager.setRhythmMode('pulse');
      }).not.toThrow();
      
      expect(errorListener).toHaveBeenCalled();
      expect(normalListener).toHaveBeenCalled();
    });
  });

  describe('性能和资源管理测试', () => {
    it('应该正确清理资源', () => {
      rhythmManager.start();
      expect(rhythmManager.isActive()).toBe(true);
      
      rhythmManager.dispose();
      expect(rhythmManager.isActive()).toBe(false);
    });

    it('应该处理重复启动/停止', () => {
      expect(() => {
        rhythmManager.start();
        rhythmManager.start(); // 重复启动
        rhythmManager.stop();
        rhythmManager.stop();  // 重复停止
      }).not.toThrow();
    });

    it('应该处理暂停和恢复', () => {
      rhythmManager.start();
      expect(rhythmManager.isActive()).toBe(true);
      
      rhythmManager.pause();
      expect(rhythmManager.isActive()).toBe(false);
      
      rhythmManager.resume();
      expect(rhythmManager.isActive()).toBe(true);
      
      rhythmManager.stop();
    });
  });

  describe('默认配置测试', () => {
    it('应该有有效的默认配置', () => {
      expect(DefaultRhythmSettings.development).toBeDefined();
      expect(DefaultRhythmSettings.production).toBeDefined();
      expect(DefaultRhythmSettings.demo).toBeDefined();
      
      // 检查开发环境配置
      const devConfig = DefaultRhythmSettings.development;
      expect(devConfig.mode).toBe('steady');
      expect(devConfig.baseInterval).toBeGreaterThan(1000); // 开发环境应该较慢
      expect(devConfig.intensity).toBe('low');
    });
  });
});

// 集成测试：与其他组件的交互
describe('BehaviorRhythmManager 集成测试', () => {
  it('应该与 BehaviorScheduler 正确集成', async () => {
    // 这里可以添加与 BehaviorScheduler 的集成测试
    // 由于 BehaviorScheduler 可能依赖其他模块，这里只做基础验证
    
    const rhythmManager = new BehaviorRhythmManager();
    const callbacks: Array<{ timestamp: number; interval: number }> = [];
    
    rhythmManager.tick((timestamp, interval) => {
      callbacks.push({ timestamp, interval });
    });
    
    rhythmManager.setRhythmMode('steady', { baseInterval: 100 });
    rhythmManager.start();
    
    await new Promise(resolve => setTimeout(resolve, 250));
    
    rhythmManager.stop();
    rhythmManager.dispose();
    
    expect(callbacks.length).toBeGreaterThan(1);
    expect(callbacks[0].timestamp).toBeGreaterThan(0);
    expect(callbacks[0].interval).toBeGreaterThan(0);
  });
});

console.log('✅ BehaviorRhythmManager 测试文件加载完成');
