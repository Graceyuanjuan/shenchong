# 神宠计划 Shenchong Project

> 一只神宠，不是宠物。  
> 它是你通向世界的情绪入口，是你与 AI 舰队协同的前台指挥，  
> 是未来人类操作系统的第一颗信任粒子。

---

## 🧭 项目简介 | About

`shenchong` 是一款面向多智能体时代的桌面宠物系统，  
由 Grace Yuan Juan 发起，融合了 **AI 编排、情绪交互、语音播放、界面拟物** 四大核心模块，  
其目标是：让每个人都拥有一个属于自己的 AI 协作官。

它不是“命令式工具”，  
而是一个长期陪伴、主动服务、懂你习惯和状态的伙伴，  
一只被情绪注入灵魂、被指令赋予能力、被AI激活的“神宠”。

---

## 🔧 模块架构 | Structure

shenchong/
├── agent/        # 多AI智能体编排模块
├── player/       # 桌面语音播放器（Hover 弹出式）
├── voice/        # 语音合成与情绪识别
├── ui/           # 汤圆碗形皮肤 & 状态交互逻辑
├── public/       # 静态资源：音频 / 图标 / 配置
├── .gitignore
└── # 🌐 SaintGrid 神宠系统 - 主脑架构

基于 TypeScript 的模块化 AI 桌面宠物系统，采用四态汤圆皮肤设计。

## 🍡 系统概述

SaintGrid 神宠系统是一个**感知 + 情绪驱动 + 多模输入统一**的 AI 桌面引擎。本项目实现了完整的主脑架构，支持插件化扩展和情绪化交互。

### 🌀 四态交互模型

| 状态编号 | 状态名称 | 英文名 | 触发方式 | 功能说明 |
|----------|----------|--------|-----------|-----------|
| ①        | 静碗     | Idle Bowl     | 默认状态   | 待命情绪展示，偶尔眨眼或漂浮 |
| ②        | 感应碗   | Hover Bowl    | 鼠标悬浮   | 泛光提示，弹出语音播报、字幕、音量调节等 |
| ③        | 唤醒碗   | Awaken Bowl   | 左键点击   | 呼出截图、复制、记要、投屏等工具功能 |
| ④        | 控制碗   | Control Bowl  | 右键点击   | 弹出设置菜单，进入神宠对话、换肤、AI 控制台等 |

## 🧠 主脑架构

### 核心模块

```
src/
├── core/                   # 主脑核心模块
│   ├── PetBrain.ts        # 主脑调度器（中央指令中枢）
│   ├── PluginRegistry.ts  # 插件注册管理器
│   ├── IntentRouter.ts    # 意图识别器
│   ├── EmotionEngine.ts   # 情绪引擎
│   └── StateMemory.ts     # 记忆管理器
├── plugins/               # 插件系统
│   └── ExamplePlugins.ts  # 示例插件（截图、笔记）
├── types/                 # 类型定义
│   └── index.ts          # 核心类型和接口
└── index.ts              # 主入口文件
```


### 🧩 模块功能


- **🧠 PetBrain**: 主脑调度器，统一管理所有模块，处理用户输入并协调响应
- **🔌 PluginRegistry**: 插件注册器，管理插件生命周期与调用权限
- **🎯 IntentRouter**: 意图调度器，识别用户输入的语义意图
- **😊 EmotionEngine**: 情绪引擎，理解语气和情绪，决定宠物表现
- **💾 StateMemory**: 记忆模块，记录用户行为、对话上下文、喜好偏好

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```


### 2. 编译项目


```bash
npm run build
```


### 3. 使用示例


```typescript
import { SaintGridPetSystem, startPetSystemDemo } from './src';

// 启动演示
const petSystem = await startPetSystemDemo();

// 或者手动创建和配置
const petSystem = new SaintGridPetSystem();
await petSystem.start();

// 处理用户输入
await petSystem.handleUserInput('截图');
await petSystem.handleUserInput('记录：今天学习了AI开发');
await petSystem.handleUserInput('我很开心！');
```


## 🎭 情绪系统


### 支持的情绪类型


- **😊 Happy**: 开心 - 任务成功、收到赞美时
- **😌 Calm**: 平静 - 默认状态、处理常规任务时  
- **🤩 Excited**: 兴奋 - 频繁交互、复杂任务时
- **🤔 Curious**: 好奇 - 遇到新指令、未知输入时
- **😴 Sleepy**: 困倦 - 长时间闲置、深夜时段
- **🎯 Focused**: 专注 - 执行工作相关任务时

### 情绪表现

每种情绪都有对应的视觉表现：

```typescript
{
  animation: 'bounce',     // 动画效果
  color: '#FFD700',       // 主体颜色
  particle: 'sparkles',   // 粒子特效
  sound: 'happy_chime'    // 音效提示
}
```


## 🔌 插件系统详解


### 插件系统概览

插件系统是 SaintGrid 神宠主脑架构的核心扩展机制。每个插件都能感知主脑的状态变化和情绪状态，并根据不同的状态组合做出智能响应，真正实现"拟人化"的交互体验。

#### 插件在主脑架构中的定位

```
用户输入 → 意图识别 → 插件调度 → 状态感知 → 情绪响应 → 执行动作
     ↓            ↓           ↓          ↓          ↓          ↓
  自然语言    IntentRouter  PluginRegistry  PetState  EmotionEngine  PluginResponse
```


#### 插件响应的生命周期节点


1. **状态切换触发** - 当主脑状态发生变化时自动触发
2. **用户意图触发** - 当用户输入匹配插件意图时触发  
3. **状态钩子触发** - 特定状态转换时的钩子响应
4. **情绪变化触发** - 情绪显著变化时的响应（预留）

### 快速开始：如何接入新插件

#### 1. 实现插件接口

创建一个实现 `IPlugin` 接口的插件类：

```typescript
import { 
  IPlugin, 
  UserIntent, 
  PluginResponse, 
  EmotionType, 
  PetState,
  EmotionContext,
  PluginContext 
} from './src/types';

export class MyPlugin implements IPlugin {
  id = 'my_plugin';
  name = '我的插件';
  version = '1.0.0';
  description = '这是一个示例插件';
  supportedIntents = ['my_action'];
  
  // 声明插件能力
  capabilities = {
    stateAware: true,       // 支持状态感知
    emotionAware: true,     // 支持情绪感知
    contextAware: true,     // 支持上下文感知
    supportedHooks: ['onStateChanged'] // 支持的钩子类型
  };

  async initialize(): Promise<void> {
    console.log(`${this.name} 插件已初始化`);
  }

  async execute(intent: UserIntent, context: any): Promise<PluginResponse> {
    return {
      success: true,
      data: { result: 'success' },
      message: '操作完成',
      emotion: EmotionType.Happy
    };
  }

  // 状态触发方法 - 支持情绪感知
  async trigger(state: PetState, emotion: EmotionContext, context?: PluginContext): Promise<PluginResponse> {
    console.log(`[MyPlugin] 状态: ${state}, 情绪: ${emotion.currentEmotion}, 强度: ${emotion.intensity}`);
    
    // 根据状态和情绪组合做出智能响应
    if (state === PetState.Awaken && emotion.currentEmotion === EmotionType.Excited) {
      return {
        success: true,
        data: { action: 'excited_response' },
        message: '兴奋状态下的特殊响应！',
        emotion: EmotionType.Happy
      };
    }
    
    return {
      success: true,
      data: null,
      message: `在${state}状态下待命`,
      emotion: emotion.currentEmotion
    };
  }

  // 状态变化钩子
  async onStateChanged(oldState: PetState, newState: PetState, emotion: EmotionContext, context?: PluginContext): Promise<PluginResponse> {
    console.log(`[MyPlugin] 状态变化: ${oldState} → ${newState}, 情绪: ${emotion.currentEmotion}`);
    
    // 特定状态转换的智能响应
    if (oldState === PetState.Idle && newState === PetState.Awaken && emotion.intensity > 0.8) {
      return {
        success: true,
        data: { urgent: true },
        message: '检测到紧急唤醒，立即响应！',
        emotion: EmotionType.Focused
      };
    }
    
    return {
      success: true,
      data: null,
      message: `状态钩子执行完成: ${oldState} → ${newState}`,
      emotion: emotion.currentEmotion
    };
  }

  async destroy(): Promise<void> {
    console.log(`${this.name} 插件已销毁`);
  }
}
```


#### 2. 注册插件


```typescript
import { PetBrain } from './src/core/PetBrain';

// 创建主脑实例
const brain = new PetBrain();
await brain.initialize();

// 创建并注册插件
const myPlugin = new MyPlugin();
await brain.registerPlugin(myPlugin);

console.log('插件注册完成！');
```


#### 3. 简化版插件示例

如果不需要情绪感知，也可以创建简化版插件：

```typescript
const simplePlugin = {
  id: 'simple_plugin',
  name: '简单插件',
  version: '1.0.0',
  description: '简化版插件示例',
  supportedIntents: ['simple_action'],
  
  async initialize() {
    console.log('简单插件已初始化');
  },
  
  async execute(intent, context) {
    return {
      success: true,
      data: { message: 'Hello World' },
      message: '简单插件执行完成',
      emotion: 'happy'
    };
  },
  
  async trigger(state, emotion) {
    console.log(`[SimplePlugin] 在 ${state} 状态下被触发`);
    return {
      success: true,
      data: null,
      message: `简单插件在${state}状态下响应`,
      emotion: emotion
    };
  },
  
  async destroy() {
    console.log('简单插件已销毁');
  }
};

await brain.registerPlugin(simplePlugin);
```


### 状态与情绪感知表格

以下是内置示例插件的状态和情绪感知能力：

| 插件名 | 响应状态 | 响应情绪 | 动作描述 | 触发条件 |
|--------|----------|----------|----------|----------|
| **ScreenshotPlugin** | Awaken | Curious | 探索性截图 | 好奇情绪下的主动截图 |
| | Awaken | Focused | 精准截图 | 专注情绪下的精确截图 |
| | Hover | * | 显示截图选项 | 任何情绪下的选项展示 |
| | Control | * | 截图设置面板 | 设置和配置界面 |
| **NotePlugin** | Hover | Focused | 自动记录摘要 | 专注时自动创建工作摘要 |
| | Awaken | Excited | 创意记录模式 | 兴奋时激活创意捕捉 |
| | Awaken | * | 快速笔记模式 | 任何情绪下的快速记录 |
| | Control | * | 笔记管理面板 | 笔记整理和设置 |

#### 状态钩子响应表格

| 插件名 | 状态转换 | 情绪条件 | 钩子响应 | 说明 |
|--------|----------|----------|----------|------|
| **ScreenshotPlugin** | Idle → Awaken | 强度 > 0.7 | 紧急截图 | 高强度情绪的快速响应 |
| | * → Control | Focused | 预加载工具 | 专注时预加载截图工具 |
| **NotePlugin** | Awaken → Hover | Happy | 成就记录建议 | 愉快完成任务后的记录提醒 |
| | * → Awaken | 强度 > 0.8 | 情绪记录 | 强烈情绪的快速记录 |

### 日志输出格式说明

插件系统提供统一的日志格式，便于调试和监控：

#### 插件触发日志

```
🎯 [插件响应] ScreenshotPlugin | 状态: awaken | 情绪: curious | 情绪感知: ✅
✅ [插件完成] ScreenshotPlugin | 状态: awaken | 情绪: curious | 结果: 探索截图完成

```

#### 状态钩子日志

```
🪝 [钩子响应] NotePlugin.onStateChanged | idle → awaken | 情绪: excited
✅ [钩子完成] NotePlugin | 状态钩子执行成功: 情绪记录建议已生成
```


#### 插件汇总日志

```
🔌 [插件汇总] 状态: awaken | 总数: 2 | 成功: 2 | 情绪感知: 2
🪝 [钩子汇总] onStateChanged | 状态: idle → awaken | 总数: 2 | 成功: 2

```

#### 日志格式说明

- **🎯 [插件响应]**: 单个插件被状态变化触发时的响应
- **✅ [插件完成]**: 插件执行完成时的结果报告
- **🪝 [钩子响应]**: 状态钩子被触发时的响应
- **🔌 [插件汇总]**: 批量插件执行的统计信息
- **情绪感知**: ✅ 表示插件支持情绪感知，❌ 表示传统插件

### 进阶用法

#### 1. 定义 onStateChanged() 钩子

状态钩子允许插件监听特定的状态转换并做出响应：

```typescript

async onStateChanged(
  oldState: PetState, 
  newState: PetState, 
  emotion: EmotionContext, 
  context?: PluginContext
): Promise<PluginResponse> {
  // 监听从静态直接到唤醒的转换（可能是紧急情况）
  if (oldState === PetState.Idle && newState === PetState.Awaken) {
    if (emotion.intensity > 0.8) {
      // 高强度情绪 + 直接唤醒 = 紧急响应
      return {
        success: true,
        data: { priority: 'urgent' },
        message: '检测到紧急情况，立即执行相关操作',
        emotion: EmotionType.Focused
      };
    }
  }
  
  // 从唤醒到悬浮且情绪愉快（可能刚完成任务）
  if (oldState === PetState.Awaken && newState === PetState.Hover && emotion.currentEmotion === EmotionType.Happy) {
    return {
      success: true,
      data: { suggestion: 'record_achievement' },
      message: '检测到任务完成，建议记录成果',
      emotion: EmotionType.Happy
    };
  }
  
  return {
    success: true,
    data: null,
    message: `状态钩子监听: ${oldState} → ${newState}`,
    emotion: emotion.currentEmotion
  };
}

```

#### 2. 插件状态共享（依赖注入接口）

为未来的插件间状态共享预留接口设计：

```typescript

export interface PluginStateManager {
  // 共享状态读取
  getSharedState(key: string): any;
  
  // 共享状态写入
  setSharedState(key: string, value: any): void;
  
  // 监听其他插件的状态变化
  onPluginStateChange(pluginId: string, callback: (state: any) => void): void;
  
  // 插件间消息传递
  sendMessage(targetPluginId: string, message: any): Promise<any>;
}

// 在 PluginContext 中提供状态管理器
export interface PluginContext {
  currentState: PetState;
  emotion: EmotionContext;
  userPreferences?: Record<string, any>;
  stateHistory?: PetState[];
  interaction?: {
    type: 'passive' | 'active';
    trigger: 'state_change' | 'user_intent' | 'heartbeat' | 'manual';
    timestamp: number;
  };
  // 未来扩展：插件状态管理
  stateManager?: PluginStateManager;
}

```

#### 3. 插件能力动态检测

系统会根据插件声明的能力选择最优的调用方式：

```typescript

capabilities: {
  stateAware: true,      // 是否支持状态感知
  emotionAware: true,    // 是否支持情绪感知
  contextAware: true,    // 是否支持上下文感知
  supportedHooks: [      // 支持的钩子类型
    'onStateChanged',
    'onEmotionChanged',  // 预留：情绪变化钩子
    'onUserInteraction', // 预留：用户交互钩子
    'onHeartbeat'        // 预留：心跳钩子
  ]
}

```

#### 4. 调试和开发技巧

- **插件调试**: 查看控制台的插件日志，了解触发时机和响应结果
- **状态测试**: 使用 `brain.enterXXXState()` 方法手动切换状态进行测试
- **情绪测试**: 使用 `brain.emotionEngine.setEmotion()` 设置特定情绪进行测试
- **钩子测试**: 观察状态转换时的钩子触发和响应

```typescript

// 测试示例
const brain = new PetBrain();
await brain.initialize();
await brain.registerPlugin(myPlugin);

// 设置特定情绪
brain.emotionEngine.setEmotion(EmotionType.Excited, 0.9, 30000);

// 切换状态触发插件
await brain.enterAwakenState();

// 观察日志输出，验证插件响应

```

### 插件开发最佳实践

1. **类型安全**: 充分利用 TypeScript 的类型检查，确保插件接口正确实现
2. **错误处理**: 在 `trigger()` 和 `onStateChanged()` 方法中添加适当的错误处理
3. **性能考虑**: 避免在插件中执行耗时操作，使用异步方法和适当的延迟
4. **日志规范**: 使用统一的日志格式，便于调试和监控
5. **向后兼容**: 新插件应该支持情绪感知，同时保持对传统调用方式的兼容

通过以上插件系统，开发者可以轻松扩展 SaintGrid 神宠的功能，创建具有情绪感知能力的智能插件，实现真正的拟人化交互体验。

##  记忆系统

### 记忆类型

- **conversation**: 对话记录
- **behavior**: 行为模式  
- **preference**: 用户偏好
- **context**: 上下文信息

### 使用记忆

```typescript

// 记录用户偏好
stateMemory.recordPreference('appearance', 'theme', 'dark', 1.0);

// 检索记忆
const memories = stateMemory.retrieve({
  type: 'conversation',
  tags: ['screenshot'],
  limit: 10
});

// 分析使用模式
const patterns = stateMemory.analyzeUsagePatterns();

```

## 🌐 三脑模型支持

系统预设支持多个 AI 提供商：

- **🇸🇬 新加坡主脑**: OpenAI、Claude
- **🇨🇳 中国左脑**: 通义千问、豆包、文心一言
- **🌍 海外右脑**: GPT-4、Gemini、LLaMA

## 📊 系统监控

### 获取系统状态

```typescript

const status = petBrain.getSystemStatus();
console.log(status);
// {
//   state: 'idle',
//   emotion: 'calm',
//   pluginCount: 2,
//   memoryUsage: {...},
//   uptime: 12345,
//   lastInteraction: 1234567890
// }

```

### 事件监听

```typescript

petBrain.on('state_changed', (data) => {
  console.log(`状态变化: ${data.oldState} → ${data.newState}`);
});

petBrain.on('input_processed', (data) => {
  console.log(`处理完成: ${data.response.message}`);
});

```

## 🎯 设计理念

> "神宠不是宠物，而是你与世界情绪交互的前台界面。"

- **🧠 拟人情绪感知**: 通过情绪引擎实现自然的情感交互
- **🌐 文化情境认知**: 基于东亚文化设计的汤圆形象和交互模式  
- **🛠️ 多态视觉引导**: 四态模型适配不同的使用场景
- **🔌 模块化扩展**: 插件化架构支持功能无限扩展

## 🔮 未来规划

- [ ] 支持更多皮肤（猫猫、机甲、花朵等）
- [ ] AI 模型集成和多模态输入
- [ ] 桌面UI和动画系统
- [ ] 云端记忆同步
- [ ] 插件市场和社区
- [ ] 语音交互和TTS
- [ ] 跨平台支持

## 📝 开发者说明

### 代码结构

1. **类型先行**: 所有接口和类型定义在 `types/` 目录
2. **模块分离**: 每个核心功能独立成模块，便于测试和维护
3. **事件驱动**: 使用事件系统实现模块间的松耦合通信
4. **插件化**: 所有功能都可以通过插件扩展

### 扩展指南

1. **添加新情绪**: 在 `EmotionType` 枚举中添加，并在 `EmotionEngine` 中实现规则
2. **添加新状态**: 在 `PetState` 枚举中添加，并在 `PetBrain` 中处理转换逻辑
3. **添加新意图**: 在 `IntentRouter` 中注册识别规则
4. **开发新插件**: 实现 `IPlugin` 接口并注册到系统

## 📄 许可证

MIT License

---

**让我们一起构建有情绪、有温度的 AI 伙伴！** 🍡✨
---

## 🌌 关键能力 | Features

- 🎙️ **语音分段播放**：自动识别情绪变化，按段播报，提高理解效率  
- 🧠 **多智能体热插拔**：支持 GPT、Claude、DeepSeek、豆包、元宝等智能体灵活协作  
- 🫧 **碗形交互系统**：三态设计（静止碗 / 悬浮碗 / 工具碗），用户情绪状态入口  
- 💬 **指令即场景切换**：语音、文本、快捷拖拽，三种交互方式并存  
- 🪢 **跨平台计划**：Mac / Windows / Electron 桌宠通用核心

---

## 💡 背后哲学 | Philosophy

在未来每人都有多个 AI 助理的时代，  

**人类需要一个前台，来调度这些“看不见的后端智能”。**

这个前台不能是繁杂的界面，而是一只通人性、有温度的神宠。  
它用“听懂你 + 代你沟通 + 帮你组织”三重能力，成为人类数字生活的主界面。

---

## 👤 作者 | Author

**Grace Yuan Juan**  
- SaintGrid 智脑系统构建者  
- 20 年国家电网数字化项目经验  
- 正在用桌宠重新定义 AI 与人的连接方式

---

## 📃 协议 | License

MIT License  
（代码自由，灵魂不卖）

---

## 🌍 技术架构 | Architecture

神宠的 AI 技术架构采用“三脑模型”，以应对中国与中国以外网络与合规环境的差异：

- 🇸🇬 **主脑**：部署在新加坡，统一控制 AI 决策中枢、用户体验与策略引擎。
- 🇨🇳 **左脑**：连接中国 AI 团队与模型（如文心一言、通义千问等），保证合规响应。
- 🌐 **右脑**：连接海外开源/商业 AI（如 GPT-4、Claude、Gemini 等），实现全球智能联通。

神宠通过此结构，实现无缝多 AI 协作，用户不需要切换、无需决策，自动由系统调度最优智能体。

---

## 🧠 用户体验 | User Experience

目标：让用户无需理解“函数”、不需要编程知识，只通过“自然语言表达需求”即可唤起 AI 的强大能力。

我们不再让用户记函数名或理解逻辑，而是通过神宠作为“情绪入口 + 意图中转 + 任务调度”统一前台，把 AI 的能力织入用户的生活细节。

---

## 🧩 未来任务 | Coming Soon

- [ ] 多 AI 协作插件热插拔机制
- [ ] GPT 与豆包双通道统一入口
- [ ] 神宠桌宠情绪语音交互
- [ ] 接入任务调度脚本语言（如 natural prompt → plugin routing）

## 🍡 神宠首发皮肤：一碗汤圆 | First Edition Skin: Tangyuan Bowl


在神宠系统的第一个版本中，我们选择了一碗汤圆作为默认皮肤。

这不仅是视觉可爱的尝试，更是一次具象的哲学表达：
> “神宠不是宠物，而是你与世界情绪交互的前台界面。”

汤圆象征团圆、柔和与温度，正是我们对 AI 桌宠“有情绪、有入口、有控制感”的具象期待。

### 💡 为什么是汤圆？

- 🧠 **拟人情绪感知**：汤圆圆润柔软的形象，贴近人类对“陪伴”与“情绪安全”的感知。
- 🌐 **文化情境认知**：汤圆是东亚文化中代表“归属感”的食物，匹配神宠“非工具化”的交互定位。
- 🛠️ **多态视觉引导**：汤圆的“碗+球体”天然适合多态表现，适配我们设计的四态交互模型。

### 🌀 四态状态定义（State Diagram）

| 状态编号 | 状态名称 | 英文名 | 触发方式 | 功能说明 |
|----------|----------|--------|-----------|-----------|
| ①        | 静碗     | Idle Bowl     | 默认状态   | 待命情绪展示，偶尔眨眼或漂浮 |
| ②        | 感应碗   | Hover Bowl    | 鼠标悬浮   | 泛光提示，弹出语音播报、字幕、音量调节等 |
| ③        | 唤醒碗   | Awaken Bowl   | 左键点击   | 呼出截图、复制、记要、投屏等工具功能 |
| ④        | 控制碗   | Control Bowl  | 右键点击   | 弹出设置菜单，进入神宠对话、换肤、AI 控制台等 |

> “从一个静止的汤圆，唤醒出一整套协同 AI 能力”，这就是我们的第一版神宠——**情绪即入口，情绪亦能力**。

---

## ✅ For Developers

你正在构建的是一个**感知 + 情绪驱动 + 多模输入统一**的 AI 桌面引擎。  
当前皮肤使用“汤圆”作为情绪表达介质。你需要配合：

- 🧩 使用四态状态枚举：`Idle`, `Hover`, `Awaken`, `Control`
- 🖼️ 实现状态切换时的过渡动画与高亮交互
- 🔌 将语音播报、文本响应、截图等能力热插拔集成到“唤醒碗”状态
- 📐 将右键菜单开放为插件入口，便于未来扩展更多 AI 工具

请保持代码结构与状态命名一致，未来我们将支持更多皮肤（猫猫、机甲、花朵等），但交互协议保持通用。
