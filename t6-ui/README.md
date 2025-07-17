# T6-UI | 神宠系统用户界面阶段

## 📋 阶段概述

T6阶段专注于神宠系统的用户界面实现，包含React组件、渐变背景设计、情绪可视化、交互响应和整体UI体验优化。

## 🎨 界面特性

### 视觉设计
- **渐变背景** - 紫色渐变营造温馨氛围
- **神宠形象** - 汤圆造型，圆润可爱
- **情绪表达** - 表情符号和颜色变化
- **动画效果** - 平滑的状态过渡动画

### 交互功能
- **点击响应** - 点击宠物触发交互
- **情绪显示** - 实时显示宠物情绪状态
- **状态信息** - 左下角显示详细状态
- **交互计数** - 记录用户交互次数

### 响应式设计
- **自适应布局** - 适配不同屏幕尺寸
- **移动端优化** - 触摸友好的交互设计
- **性能优化** - 流畅的动画和渲染

## 📁 文件结构

```
t6-ui/
├── README.md                    # 本文档
├── PetSystemApp.tsx            # 主应用组件
├── ui-main.tsx                 # UI入口文件
├── ui-styles.css              # 全局样式文件
├── components/                 # UI组件库
│   ├── PetDisplay/            # 宠物显示组件
│   │   ├── PetAvatar.tsx      # 宠物头像
│   │   ├── EmotionIndicator.tsx # 情绪指示器
│   │   └── StatusPanel.tsx    # 状态面板
│   ├── Interaction/           # 交互组件
│   │   ├── ClickHandler.tsx   # 点击处理器
│   │   ├── GestureRecognizer.tsx # 手势识别
│   │   └── FeedbackSystem.tsx # 反馈系统
│   ├── Layout/                # 布局组件
│   │   ├── MainContainer.tsx  # 主容器
│   │   ├── Background.tsx     # 背景组件
│   │   └── Overlay.tsx        # 遮罩层
│   └── Common/                # 通用组件
│       ├── Button.tsx         # 按钮组件
│       ├── Modal.tsx          # 模态框
│       └── Tooltip.tsx        # 提示框
├── hooks/                     # React Hooks
│   ├── usePetState.ts        # 宠物状态Hook
│   ├── useEmotion.ts         # 情绪管理Hook
│   ├── useInteraction.ts     # 交互管理Hook
│   └── useAnimation.ts       # 动画控制Hook
├── styles/                    # 样式文件
│   ├── globals.css           # 全局样式
│   ├── components.css        # 组件样式
│   ├── animations.css        # 动画样式
│   └── themes.css            # 主题样式
├── utils/                     # UI工具函数
│   ├── colorUtils.ts         # 颜色工具
│   ├── animationUtils.ts     # 动画工具
│   └── responsiveUtils.ts    # 响应式工具
└── types/                     # UI类型定义
    ├── ui-types.ts           # UI相关类型
    ├── component-types.ts    # 组件类型
    └── style-types.ts        # 样式类型
```

## 🚀 快速开始

### 基础使用

```typescript
import React from 'react';
import { PetSystemApp } from './t6-ui/PetSystemApp';
import './t6-ui/ui-styles.css';

// 在主应用中使用
function App() {
  return (
    <div className="app">
      <PetSystemApp />
    </div>
  );
}

export default App;
```

### 自定义主题

```typescript
import { ThemeProvider } from './t6-ui/contexts/ThemeContext';

const customTheme = {
  colors: {
    primary: '#667eea',
    secondary: '#764ba2',
    accent: '#FFE55C',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  fonts: {
    primary: 'Arial, sans-serif',
    size: {
      small: '12px',
      medium: '16px',
      large: '24px'
    }
  }
};

function App() {
  return (
    <ThemeProvider theme={customTheme}>
      <PetSystemApp />
    </ThemeProvider>
  );
}
```

## 🎯 核心组件

### PetSystemApp

```typescript
interface PetSystemAppProps {
  initialState?: PetState;
  theme?: Theme;
  onInteraction?: (interaction: Interaction) => void;
  enableAnimations?: boolean;
}

const PetSystemApp: React.FC<PetSystemAppProps> = ({
  initialState = { state: 'awaken', emotion: 'happy' },
  theme,
  onInteraction,
  enableAnimations = true
}) => {
  // 组件实现
};
```

### 情绪可视化组件

```typescript
import { EmotionIndicator } from './t6-ui/components/PetDisplay/EmotionIndicator';

<EmotionIndicator
  emotion="happy"
  intensity={0.8}
  animated={true}
  size="large"
  showLabel={true}
/>
```

### 状态面板组件

```typescript
import { StatusPanel } from './t6-ui/components/PetDisplay/StatusPanel';

<StatusPanel
  state="awaken"
  emotion="happy"
  interactionCount={5}
  showDetails={true}
  position="bottom-left"
/>
```

## 🎨 样式系统

### CSS变量定义

```css
/* t6-ui/styles/themes.css */
:root {
  /* 颜色主题 */
  --pet-primary-color: #667eea;
  --pet-secondary-color: #764ba2;
  --pet-accent-color: #FFE55C;
  --pet-background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  
  /* 字体设置 */
  --pet-font-family: 'Arial', sans-serif;
  --pet-font-size-base: 16px;
  --pet-font-weight-normal: 400;
  --pet-font-weight-bold: 600;
  
  /* 间距设置 */
  --pet-spacing-xs: 4px;
  --pet-spacing-sm: 8px;
  --pet-spacing-md: 16px;
  --pet-spacing-lg: 24px;
  --pet-spacing-xl: 32px;
  
  /* 动画设置 */
  --pet-transition-fast: 0.2s ease;
  --pet-transition-normal: 0.3s ease;
  --pet-transition-slow: 0.5s ease;
}
```

### 响应式断点

```css
/* t6-ui/styles/responsive.css */
@media (max-width: 768px) {
  .pet-container {
    padding: var(--pet-spacing-sm);
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .pet-avatar {
    font-size: 3rem;
  }
  
  .status-panel {
    font-size: 12px;
  }
}
```

## 🔧 React Hooks

### usePetState Hook

```typescript
import { usePetState } from './t6-ui/hooks/usePetState';

function PetComponent() {
  const {
    state,
    emotion,
    interactionCount,
    updateState,
    updateEmotion,
    incrementInteraction
  } = usePetState({
    initialState: 'awaken',
    initialEmotion: 'happy'
  });

  return (
    <div onClick={incrementInteraction}>
      <div>状态: {state}</div>
      <div>情绪: {emotion}</div>
      <div>交互次数: {interactionCount}</div>
    </div>
  );
}
```

### useAnimation Hook

```typescript
import { useAnimation } from './t6-ui/hooks/useAnimation';

function AnimatedPet() {
  const { isAnimating, startAnimation, stopAnimation } = useAnimation();

  const handleClick = () => {
    startAnimation('bounce', 1000);
  };

  return (
    <div 
      className={`pet-avatar ${isAnimating ? 'animating' : ''}`}
      onClick={handleClick}
    >
      🐱
    </div>
  );
}
```

## 🎬 动画系统

### CSS动画定义

```css
/* t6-ui/styles/animations.css */
@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.pet-avatar.animating {
  animation: bounce 0.6s ease-in-out;
}

.emotion-indicator.pulse {
  animation: pulse 1s ease-in-out infinite;
}
```

### JavaScript动画控制

```typescript
import { animateElement } from './t6-ui/utils/animationUtils';

// 触发动画
animateElement('.pet-avatar', 'bounce', {
  duration: 600,
  easing: 'ease-in-out',
  onComplete: () => {
    console.log('动画完成');
  }
});
```

## 🧪 测试与调试

### 组件测试

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { PetSystemApp } from './t6-ui/PetSystemApp';

describe('PetSystemApp', () => {
  test('renders pet avatar', () => {
    render(<PetSystemApp />);
    const avatar = screen.getByRole('button');
    expect(avatar).toBeInTheDocument();
  });

  test('handles click interaction', () => {
    const onInteraction = jest.fn();
    render(<PetSystemApp onInteraction={onInteraction} />);
    
    const avatar = screen.getByRole('button');
    fireEvent.click(avatar);
    
    expect(onInteraction).toHaveBeenCalled();
  });
});
```

### 视觉回归测试

```typescript
import { chromatic } from '@chromatic-com/storybook';

// Storybook stories for visual testing
export default {
  title: 'PetSystem/App',
  component: PetSystemApp,
  parameters: {
    chromatic: { viewports: [320, 768, 1200] }
  }
};

export const Happy = () => (
  <PetSystemApp initialState={{ emotion: 'happy' }} />
);

export const Sad = () => (
  <PetSystemApp initialState={{ emotion: 'sad' }} />
);
```

## 🔗 相关文档

- [T5-Core](../t5-core/README.md) - 核心逻辑
- [设计规范](./docs/design-system.md) - UI设计规范
- [组件文档](./docs/components.md) - 组件使用文档
- [项目总体文档](../README.md)

## 🚨 开发注意事项

1. **性能优化** - 避免不必要的重渲染
2. **内存管理** - 及时清理事件监听器
3. **样式隔离** - 使用CSS Modules或Styled Components
4. **无障碍支持** - 遵循WCAG 2.1标准

---

*T6-UI提供了美观易用的神宠系统界面，为用户带来愉悦的交互体验。*
