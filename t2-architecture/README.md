# T2-Architecture | 神宠系统架构阶段

## 📋 阶段概述

T2阶段专注于神宠系统的技术架构设计，定义了系统各组件间的关系、数据流、插件机制和AI调度策略。

## 🏗️ 系统架构

### 核心架构图

```
┌─────────────────────────────────────────────────────────┐
│                    神宠系统架构                           │
├─────────────────────────────────────────────────────────┤
│  T6-UI Layer                                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │ PetSystemApp│  │ EmotionUI   │  │ InteractionUI│     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
├─────────────────────────────────────────────────────────┤
│  T5-Core Layer                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │ PetBrain    │  │ EmotionEngine│  │ BehaviorSched│     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
├─────────────────────────────────────────────────────────┤
│  T4-Models Layer                                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │ StrategyDB  │  │ BehaviorModel│  │ StateMemory │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
├─────────────────────────────────────────────────────────┤
│  T3-Player Layer                                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │ DirPlayer   │  │ PlayerPlugin │  │ MediaControl│     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
```

### 数据流向

```
User Input → T6-UI → T5-Core → T4-Models → T3-Player
    ↑                                           ↓
    └────────── Feedback Loop ←←←←←←←←←←←←←←←←←←←┘
```

## 🔌 插件架构

### 插件注册机制

```typescript
interface PluginInterface {
  id: string;
  name: string;
  version: string;
  init(): Promise<void>;
  execute(params: any): Promise<any>;
  destroy(): void;
}
```

### 热更新流程

1. **插件发现** - 扫描plugins目录
2. **依赖检查** - 验证插件版本兼容性
3. **动态加载** - 运行时注册插件
4. **事件绑定** - 绑定行为触发器
5. **状态同步** - 更新系统状态

## 🤖 AI调度策略

### 行为决策树

```
用户交互
    ├── 情绪识别
    │   ├── 开心 → 活跃行为
    │   ├── 难过 → 安慰行为
    │   └── 中性 → 日常行为
    ├── 行为选择
    │   ├── 策略匹配
    │   ├── 概率计算
    │   └── 执行队列
    └── 反馈学习
        ├── 效果评估
        ├── 策略调整
        └── 记忆更新
```

## 📁 文件结构

```
t2-architecture/
├── README.md                    # 本文档
├── diagrams/                    # 架构图
│   ├── system-architecture.png  # 系统架构图
│   ├── data-flow.png           # 数据流向图
│   ├── plugin-lifecycle.png    # 插件生命周期
│   └── ai-decision-tree.png    # AI决策树
├── specs/                       # 技术规格
│   ├── api-specification.md    # API规格定义
│   ├── plugin-interface.md     # 插件接口规范
│   ├── data-schema.md          # 数据结构定义
│   └── security-policy.md      # 安全策略
└── patterns/                    # 设计模式
    ├── observer-pattern.md     # 观察者模式应用
    ├── strategy-pattern.md     # 策略模式应用
    └── factory-pattern.md      # 工厂模式应用
```

## 🛠️ 技术栈

### 前端技术
- **React 18** - UI组件框架
- **TypeScript** - 类型安全的JavaScript
- **Vite** - 快速构建工具
- **CSS3** - 渐变背景和动画

### 后端/核心
- **Node.js** - JavaScript运行时
- **Electron** - 桌面应用包装
- **Jest** - 单元测试框架

### 数据存储
- **JSON** - 配置和状态存储
- **LocalStorage** - 浏览器本地存储
- **Memory** - 运行时状态管理

## 🔧 部署架构

### 开发环境
```bash
npm run dev        # 启动开发服务器
npm run ui:dev     # 启动UI开发环境
npm run test       # 运行测试套件
```

### 生产环境
```bash
npm run build      # 构建TypeScript
npm run ui:build   # 构建UI资源
npm run package    # 打包Electron应用
```

## 🔗 相关文档

- [T1-Prototype](../t1-prototype/README.md) - 原型设计
- [T3-Player](../t3-player/README.md) - 播放器模块
- [T4-Models](../t4-models/README.md) - 数据模型
- [T5-Core](../t5-core/README.md) - 核心逻辑
- [T6-UI](../t6-ui/README.md) - 用户界面

---

*T2阶段为神宠系统建立了坚实的技术架构基础，确保系统的可扩展性和可维护性。*
