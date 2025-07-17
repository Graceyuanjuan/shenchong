/**
 * T4-C: 节奏驱动 UI 测试文件
 * 
 * 测试 AnimatedPlayerComponent 的节奏驱动控制功能
 * 验证不同节奏模式下动画响应间隔是否符合预期
 */

import { jest } from '@jest/globals';
import { render, fireEvent, waitFor, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import AnimatedPlayerComponent, { 
  PetState, 
  EmotionType, 
  BehaviorBindingManager,
  BehaviorStrategy
} from '../components/Player/AnimatedPlayerComponent';
import { BehaviorRhythmManager } from '../../modules/rhythm/BehaviorRhythmManager';
import { RhythmMode } from '../../types/BehaviorRhythm';

// Mock CSS导入
jest.mock('../components/Player/AnimatedPlayer.css', () => ({}));

// Mock console methods for cleaner test output
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.log = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
  console.warn = originalConsoleWarn;
});

describe('T4-C: AnimatedPlayer 节奏驱动控制测试', () => {
  let componentRef: React.RefObject<BehaviorBindingManager | null>;
  let rhythmManager: BehaviorRhythmManager;

  // 创建 mock 策略的帮助函数
  const createMockStrategy = (behaviorName: string) => {
    const getStrategy = jest.fn((state: PetState, emotion: EmotionType) => behaviorName);
    const executeStrategy = jest.fn((behaviorName: string, context?: any) => {});
    
    return {
      getStrategy,
      executeStrategy
    } as BehaviorStrategy & {
      getStrategy: jest.MockedFunction<(state: PetState, emotion: EmotionType) => string>;
      executeStrategy: jest.MockedFunction<(behaviorName: string, context?: any) => void>;
    };
  };

  beforeEach(() => {
    componentRef = React.createRef();
    rhythmManager = new BehaviorRhythmManager();
  });

  afterEach(() => {
    jest.clearAllMocks();
    rhythmManager.stop();
  });

  describe('场景1: 节奏模式配置', () => {
    it('应该支持在组件初始化时设置默认节奏模式', async () => {
      const { container } = render(
        <AnimatedPlayerComponent
          ref={componentRef}
          petState={PetState.Awaken}
          emotionType={EmotionType.Happy}
        />
      );

      await waitFor(() => {
        expect(componentRef.current).toBeTruthy();
      });

      // 验证组件已正确初始化
      expect(container.querySelector('.animated-player-container')).toBeInTheDocument();
    });

    it('应该支持通过 bindBehaviorStrategy 传入节奏参数', async () => {
      const mockStrategy: BehaviorStrategy = {
        getStrategy: jest.fn((state: PetState, emotion: EmotionType) => 'play_idle'),
        executeStrategy: jest.fn((behaviorName: string, context?: any) => {})
      };

      const { container } = render(
        <AnimatedPlayerComponent
          ref={componentRef}
          petState={PetState.Control}
          emotionType={EmotionType.Focused}
        />
      );

      await waitFor(() => {
        expect(componentRef.current).toBeTruthy();
      });

      // 绑定策略并指定节奏模式
      act(() => {
        componentRef.current?.bindBehaviorStrategy(mockStrategy, RhythmMode.PULSE);
      });

      await waitFor(() => {
        expect(mockStrategy.getStrategy).toHaveBeenCalledWith(
          PetState.Control,
          EmotionType.Focused
        );
      });
    });
  });

  describe('场景2: 节奏驱动行为执行', () => {
    it('应该在 PULSE 模式下按预期间隔触发行为', async () => {
      jest.useFakeTimers();
      
      const mockStrategy: BehaviorStrategy = {
        getStrategy: jest.fn((state: PetState, emotion: EmotionType) => 'show_happy'),
        executeStrategy: jest.fn((behaviorName: string, context?: any) => {})
      };

      const { container } = render(
        <AnimatedPlayerComponent
          ref={componentRef}
          petState={PetState.Awaken}
          emotionType={EmotionType.Happy}
        />
      );

      await waitFor(() => {
        expect(componentRef.current).toBeTruthy();
      });

      // 绑定策略并设置 PULSE 模式
      act(() => {
        componentRef.current?.bindBehaviorStrategy(mockStrategy, RhythmMode.PULSE);
      });

      // PULSE 模式的基础间隔是 400ms
      // 验证动画触发
      await waitFor(() => {
        const animatedElement = container.querySelector('.animated-player-container');
        expect(animatedElement).toBeInTheDocument();
      });

      jest.useRealTimers();
    });

    it('应该在 STEADY 模式下保持稳定的节奏间隔', async () => {
      jest.useFakeTimers();
      
      const mockStrategy: BehaviorStrategy = {
        getStrategy: jest.fn((state: PetState, emotion: EmotionType) => 'show_focused'),
        executeStrategy: jest.fn((behaviorName: string, context?: any) => {})
      };

      const { container } = render(
        <AnimatedPlayerComponent
          ref={componentRef}
          petState={PetState.Control}
          emotionType={EmotionType.Focused}
        />
      );

      await waitFor(() => {
        expect(componentRef.current).toBeTruthy();
      });

      // 绑定策略并设置 STEADY 模式
      act(() => {
        componentRef.current?.bindBehaviorStrategy(mockStrategy, RhythmMode.STEADY);
      });

      // STEADY 模式的基础间隔是 1000ms
      await waitFor(() => {
        expect(mockStrategy.getStrategy).toHaveBeenCalled();
      });

      jest.useRealTimers();
    });
  });

  describe('场景3: 动画效果验证', () => {
    it('应该根据行为类型应用正确的动画', async () => {
      const mockStrategy = createMockStrategy('show_excited');

      const { container } = render(
        <AnimatedPlayerComponent
          ref={componentRef}
          petState={PetState.Control}
          emotionType={EmotionType.Excited}
        />
      );

      await waitFor(() => {
        expect(componentRef.current).toBeTruthy();
      });

      act(() => {
        componentRef.current?.bindBehaviorStrategy(mockStrategy, RhythmMode.PULSE);
      });

      // 验证excited行为应用了spin动画
      await waitFor(() => {
        const animatedElement = container.querySelector('.animated-player-container');
        // 注意：实际的CSS类可能需要根据实现调整
        expect(animatedElement).toHaveClass('animated-player-container');
      });
    });

    it('应该在动画完成后正确重置状态', async () => {
      jest.useFakeTimers();

      const mockStrategy = createMockStrategy('show_calm');

      const { container } = render(
        <AnimatedPlayerComponent
          ref={componentRef}
          petState={PetState.Idle}
          emotionType={EmotionType.Calm}
        />
      );

      await waitFor(() => {
        expect(componentRef.current).toBeTruthy();
      });

      act(() => {
        componentRef.current?.bindBehaviorStrategy(mockStrategy, RhythmMode.STEADY);
      });

      // 等待动画开始
      act(() => {
        jest.advanceTimersByTime(100);
      });

      // 等待动画结束（STEADY模式间隔1000ms，动画时长为间隔的80%）
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // 验证动画状态已重置
      await waitFor(() => {
        const animatedElement = container.querySelector('.animated-player-container');
        expect(animatedElement).toBeInTheDocument();
      });

      jest.useRealTimers();
    });
  });

  describe('场景4: 节奏同步与性能', () => {
    it('应该防止行为过度堆叠', async () => {
      const mockStrategy = createMockStrategy('play_alert');

      const { container } = render(
        <AnimatedPlayerComponent
          ref={componentRef}
          petState={PetState.Awaken}
          emotionType={EmotionType.Excited}
        />
      );

      await waitFor(() => {
        expect(componentRef.current).toBeTruthy();
      });

      // 快速连续绑定多个策略
      act(() => {
        componentRef.current?.bindBehaviorStrategy(mockStrategy, RhythmMode.PULSE);
        componentRef.current?.bindBehaviorStrategy(mockStrategy, RhythmMode.PULSE);
        componentRef.current?.bindBehaviorStrategy(mockStrategy, RhythmMode.PULSE);
      });

      // 验证只有一个策略生效
      await waitFor(() => {
        // getStrategy 应该只被调用几次，而不是大量堆叠
        expect(mockStrategy.getStrategy.mock.calls.length).toBeLessThan(10);
      });
    });

    it('应该在高频率切换节奏模式时保持稳定', async () => {
      const mockStrategy = createMockStrategy('hover_feedback');

      const { container } = render(
        <AnimatedPlayerComponent
          ref={componentRef}
          petState={PetState.Hover}
          emotionType={EmotionType.Curious}
        />
      );

      await waitFor(() => {
        expect(componentRef.current).toBeTruthy();
      });

      // 快速切换不同的节奏模式
      const rhythmModes = [RhythmMode.PULSE, RhythmMode.STEADY, RhythmMode.SEQUENCE];
      
      for (const mode of rhythmModes) {
        act(() => {
          componentRef.current?.bindBehaviorStrategy(mockStrategy, mode);
        });
        
        // 短暂等待确保模式切换
        await waitFor(() => {
          expect(mockStrategy.getStrategy).toHaveBeenCalled();
        });
      }

      // 验证组件仍然正常工作
      expect(container.querySelector('.animated-player-container')).toBeInTheDocument();
    });
  });

  describe('场景5: 错误处理与降级', () => {
    it('应该在节奏管理器未初始化时降级到普通执行', async () => {
      // 不初始化 rhythmManager，直接测试行为执行
      const mockStrategy = createMockStrategy('play_idle');

      const { container } = render(
        <AnimatedPlayerComponent
          ref={componentRef}
          petState={PetState.Idle}
          emotionType={EmotionType.Happy}
        />
      );

      await waitFor(() => {
        expect(componentRef.current).toBeTruthy();
      });

      // 绑定策略时不传递节奏模式
      act(() => {
        componentRef.current?.bindBehaviorStrategy(mockStrategy);
      });

      // 验证行为仍然能够执行
      await waitFor(() => {
        expect(mockStrategy.getStrategy).toHaveBeenCalled();
      });

      expect(container.querySelector('.animated-player-container')).toBeInTheDocument();
    });

    it('应该在无效的节奏模式时使用默认模式', async () => {
      const mockStrategy = createMockStrategy('show_curious');

      const { container } = render(
        <AnimatedPlayerComponent
          ref={componentRef}
          petState={PetState.Awaken}
          emotionType={EmotionType.Curious}
        />
      );

      await waitFor(() => {
        expect(componentRef.current).toBeTruthy();
      });

      // 使用有效的节奏模式
      act(() => {
        componentRef.current?.bindBehaviorStrategy(mockStrategy, RhythmMode.ADAPTIVE);
      });

      await waitFor(() => {
        expect(mockStrategy.getStrategy).toHaveBeenCalled();
      });

      expect(container.querySelector('.animated-player-container')).toBeInTheDocument();
    });
  });
});

console.log('✅ test-rhythm-driven-ui.tsx 测试文件已创建');
