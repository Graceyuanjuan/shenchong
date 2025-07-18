import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import BowlUI from './components/BowlUI';
import { PetState, EmotionType } from './types';

describe('T6-E BowlUI Component Tests', () => {
  const mockOnBowlStateChange = jest.fn();
  
  beforeEach(() => {
    mockOnBowlStateChange.mockClear();
  });

  test('✅ renders single interactive bowl correctly', () => {
    render(
      <BowlUI 
        onBowlStateChange={mockOnBowlStateChange}
        currentState={PetState.Idle}
        currentEmotion={EmotionType.Calm}
      />
    );
    
    // 应该有1个智能交互碗
    const bowls = screen.getAllByText('🥣');
    expect(bowls).toHaveLength(1);
    
    // 验证碗的状态标题 - 现在显示在右下角
    expect(screen.getByText(/idle.*calm/)).toBeInTheDocument();
  });

  test('✅ bowl click triggers awaken state change', () => {
    render(
      <BowlUI 
        onBowlStateChange={mockOnBowlStateChange}
        currentState={PetState.Idle}
        currentEmotion={EmotionType.Calm}
      />
    );
    
    // 点击碗（左键触发唤醒状态）
    const bowl = screen.getByText('🥣');
    fireEvent.click(bowl);
    
    // 验证调用参数 - 左键点击应该触发唤醒状态
    expect(mockOnBowlStateChange).toHaveBeenCalledTimes(1);
    expect(mockOnBowlStateChange).toHaveBeenCalledWith(
      PetState.Awaken,
      EmotionType.Excited
    );
  });

  test('✅ bowl right click triggers control state', () => {
    render(
      <BowlUI 
        onBowlStateChange={mockOnBowlStateChange}
        currentState={PetState.Idle}
        currentEmotion={EmotionType.Calm}
      />
    );
    
    // 右键点击碗（触发控制状态）
    const bowl = screen.getByText('🥣');
    fireEvent.contextMenu(bowl);
    
    // 验证调用参数 - 右键点击应该触发控制状态
    expect(mockOnBowlStateChange).toHaveBeenCalledTimes(1);
    expect(mockOnBowlStateChange).toHaveBeenCalledWith(
      PetState.Control,
      EmotionType.Focused
    );
  });

  test('✅ bowl shows correct tooltip', () => {
    render(
      <BowlUI 
        onBowlStateChange={mockOnBowlStateChange}
        currentState={PetState.Idle}
        currentEmotion={EmotionType.Calm}
      />
    );
    
    // 验证碗有正确的title属性
    const bowl = screen.getByText('🥣');
    expect(bowl).toHaveAttribute('title', '当前碗状态: idle');
  });

  test('✅ shows system status information', () => {
    render(
      <BowlUI 
        onBowlStateChange={mockOnBowlStateChange}
        currentState={PetState.Awaken}
        currentEmotion={EmotionType.Excited}
      />
    );
    
    // 验证状态信息显示 - 现在在右下角紧凑显示
    expect(screen.getByText(/idle.*excited/)).toBeInTheDocument();
  });

  test('✅ console log output on bowl interactions', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    render(
      <BowlUI 
        onBowlStateChange={mockOnBowlStateChange}
        currentState={PetState.Idle}
        currentEmotion={EmotionType.Calm}
      />
    );
    
    const bowl = screen.getByText('🥣');
    
    // 测试左键点击
    fireEvent.click(bowl);
    expect(consoleSpy).toHaveBeenCalledWith(
      '[🍚 BOWL] 状态切换: active'
    );
    
    // 测试右键点击
    fireEvent.contextMenu(bowl);
    expect(consoleSpy).toHaveBeenCalledWith(
      '[🍚 BOWL] 状态切换: menu'
    );
    
    consoleSpy.mockRestore();
  });
});

console.log('✅ T6-E BowlUI测试套件已加载');
