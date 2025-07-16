/**
 * 📌 BehaviorRhythmManager 单元测试
 */

import { BehaviorRhythmManager, RhythmStep, RhythmSteps, createBehaviorRhythmManager } from '../modules/behavior/BehaviorRhythmManager';

describe('BehaviorRhythmManager', () => {
  let mockExecuteStep: jest.Mock;
  let rhythmManager: BehaviorRhythmManager;

  beforeEach(() => {
    mockExecuteStep = jest.fn().mockResolvedValue(undefined);
    rhythmManager = new BehaviorRhythmManager(mockExecuteStep);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    rhythmManager.stop();
  });

  describe('基本功能测试', () => {
    test('应该能够调度和执行步骤序列', async () => {
      const steps: RhythmStep[] = [
        { type: 'say', content: 'hello' },
        { type: 'animate', name: 'wave' }
      ];

      rhythmManager.scheduleWithRhythm(steps);

      // 等待异步执行
      await Promise.resolve();

      expect(mockExecuteStep).toHaveBeenCalledTimes(2);
      expect(mockExecuteStep).toHaveBeenNthCalledWith(1, { type: 'say', content: 'hello' });
      expect(mockExecuteStep).toHaveBeenNthCalledWith(2, { type: 'animate', name: 'wave' });
    });

    test('应该正确处理等待步骤', async () => {
      const steps: RhythmStep[] = [
        { type: 'say', content: 'start' },
        { type: 'wait', duration: 1000 },
        { type: 'say', content: 'end' }
      ];

      rhythmManager.scheduleWithRhythm(steps);
      await Promise.resolve();

      // 第一个步骤应该立即执行
      expect(mockExecuteStep).toHaveBeenCalledTimes(1);
      expect(mockExecuteStep).toHaveBeenCalledWith({ type: 'say', content: 'start' });

      // 快进时间
      jest.advanceTimersByTime(1000);
      await Promise.resolve();

      // 等待后第三个步骤应该执行
      expect(mockExecuteStep).toHaveBeenCalledTimes(2);
      expect(mockExecuteStep).toHaveBeenNthCalledWith(2, { type: 'say', content: 'end' });
    });

    test('应该能够暂停和恢复执行', async () => {
      const steps: RhythmStep[] = [
        { type: 'say', content: 'step1' },
        { type: 'wait', duration: 1000 },
        { type: 'say', content: 'step2' }
      ];

      rhythmManager.scheduleWithRhythm(steps);
      await Promise.resolve();

      // 暂停
      rhythmManager.pause();
      jest.advanceTimersByTime(1000);
      await Promise.resolve();

      // 应该只执行了第一个步骤
      expect(mockExecuteStep).toHaveBeenCalledTimes(1);

      // 恢复
      rhythmManager.resume();
      jest.advanceTimersByTime(1000);
      await Promise.resolve();

      // 现在应该执行了第二个步骤
      expect(mockExecuteStep).toHaveBeenCalledTimes(2);
    });

    test('应该能够停止执行', async () => {
      const steps: RhythmStep[] = [
        { type: 'say', content: 'step1' },
        { type: 'wait', duration: 1000 },
        { type: 'say', content: 'step2' }
      ];

      rhythmManager.scheduleWithRhythm(steps);
      await Promise.resolve();

      // 停止
      rhythmManager.stop();
      jest.advanceTimersByTime(1000);
      await Promise.resolve();

      // 应该只执行了第一个步骤
      expect(mockExecuteStep).toHaveBeenCalledTimes(1);

      const status = rhythmManager.getStatus();
      expect(status.isRunning).toBe(false);
    });
  });

  describe('状态管理测试', () => {
    test('应该正确报告执行状态', () => {
      const steps: RhythmStep[] = [
        { type: 'say', content: 'step1' },
        { type: 'say', content: 'step2' }
      ];

      let status = rhythmManager.getStatus();
      expect(status.isRunning).toBe(false);
      expect(status.currentStep).toBe(0);
      expect(status.totalSteps).toBe(0);

      rhythmManager.scheduleWithRhythm(steps);
      status = rhythmManager.getStatus();
      expect(status.isRunning).toBe(true);
      expect(status.totalSteps).toBe(2);
    });

    test('应该能够添加步骤到队列', () => {
      const initialSteps: RhythmStep[] = [{ type: 'say', content: 'step1' }];
      rhythmManager.scheduleWithRhythm(initialSteps);

      rhythmManager.appendStep({ type: 'say', content: 'step2' });

      const status = rhythmManager.getStatus();
      expect(status.totalSteps).toBe(2);
    });
  });

  describe('错误处理测试', () => {
  test('应该处理步骤执行错误', async () => {
    const onError = jest.fn();
    const rhythmManagerWithError = new BehaviorRhythmManager(
      jest.fn().mockRejectedValue(new Error('执行失败')),
      { onError }
    );

    const steps: RhythmStep[] = [
      { type: 'say', content: 'step1' },
      { type: 'say', content: 'step2' }
    ];

    rhythmManagerWithError.scheduleWithRhythm(steps);
    await Promise.resolve();
    await Promise.resolve(); // 等待错误处理完成

    expect(onError).toHaveBeenCalledTimes(2);
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      { type: 'say', content: 'step1' }
    );
  });

    test('应该拒绝过多的步骤', () => {
      const rhythmManagerWithLimit = new BehaviorRhythmManager(
        mockExecuteStep,
        { maxSteps: 2 }
      );

      const steps: RhythmStep[] = [
        { type: 'say', content: 'step1' },
        { type: 'say', content: 'step2' },
        { type: 'say', content: 'step3' }
      ];

      expect(() => {
        rhythmManagerWithLimit.scheduleWithRhythm(steps);
      }).toThrow('Steps count exceeds maximum limit: 2');
    });
  });

  describe('完成回调测试', () => {
    test('应该在序列完成时调用回调', async () => {
      const onComplete = jest.fn();
      const rhythmManagerWithCallback = new BehaviorRhythmManager(
        mockExecuteStep,
        { onComplete }
      );

      const steps: RhythmStep[] = [{ type: 'say', content: 'only step' }];

      rhythmManagerWithCallback.scheduleWithRhythm(steps);
      await Promise.resolve();

      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });
});

describe('RhythmSteps 辅助函数', () => {
  test('应该创建正确的步骤对象', () => {
    expect(RhythmSteps.say('hello')).toEqual({ type: 'say', content: 'hello' });
    expect(RhythmSteps.wait(1000)).toEqual({ type: 'wait', duration: 1000 });
    expect(RhythmSteps.animate('wave')).toEqual({ type: 'animate', name: 'wave' });
    expect(RhythmSteps.playPlugin('music', { volume: 0.5 })).toEqual({
      type: 'playPlugin',
      pluginId: 'music',
      params: { volume: 0.5 }
    });
  });

  test('应该创建问候序列', () => {
    const greeting = RhythmSteps.greeting('Alice');
    expect(greeting).toHaveLength(5);
    expect(greeting[0]).toEqual({ type: 'say', content: '你好，Alice！' });
    expect(greeting[2]).toEqual({ type: 'animate', name: 'wave' });
  });

  test('应该创建庆祝序列', () => {
    const celebration = RhythmSteps.celebration();
    expect(celebration).toHaveLength(6); // 修正期望长度
    expect(celebration[0]).toEqual({ type: 'say', content: '太棒了！' });
    expect(celebration[1]).toEqual({ type: 'animate', name: 'jump' });
  });
});

describe('createBehaviorRhythmManager 工厂函数', () => {
  test('应该创建配置正确的管理器实例', () => {
    const executeStep = jest.fn();
    const config = { maxSteps: 10, defaultWaitDuration: 200 };
    
    const manager = createBehaviorRhythmManager(executeStep, config);
    
    expect(manager).toBeInstanceOf(BehaviorRhythmManager);
  });
});

// 集成测试示例
describe('集成测试', () => {
  test('完整的节奏序列执行流程', async () => {
    jest.useFakeTimers(); // 在这个测试中使用假定时器
    
    const executionLog: string[] = [];
    
    const testExecuteStep = async (step: RhythmStep) => {
      executionLog.push(`执行: ${step.type} - ${JSON.stringify(step)}`);
    };

    const manager = createBehaviorRhythmManager(testExecuteStep, {
      onComplete: () => executionLog.push('序列完成'),
      onError: (error, step) => executionLog.push(`错误: ${error.message}`)
    });

    const steps: RhythmStep[] = [
      RhythmSteps.say('开始'),
      RhythmSteps.wait(100),
      RhythmSteps.animate('wave'),
      RhythmSteps.say('结束')
    ];

    manager.scheduleWithRhythm(steps);
    
    // 等待同步步骤执行
    await Promise.resolve();
    
    // 快进等待时间
    jest.advanceTimersByTime(100);
    await Promise.resolve();
    await Promise.resolve(); // 额外等待确保完成回调执行

    expect(executionLog).toContain('执行: say - {"type":"say","content":"开始"}');
    expect(executionLog).toContain('执行: animate - {"type":"animate","name":"wave"}');
    expect(executionLog).toContain('执行: say - {"type":"say","content":"结束"}');
    expect(executionLog).toContain('序列完成');
    
    jest.useRealTimers(); // 恢复真实定时器
  });
});
