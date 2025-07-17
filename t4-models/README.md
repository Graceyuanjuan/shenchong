# T4-Models | 神宠系统行为模型阶段

## 📋 阶段概述

T4阶段专注于神宠行为模型的设计和实现，包括行为策略定义、数据存储、行为数据库管理和策略配置系统。

## 🧠 核心功能

### 行为策略系统
- **BehaviorStrategy** - 核心行为策略类
- **StrategyManager** - 策略管理和调度
- **策略模板** - 预定义行为模式
- **动态策略** - 运行时策略生成和修改

### 数据存储
- **行为数据库** - JSON格式的行为存储
- **状态缓存** - 内存中的状态快照
- **配置管理** - 策略参数和设置
- **导入导出** - 策略数据的备份和迁移

### 模型定义
- **行为类型** - say、animate、wait、plugin等
- **触发条件** - 时间、情绪、用户交互
- **执行参数** - 行为执行的具体参数
- **优先级系统** - 行为冲突时的优先级处理

## 📁 文件结构

```
t4-models/
├── README.md                    # 本文档
├── BehaviorStrategy.ts          # 核心行为策略类
├── BehaviorStrategyManager.ts   # 策略管理器
├── strategySchema.ts           # 策略数据结构定义
├── db/                         # 数据存储模块
│   ├── BehaviorDB.ts          # 行为数据库类
│   ├── StateDB.ts             # 状态数据库
│   └── ConfigDB.ts            # 配置数据库
├── data/                       # 数据文件
│   ├── sample-strategy.json   # 示例策略数据
│   ├── default-behaviors.json # 默认行为集
│   └── emotion-mappings.json  # 情绪映射表
├── types/                      # TypeScript类型定义
│   ├── strategy-types.ts      # 策略相关类型
│   ├── behavior-types.ts      # 行为相关类型
│   └── database-types.ts      # 数据库相关类型
├── templates/                  # 策略模板
│   ├── greeting-template.json # 问候行为模板
│   ├── emotion-template.json  # 情绪反应模板
│   └── interaction-template.json # 交互行为模板
└── utils/                      # 工具函数
    ├── strategy-validator.ts  # 策略验证工具
    ├── data-importer.ts      # 数据导入工具
    └── behavior-builder.ts   # 行为构建器
```

## 🚀 快速开始

### 基础使用

```typescript
import { BehaviorStrategy } from './t4-models/BehaviorStrategy';
import { BehaviorStrategyManager } from './t4-models/BehaviorStrategyManager';

// 创建策略管理器
const strategyManager = new BehaviorStrategyManager();

// 加载默认策略
await strategyManager.loadStrategies('./t4-models/data/default-behaviors.json');

// 创建新的行为策略
const greetingStrategy = new BehaviorStrategy({
  id: 'greeting',
  name: '问候行为',
  triggers: [{ type: 'user_interaction', event: 'click' }],
  actions: [
    { type: 'say', content: '你好！很高兴见到你～' },
    { type: 'animate', name: 'wave' },
    { type: 'emotion', state: 'happy' }
  ],
  priority: 1,
  cooldown: 5000
});

// 注册策略
strategyManager.registerStrategy(greetingStrategy);
```

### 策略配置

```typescript
// 策略数据结构
interface StrategyConfig {
  id: string;
  name: string;
  description?: string;
  triggers: TriggerCondition[];
  actions: BehaviorAction[];
  priority: number;
  cooldown?: number;
  conditions?: ExecutionCondition[];
}

// 触发条件
interface TriggerCondition {
  type: 'time' | 'emotion' | 'user_interaction' | 'plugin_event';
  event: string;
  params?: any;
}

// 行为动作
interface BehaviorAction {
  type: 'say' | 'animate' | 'wait' | 'plugin' | 'emotion';
  content?: string;
  name?: string;
  duration?: number;
  params?: any;
}
```

## 📊 数据模型

### 行为策略数据结构

```json
{
  "id": "morning_greeting",
  "name": "早晨问候",
  "description": "用户早晨首次交互时的问候行为",
  "triggers": [
    {
      "type": "time",
      "event": "morning_first_interaction",
      "params": { "timeRange": "06:00-12:00" }
    }
  ],
  "actions": [
    {
      "type": "say",
      "content": "早上好！今天心情怎么样呀？"
    },
    {
      "type": "animate",
      "name": "stretch"
    },
    {
      "type": "wait",
      "duration": 1000
    },
    {
      "type": "emotion",
      "state": "cheerful"
    }
  ],
  "priority": 2,
  "cooldown": 3600000,
  "conditions": [
    {
      "type": "emotion_not",
      "value": "sleeping"
    }
  ]
}
```

### 情绪映射表

```json
{
  "emotions": {
    "happy": {
      "expressions": ["😊", "😄", "🥰"],
      "colors": ["#FFE55C", "#FF9B9B", "#FFB6C1"],
      "animations": ["bounce", "twirl", "sparkle"],
      "responses": ["太开心了！", "哇！", "好棒！"]
    },
    "sad": {
      "expressions": ["😢", "😭", "🥺"],
      "colors": ["#87CEEB", "#B0C4DE", "#D3D3D3"],
      "animations": ["droop", "sigh", "comfort"],
      "responses": ["有点难过...", "需要抱抱", "会好起来的"]
    }
  }
}
```

## 🔧 API接口

### BehaviorStrategyManager

```typescript
class BehaviorStrategyManager {
  // 策略管理
  registerStrategy(strategy: BehaviorStrategy): void;
  unregisterStrategy(id: string): void;
  getStrategy(id: string): BehaviorStrategy | null;
  getAllStrategies(): BehaviorStrategy[];
  
  // 策略执行
  findMatchingStrategies(context: ExecutionContext): BehaviorStrategy[];
  executeStrategy(strategy: BehaviorStrategy, context: ExecutionContext): Promise<void>;
  
  // 数据持久化
  saveStrategies(filePath: string): Promise<void>;
  loadStrategies(filePath: string): Promise<void>;
  
  // 策略验证
  validateStrategy(strategy: StrategyConfig): ValidationResult;
  validateAllStrategies(): ValidationResult[];
}
```

### BehaviorStrategy

```typescript
class BehaviorStrategy {
  constructor(config: StrategyConfig);
  
  // 基本属性
  getId(): string;
  getName(): string;
  getPriority(): number;
  
  // 条件检查
  canTrigger(context: ExecutionContext): boolean;
  checkConditions(context: ExecutionContext): boolean;
  isOnCooldown(): boolean;
  
  // 执行控制
  execute(context: ExecutionContext): Promise<ExecutionResult>;
  reset(): void;
  
  // 配置更新
  updateConfig(newConfig: Partial<StrategyConfig>): void;
  clone(): BehaviorStrategy;
}
```

## 🧪 测试与验证

### 策略测试

```typescript
// 策略验证测试
import { validateStrategy } from './t4-models/utils/strategy-validator';

const testStrategy = {
  id: 'test_greeting',
  name: '测试问候',
  triggers: [{ type: 'user_interaction', event: 'click' }],
  actions: [{ type: 'say', content: 'Hello!' }],
  priority: 1
};

const validation = validateStrategy(testStrategy);
if (validation.isValid) {
  console.log('策略验证通过');
} else {
  console.error('策略验证失败:', validation.errors);
}
```

### 数据导入导出

```typescript
import { exportStrategies, importStrategies } from './t4-models/utils/data-importer';

// 导出当前策略
const exportResult = await exportStrategies('./backup/strategies.json');
console.log('导出完成:', exportResult);

// 导入策略
const importResult = await importStrategies('./templates/new-strategies.json');
console.log('导入完成:', importResult);
```

## 📈 性能优化

### 策略缓存

```typescript
// 启用策略缓存以提高查询性能
strategyManager.enableCache({
  maxSize: 100,
  ttl: 300000 // 5分钟
});

// 预加载常用策略
strategyManager.preloadStrategies(['greeting', 'idle', 'farewell']);
```

### 批量操作

```typescript
// 批量注册策略
const strategies = await loadStrategiesFromFiles([
  './templates/greeting-template.json',
  './templates/emotion-template.json'
]);

strategyManager.registerStrategies(strategies);
```

## 🔗 相关文档

- [T3-Player](../t3-player/README.md) - 播放器模块
- [T5-Core](../t5-core/README.md) - 核心逻辑
- [T6-UI](../t6-ui/README.md) - 用户界面
- [策略配置说明](./docs/strategy-configuration.md)

## 🚨 注意事项

1. **策略冲突** - 多个策略同时触发时的优先级处理
2. **内存管理** - 大量策略时的内存使用优化
3. **数据一致性** - 策略修改时的数据同步
4. **向后兼容** - 策略格式变更时的兼容性处理

---

*T4-Models为神宠系统提供了灵活强大的行为模型基础，支持复杂的行为定义和智能的策略管理。*
