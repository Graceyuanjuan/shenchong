# BehaviorDB 使用说明

## 概述

BehaviorDB 是 SaintGrid Pet System 的策略数据库模块，提供结构化的策略存储、热重载、版本管理等功能。

## 架构组件

### 核心模块

1. **StrategySchema** (`src/schema/strategySchema.ts`)
   - 定义策略记录结构
   - 策略验证和元数据管理
   - 支持的状态和情绪类型

2. **BehaviorDB** (`src/core/db/BehaviorDB.ts`)
   - 核心数据库操作
   - 文件持久化和备份
   - 热重载和快照管理

3. **BehaviorDBAdapter** (`src/core/db/BehaviorDBAdapter.ts`)
   - 适配器模式实现
   - 传统策略迁移
   - 统一接口封装

4. **BehaviorStrategyManager** (`src/core/BehaviorStrategyManager.ts`)
   - 策略管理器主类
   - 集成数据库支持
   - 实时策略执行

## 快速开始

### 1. 基本使用

```typescript
import { BehaviorStrategyManager } from './core/BehaviorStrategyManager';
import { StrategyRecord, createDefaultMetadata } from './schema/strategySchema';
import { PetState, EmotionType } from './types';

// 初始化策略管理器（自动创建数据库）
const manager = new BehaviorStrategyManager();

// 创建新策略
const newStrategy: StrategyRecord = {
  id: 'my_custom_strategy',
  name: '自定义策略',
  description: '这是一个自定义的行为策略',
  enabled: true,
  conditions: {
    states: [PetState.Idle],
    emotions: [EmotionType.Calm],
    priority: 5,
    cooldown: 3000 // 3秒冷却
  },
  actions: [{
    id: 'custom_action_001',
    type: 'show_message',
    name: '显示消息',
    delay: 100,
    params: {
      message: '你好，我是你的AI助手！',
      duration: 2000
    }
  }],
  metadata: createDefaultMetadata()
};

// 保存策略到数据库
await manager.saveStrategyToDB(newStrategy);
```


### 2. 策略查询和匹配


```typescript
// 获取匹配特定状态和情绪的策略
const strategies = manager.getMatchingStrategies(
  PetState.Awaken, 
  EmotionType.Curious
);

console.log(`找到 ${strategies.length} 个匹配策略`);
```


### 3. 数据库管理


```typescript
// 创建快照
const snapshotId = await manager.createSnapshot('部署前备份');

// 获取数据库统计
const stats = await manager.getDatabaseStats();
console.log('数据库统计:', stats);

// 恢复快照
if (snapshotId) {
  await manager.restoreSnapshot(snapshotId);
}
```


## 策略结构详解


### StrategyRecord


```typescript
interface StrategyRecord {
  id: string;                   // 策略唯一标识
  name: string;                 // 策略显示名称
  description?: string;         // 策略描述
  enabled: boolean;             // 是否启用
  conditions: StrategyConditions; // 触发条件
  actions: StrategyAction[];    // 执行动作列表
  metadata: StrategyMetadata;   // 策略元数据
}
```


### StrategyConditions


```typescript
interface StrategyConditions {
  states: PetState[];           // 匹配的状态列表
  emotions: EmotionType[];      // 匹配的情绪列表
  priority?: number;            // 策略优先级 (1-10)
  weight?: number;              // 策略权重 (0-1)
  cooldown?: number;            // 冷却时间(ms)
  maxExecutions?: number;       // 最大执行次数
  timeConstraints?: {           // 时间约束
    startTime?: string;         // 开始时间 "HH:mm"
    endTime?: string;           // 结束时间 "HH:mm"
    weekdays?: number[];        // 工作日限制 [1-7]
  };
}
```


### StrategyAction


```typescript
interface StrategyAction {
  id: string;                    // 动作唯一标识
  type: string;                  // 动作类型
  name: string;                  // 动作显示名称
  delay?: number;                // 延迟执行时间(ms)
  duration?: number;             // 持续时间(ms)
  priority?: number;             // 优先级 (1-10)
  params?: Record<string, any>;  // 动作参数
}
```


## 高级功能


### 1. 热重载

BehaviorDB 支持策略文件的热重载，当策略文件发生变化时会自动重新加载：

```typescript
// 热重载在初始化时自动启用
const manager = new BehaviorStrategyManager();
// 策略文件变化时会自动触发重载
```


### 2. 快照管理


```typescript
// 创建快照
const snapshotId = await manager.createSnapshot('重要更新前备份');

// 列出所有快照（需要通过 BehaviorDB 直接访问）
const db = new BehaviorDB();
await db.initialize();
// 快照功能通过内部 API 提供

// 恢复快照
await manager.restoreSnapshot(snapshotId);
```


### 3. 策略验证


```typescript
import { BehaviorDB } from './core/db/BehaviorDB';

const db = new BehaviorDB();
const validation = db.validateStrategy(strategy);

if (!validation.valid) {
  console.error('策略验证失败:', validation.errors);
} else {
  console.log('策略验证通过');
}
```


### 4. 传统策略迁移


```typescript
import { BehaviorDBAdapter } from './core/db/BehaviorDBAdapter';

const adapter = new BehaviorDBAdapter();
await adapter.initialize(); // 自动迁移现有策略
```


## 内置策略类型


### 状态相关策略


- **控制状态 (Control)**: 激活生产力工具，专注模式
- **唤醒状态 (Awaken)**: 探索行为，高能互动
- **悬浮状态 (Hover)**: 友好互动，轻量提示
- **静止状态 (Idle)**: 休息提示，环境视频

### 情绪驱动策略

- **好奇 (Curious)**: 截图探索，内容分析
- **专注 (Focused)**: 工具激活，效率提升
- **开心 (Happy)**: 友好互动，庆祝动画
- **困倦 (Sleepy)**: 自动休息，时间提醒
- **兴奋 (Excited)**: 高能模式，快速响应
- **平静 (Calm)**: 基础响应，状态保持

## 文件结构

```
src/
├── schema/
│   └── strategySchema.ts          # 策略结构定义
├── core/
│   ├── db/
│   │   ├── BehaviorDB.ts          # 核心数据库
│   │   └── BehaviorDBAdapter.ts   # 适配器层
│   └── BehaviorStrategyManager.ts # 策略管理器
├── tests/
│   └── behavior-db-clean.test.ts  # 测试套件
└── data/
    ├── behavior-strategies.json   # 主策略数据库
    ├── backups/                   # 自动备份
    ├── snapshots/                 # 快照存储
    └── sample-strategy.json       # 示例策略
```


## 配置选项


### 数据库配置


```typescript
// 自定义数据库路径
const manager = new BehaviorStrategyManager('./custom/path/strategies.json');

// 热重载配置（通过 BehaviorDB）
const db = new BehaviorDB('./strategies.json');
// 热重载配置在构造函数中自动设置
```


### 策略执行配置


```typescript
// 策略执行时可以配置执行上下文
const context: BehaviorExecutionContext = {
  state: PetState.Awaken,
  emotion: {
    type: EmotionType.Curious,
    intensity: 0.8,
    duration: 5000
  },
  timestamp: Date.now(),
  sessionId: 'session_001',
  metadata: {
    userActivity: 'coding',
    timeOfDay: 'morning'
  }
};
```


## 最佳实践


### 1. 策略设计


- **明确的ID命名**: 使用描述性的策略ID
- **合理的优先级**: 重要策略使用高优先级 (8-10)
- **适当的冷却时间**: 避免策略频繁触发
- **时间约束**: 为时间敏感的策略设置时间限制

### 2. 性能优化

- **批量操作**: 使用 `replaceStrategies` 进行批量更新
- **策略缓存**: BehaviorDB 自动缓存策略以提高性能
- **条件优化**: 将最常用的条件放在前面

### 3. 错误处理

```typescript
try {
  await manager.saveStrategyToDB(strategy);
} catch (error) {
  console.error('保存策略失败:', error);
  // 处理错误或回退策略
}
```


### 4. 数据安全


- **定期备份**: 使用快照功能定期备份
- **版本控制**: 将策略文件纳入版本控制
- **验证策略**: 保存前始终验证策略结构

## 故障排除

### 常见问题

1. **策略不触发**: 检查状态和情绪匹配条件
2. **热重载失败**: 确认文件权限和路径正确
3. **验证错误**: 检查策略结构是否符合 Schema
4. **性能问题**: 减少策略数量或优化条件判断

### 调试信息

BehaviorDB 提供详细的控制台日志：

```
🗃️ BehaviorDB初始化: { dbPath: ..., hotReload: true }
📚 加载策略数据: 6/6 个启用策略
✅ BehaviorDB初始化完成
🔄 检测到策略变更，正在重新加载...
```


## API 参考


### BehaviorStrategyManager


- `saveStrategyToDB(strategy)`: 保存策略到数据库
- `removeStrategyFromDB(id)`: 从数据库删除策略
- `updateStrategyInDB(strategy)`: 更新数据库中的策略
- `createSnapshot(description?)`: 创建数据库快照
- `restoreSnapshot(id)`: 恢复数据库快照
- `getDatabaseStats()`: 获取数据库统计信息

### BehaviorDB

- `initialize()`: 初始化数据库
- `saveStrategy(strategy)`: 保存策略
- `deleteStrategy(id)`: 删除策略
- `loadStrategies()`: 加载所有策略
- `replaceStrategies(strategies)`: 批量替换策略
- `createSnapshot(description?)`: 创建快照
- `restoreFromSnapshot(id)`: 恢复快照
- `validateStrategy(strategy)`: 验证策略

### BehaviorDBAdapter

- `initialize()`: 初始化适配器（自动迁移）
- `getAllStrategies()`: 获取所有策略
- `getMatchingStrategies(state, emotion)`: 获取匹配策略
- `saveStrategy(strategy)`: 保存策略
- `deleteStrategy(id)`: 删除策略

---

*此文档描述了 BehaviorDB v1.0.0 的功能和用法。如有问题或建议，请参考源码或提交 Issue。*
