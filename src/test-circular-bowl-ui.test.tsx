import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CircularBowlUI from '../src/components/CircularBowlUI';

// Mock console.log to avoid cluttering test output
const originalConsoleLog = console.log;
beforeAll(() => {
  console.log = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
});

describe('CircularBowlUI Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders circular bowl UI component', () => {
    render(<CircularBowlUI />);
    
    // 检查是否有表情符号显示
    expect(screen.getByText('😌')).toBeInTheDocument();
  });

  test('shows state and speed information', () => {
    render(<CircularBowlUI />);
    
    // 检查状态信息是否显示
    expect(screen.getByText(/idle/i)).toBeInTheDocument();
    expect(screen.getByText(/1x/i)).toBeInTheDocument();
  });

  test('handles mouse enter and shows controls', async () => {
    render(<CircularBowlUI />);
    
    // 找到主碗元素
    const mainBowl = screen.getByText('😌').parentElement;
    expect(mainBowl).toBeInTheDocument();
    
    // 鼠标悬浮
    if (mainBowl) {
      fireEvent.mouseEnter(mainBowl);
      
      // 检查状态是否切换到hover
      expect(screen.getByText('😊')).toBeInTheDocument();
      expect(screen.getByText(/hover/i)).toBeInTheDocument();
    }
  });

  test('handles left click and shows active state', async () => {
    render(<CircularBowlUI />);
    
    const mainBowl = screen.getByText('😌');
    expect(mainBowl).toBeInTheDocument();
    
    // 点击主碗切换到active状态
    fireEvent.click(mainBowl);
    
    // 等待状态更新
    await waitFor(() => {
      expect(screen.getByText('😃')).toBeInTheDocument();
    });
    
    await waitFor(() => {
      expect(screen.getByText(/active/i)).toBeInTheDocument();
    });
  });

  test('handles right click and shows menu state', async () => {
    render(<CircularBowlUI />);
    
    const mainBowl = screen.getByText('😌');
    expect(mainBowl).toBeInTheDocument();
    
    // 右键点击主碗切换到menu状态
    fireEvent.contextMenu(mainBowl);
    
    // 等待状态更新
    await waitFor(() => {
      expect(screen.getByText('🤔')).toBeInTheDocument();
    });
    
    await waitFor(() => {
      expect(screen.getByText(/menu/i)).toBeInTheDocument();
    });
  });

  test('shows control buttons on hover', async () => {
    render(<CircularBowlUI />);
    
    const container = screen.getByTestId('circular-bowl-container');
    expect(container).toBeInTheDocument();
    
    fireEvent.mouseEnter(container);
    
    // 等待状态切换到hover
    await waitFor(() => {
      expect(screen.getByText('😊')).toBeInTheDocument();
    });
    
    // 等待控制按钮出现 (hover状态下的语音控制)
    await waitFor(() => {
      const playButton = screen.getByTitle('播放/暂停');
      expect(playButton).toBeInTheDocument();
    });
    
    const rewindButton = screen.getByTitle('快退 -5s');
    expect(rewindButton).toBeInTheDocument();
    
    const forwardButton = screen.getByTitle('快进 +5s');
    expect(forwardButton).toBeInTheDocument();
  });

  test('control buttons are clickable', async () => {
    render(<CircularBowlUI />);
    
    const container = screen.getByTestId('circular-bowl-container');
    expect(container).toBeInTheDocument();
    
    fireEvent.mouseEnter(container);
    
    // 等待控制按钮出现
    await waitFor(() => {
      const playButton = screen.getByTitle('播放/暂停');
      expect(playButton).toBeInTheDocument();
    });
    
    const playButton = screen.getByTitle('播放/暂停');
    fireEvent.click(playButton);
    
    // 检查console.log是否被调用 (这里测试功能被触发)
    expect(console.log).toHaveBeenCalledWith('播放/暂停');
  });

  test('speed toggle button works', async () => {
    render(<CircularBowlUI />);
    
    const container = screen.getByTestId('circular-bowl-container');
    expect(container).toBeInTheDocument();
    
    fireEvent.mouseEnter(container);
    
    // 等待状态更新
    await waitFor(() => {
      expect(screen.getByText(/1x/i)).toBeInTheDocument();
    });
    
    await waitFor(() => {
      const speedButton = screen.getByTitle('语速 1x');
      expect(speedButton).toBeInTheDocument();
    });
    
    const speedButton = screen.getByTitle('语速 1x');
    fireEvent.click(speedButton);
    
    // 等待速度更新到1.5x
    await waitFor(() => {
      expect(screen.getByText(/1.5x/i)).toBeInTheDocument();
    });
  });

  test('shows different controls for different states', async () => {
    render(<CircularBowlUI />);
    
    const mainBowl = screen.getByText('😌');
    expect(mainBowl).toBeInTheDocument();
    
    // 左键点击切换到active状态
    fireEvent.click(mainBowl);
    
    // 等待状态切换
    await waitFor(() => {
      expect(screen.getByText('😃')).toBeInTheDocument();
    });
    
    // active状态应该显示快捷操作按钮
    await waitFor(() => {
      expect(screen.getByTitle('截图')).toBeInTheDocument();
    });
    expect(screen.getByTitle('复制')).toBeInTheDocument();
    expect(screen.getByTitle('记笔记')).toBeInTheDocument();
    expect(screen.getByTitle('投屏')).toBeInTheDocument();
    
    // 右键点击切换到menu状态
    fireEvent.contextMenu(mainBowl);
    
    // 等待状态切换
    await waitFor(() => {
      expect(screen.getByText('🤔')).toBeInTheDocument();
    });
    
    // menu状态应该显示系统菜单按钮
    await waitFor(() => {
      expect(screen.getByTitle('换肤主题')).toBeInTheDocument();
    });
    expect(screen.getByTitle('AI对话')).toBeInTheDocument();
    expect(screen.getByTitle('打开网页')).toBeInTheDocument();
    expect(screen.getByTitle('设置面板')).toBeInTheDocument();
  });

  test('mouse leave hides controls after timeout', async () => {
    render(<CircularBowlUI />);
    
    const container = screen.getByTestId('circular-bowl-container');
    expect(container).toBeInTheDocument();
    
    // 鼠标进入显示控制
    fireEvent.mouseEnter(container);
    
    // 等待hover状态
    await waitFor(() => {
      expect(screen.getByText('😊')).toBeInTheDocument();
    });
    
    // 鼠标离开
    fireEvent.mouseLeave(container);
    
    // 等待300ms后检查是否隐藏，这里等待400ms确保足够时间
    await new Promise(resolve => setTimeout(resolve, 400));
    
    expect(screen.getByText('😌')).toBeInTheDocument();
  });
});

console.log('✅ T6-F CircularBowlUI测试套件已加载');
