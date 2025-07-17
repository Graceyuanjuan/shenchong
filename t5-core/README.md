# T5-Core | 神宠系统核心逻辑阶段

## 📋 阶段概述

T5阶段是神宠系统的核心大脑模块，包含状态管理、情绪引擎、行为调度、AI驱动和插件协调等核心逻辑，是整个系统的控制中心。

## 🧠 核心组件

### 神宠大脑系统
- **PetBrain** - 神宠智能大脑主控制器
- **StateMemory** - 状态记忆和持久化管理
- **EmotionEngine** - 情绪识别和状态转换引擎
- **AIEmotionDriver** - AI驱动的情绪智能决策

### 行为调度系统
- **BehaviorScheduler** - 行为任务调度和执行
- **BehaviorRhythmManager** - 行为节奏和时序控制
- **行为集成器** - 多模块行为协调整合

### 插件管理系统
- **PluginRegistry** - 插件注册和生命周期管理
- **插件通信** - 跨模块消息传递和事件系统
- **热加载机制** - 运行时插件动态加载和卸载

## 📁 文件结构

```
t5-core/
├── README.md                    # 本文档
├── PetBrain.ts                  # 神宠大脑主控制器
├── StateMemory.ts               # 状态记忆管理
├── EmotionEngine.ts             # 情绪引擎
├── AIEmotionDriver.ts           # AI情绪驱动器
├── BehaviorScheduler.ts         # 行为调度器
├── PluginRegistry.ts            # 插件注册管理
├── behavior/                    # 行为管理模块
│   ├── BehaviorRhythmManager.ts # 行为节奏管理器
│   └── BehaviorRhythmManager.examples.ts # 使用示例
├── integration/                 # 集成模块
│   ├── SystemIntegrator.ts     # 系统集成器
│   ├── CrossModuleBridge.ts    # 跨模块桥接
│   └── EventBus.ts             # 事件总线
├── ai/                         # AI智能模块
│   ├── DecisionEngine.ts       # 决策引擎
│   ├── LearningSystem.ts       # 学习系统
│   └── PatternRecognition.ts   # 模式识别
└── utils/                      # 核心工具
    ├── CoreLogger.ts           # 核心日志系统
    ├── PerformanceMonitor.ts   # 性能监控
    └── ErrorHandler.ts         # 错误处理
```

## 🚀 快速开始

### 初始化神宠系统

```typescript
import { PetBrain } from './t5-core/PetBrain';
import { EmotionEngine } from './t5-core/EmotionEngine';
import { BehaviorScheduler } from './t5-core/BehaviorScheduler';

// 创建神宠大脑实例
const petBrain = new PetBrain({
  name: '汤圆',
  personality: 'friendly',
  learningEnabled: true
});

// 初始化核心系统
await petBrain.initialize();

// 启动系统
petBrain.start();

console.log('神宠系统启动完成！');
```

### 情绪系统集成

```typescript
import { EmotionEngine } from './t5-core/EmotionEngine';
import { AIEmotionDriver } from './t5-core/AIEmotionDriver';

// 创建情绪引擎
const emotionEngine = new EmotionEngine({
  initialEmotion: 'neutral',
  emotionDecayRate: 0.1,
  enableTransitions: true
});

// 创建AI情绪驱动器
const aiDriver = new AIEmotionDriver({
  model: 'emotion-classifier-v1',
  confidenceThreshold: 0.7
});

// 绑定AI驱动到情绪引擎
emotionEngine.setDriver(aiDriver);

// 监听情绪变化
emotionEngine.on('emotionChanged', (emotion, intensity) => {
  console.log(`情绪变化: ${emotion} (强度: ${intensity})`);
});
```

### 行为调度示例

```typescript
import { BehaviorScheduler } from './t5-core/BehaviorScheduler';
import { BehaviorRhythmManager } from './t5-core/behavior/BehaviorRhythmManager';

// 创建行为调度器
const scheduler = new BehaviorScheduler();

// 创建节奏管理器
const rhythmManager = new BehaviorRhythmManager(
  async (step) => {
    console.log('执行行为步骤:', step);
  }
);

// 注册节奏管理器为插件
scheduler.registerPlugin('rhythm', rhythmManager);

// 调度复杂行为序列
scheduler.schedule({
  id: 'morning_routine',
  priority: 1,
  actions: [
    { type: 'emotion', state: 'awaken' },
    { type: 'say', content: '早上好！' },
    { type: 'plugin', name: 'rhythm', params: {
      steps: [
        { type: 'animate', name: 'stretch' },
        { type: 'wait', duration: 1000 },
        { type: 'say', content: '今天要做什么呢？' }
      ]
    }}
  ]
});
```

## 🔧 核心API

### PetBrain类

```typescript
class PetBrain {
  constructor(config: PetBrainConfig);
  
  // 生命周期管理
  async initialize(): Promise<void>;
  start(): void;
  pause(): void;
  stop(): void;
  
  // 状态管理
  getCurrentState(): PetState;
  updateState(newState: Partial<PetState>): void;
  
  // 情绪控制
  setEmotion(emotion: string, intensity?: number): void;
  getEmotion(): EmotionState;
  
  // 行为控制
  performAction(action: BehaviorAction): Promise<void>;
  scheduleActions(actions: BehaviorAction[]): void;
  
  // 插件管理
  registerPlugin(name: string, plugin: Plugin): void;
  unregisterPlugin(name: string): void;
  
  // 学习和记忆
  learn(experience: Experience): void;
  recall(query: string): Memory[];
  
  // 事件系统
  on(event: string, handler: Function): void;
  emit(event: string, ...args: any[]): void;
}
```

### EmotionEngine类

```typescript
class EmotionEngine {
  constructor(config: EmotionConfig);
  
  // 情绪状态
  getCurrentEmotion(): string;
  getEmotionIntensity(): number;
  getEmotionHistory(): EmotionHistory[];
  
  // 情绪转换
  transitionTo(emotion: string, intensity?: number): void;
  applyEmotionalInfluence(influence: EmotionalInfluence): void;
  
  // AI驱动
  setDriver(driver: AIEmotionDriver): void;
  processInput(input: any): Promise<EmotionResponse>;
  
  // 情绪规则
  addEmotionRule(rule: EmotionRule): void;
  removeEmotionRule(ruleId: string): void;
  
  // 事件监听
  on(event: 'emotionChanged' | 'intensityChanged', handler: Function): void;
}
```

### BehaviorScheduler类

```typescript
class BehaviorScheduler {
  constructor(config?: SchedulerConfig);
  
  // 任务调度
  schedule(task: BehaviorTask): string;
  unschedule(taskId: string): void;
  reschedule(taskId: string, newTime: Date): void;
  
  // 执行控制
  pause(): void;
  resume(): void;
  clearQueue(): void;
  
  // 插件集成
  registerPlugin(name: string, plugin: BehaviorPlugin): void;
  executePlugin(name: string, params: any): Promise<any>;
  
  // 状态查询
  getQueueStatus(): QueueStatus;
  getExecutionHistory(): ExecutionRecord[];
  
  // 优先级管理
  setPriority(taskId: string, priority: number): void;
  getHighestPriorityTask(): BehaviorTask | null;
}
```

## 🎯 系统集成

### 跨模块通信

```typescript
import { EventBus } from './t5-core/integration/EventBus';
import { CrossModuleBridge } from './t5-core/integration/CrossModuleBridge';

// 创建事件总线
const eventBus = new EventBus();

// 创建跨模块桥接
const bridge = new CrossModuleBridge(eventBus);

// 注册模块
bridge.registerModule('ui', uiModule);
bridge.registerModule('player', playerModule);
bridge.registerModule('models', modelsModule);

// 模块间通信
bridge.sendMessage('ui', 'updateEmotion', { emotion: 'happy' });
bridge.sendMessage('player', 'playVideo', { videoId: 'celebration' });
```

### 系统监控

```typescript
import { PerformanceMonitor } from './t5-core/utils/PerformanceMonitor';
import { CoreLogger } from './t5-core/utils/CoreLogger';

// 启用性能监控
const monitor = new PerformanceMonitor({
  memoryThreshold: 100 * 1024 * 1024, // 100MB
  cpuThreshold: 80 // 80%
});

// 配置日志系统
const logger = new CoreLogger({
  level: 'info',
  format: 'json',
  outputs: ['console', 'file']
});

// 监控系统性能
monitor.on('memoryWarning', (usage) => {
  logger.warn('内存使用过高', { usage });
});

monitor.on('cpuWarning', (usage) => {
  logger.warn('CPU使用过高', { usage });
});
```

## 🧪 测试与调试

### 单元测试

```typescript
import { PetBrain } from './t5-core/PetBrain';

describe('PetBrain', () => {
  test('should initialize correctly', async () => {
    const brain = new PetBrain({ name: 'TestPet' });
    await brain.initialize();
    
    expect(brain.getCurrentState().name).toBe('TestPet');
    expect(brain.getEmotion().current).toBe('neutral');
  });
  
  test('should handle emotion changes', () => {
    const brain = new PetBrain({ name: 'TestPet' });
    brain.setEmotion('happy', 0.8);
    
    const emotion = brain.getEmotion();
    expect(emotion.current).toBe('happy');
    expect(emotion.intensity).toBe(0.8);
  });
});
```

### 性能测试

```typescript
import { PerformanceMonitor } from './t5-core/utils/PerformanceMonitor';

// 性能基准测试
const monitor = new PerformanceMonitor();

const startTime = performance.now();

// 执行大量行为调度
for (let i = 0; i < 1000; i++) {
  scheduler.schedule({
    id: `test_${i}`,
    actions: [{ type: 'say', content: `Test ${i}` }]
  });
}

const endTime = performance.now();
console.log(`调度1000个任务耗时: ${endTime - startTime}ms`);
```

## 🔗 相关文档

- [T3-Player](../t3-player/README.md) - 播放器模块
- [T4-Models](../t4-models/README.md) - 数据模型
- [T6-UI](../t6-ui/README.md) - 用户界面
- [系统架构文档](../t2-architecture/README.md)

## 🚨 重要注意事项

1. **内存管理** - 长时间运行时注意内存泄漏
2. **并发安全** - 多线程环境下的状态同步
3. **错误恢复** - 系统异常时的自动恢复机制
4. **性能优化** - 大量行为任务时的调度优化

---

*T5-Core是神宠系统的智能核心，提供了完整的大脑功能和行为控制能力，是实现智能宠物交互的关键。*
