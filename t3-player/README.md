# T3-Player | 神宠系统播放器模块

## 📋 阶段概述

T3阶段专注于DirPlayer播放器插件的开发，提供视频播放、分块控制、状态管理等核心播放功能，为神宠行为系统提供多媒体支持。

## 🎬 主要功能

### 核心播放器
- **DirPlayer桥接** - Rust核心 + TypeScript接口
- **视频分块播放** - 支持视频片段组合和切换
- **播放状态管理** - 播放、暂停、停止、速度控制
- **事件系统** - 播放进度、状态变化事件监听

### 插件架构
- **PlayerPlugin** - 播放器插件主类
- **插件注册** - 与神宠系统主脑集成
- **行为触发** - 根据宠物行为自动播放内容
- **状态同步** - 播放状态与宠物情绪同步

## 📁 文件结构

```
t3-player/
├── README.md                    # 本文档
├── PlayerPlugin.ts              # 播放器插件主类
├── test-player-plugin.ts        # 播放器功能测试
├── test-player-ui.ts           # 播放器UI集成测试
├── native/                     # Rust核心模块
│   ├── Cargo.toml              # Rust项目配置
│   └── dir_player_bridge.rs    # DirPlayer桥接实现
├── types/                      # TypeScript类型定义
│   ├── player-types.ts         # 播放器类型
│   └── bridge-types.ts         # 桥接接口类型
└── examples/                   # 使用示例
    ├── basic-playback.ts       # 基础播放示例
    └── behavior-integration.ts # 行为集成示例
```

## 🚀 快速开始

### 环境要求
- Node.js 16+
- Rust 1.70+
- 神宠系统主框架

### 安装依赖
```bash
# 安装Node.js依赖
npm install

# 构建Rust模块（如果使用原生桥接）
cd t3-player/native
cargo build --release
```

### 运行测试
```bash
# 播放器功能测试
npx ts-node t3-player/test-player-plugin.ts

# UI集成测试
npx ts-node t3-player/test-player-ui.ts
```

## 🔌 API接口

### PlayerPlugin类

```typescript
import { PlayerPlugin } from './t3-player/PlayerPlugin';

// 创建播放器插件实例
const playerPlugin = new PlayerPlugin();

// 初始化
await playerPlugin.init();

// 播放视频
await playerPlugin.playVideo('video-id', {
  strategy: 'sequence',
  autoNext: true
});

// 控制播放
playerPlugin.pause();
playerPlugin.resume();
playerPlugin.setSpeed(1.5);
```

### 事件监听

```typescript
// 监听播放状态变化
playerPlugin.on('stateChanged', (state) => {
  console.log('播放状态:', state);
});

// 监听播放进度
playerPlugin.on('progress', (progress) => {
  console.log('播放进度:', progress);
});

// 监听分块切换
playerPlugin.on('chunkChanged', (chunkInfo) => {
  console.log('分块切换:', chunkInfo);
});
```

## 🎯 集成示例

### 与神宠行为系统集成

```typescript
import { BehaviorScheduler } from '../t5-core/BehaviorScheduler';
import { PlayerPlugin } from './PlayerPlugin';

const scheduler = new BehaviorScheduler();
const player = new PlayerPlugin();

// 注册播放器插件
scheduler.registerPlugin('player', player);

// 定义播放行为
scheduler.addBehavior('greeting', {
  actions: [
    { type: 'say', content: '你好！' },
    { type: 'plugin', name: 'player', params: { video: 'greeting.mp4' } },
    { type: 'emotion', state: 'happy' }
  ]
});
```

### 情绪驱动播放

```typescript
import { EmotionEngine } from '../t5-core/EmotionEngine';

const emotionEngine = new EmotionEngine();

// 根据情绪自动选择播放内容
emotionEngine.on('emotionChanged', (emotion) => {
  const videoMap = {
    'happy': 'celebration.mp4',
    'sad': 'comfort.mp4',
    'excited': 'energetic.mp4'
  };
  
  if (videoMap[emotion]) {
    player.playVideo(videoMap[emotion]);
  }
});
```

## 🧪 测试覆盖

### 功能测试
- ✅ 播放器初始化和销毁
- ✅ 视频播放、暂停、停止
- ✅ 播放速度控制
- ✅ 分块列表管理
- ✅ 事件触发和监听

### 集成测试
- ✅ 与神宠主脑通信
- ✅ 行为触发播放
- ✅ UI组件集成
- ✅ 错误处理和恢复

### 性能测试
- ✅ 播放流畅度
- ✅ 内存使用优化
- ✅ 并发播放支持

## 🔧 配置选项

### 播放器配置

```typescript
const config = {
  // 播放策略
  strategy: 'sequence' | 'random' | 'loop',
  
  // 自动播放
  autoPlay: true,
  
  // 默认音量
  volume: 0.8,
  
  // 分块缓存数量
  chunkCacheSize: 5,
  
  // 错误重试次数
  retryCount: 3
};
```

## 📊 性能监控

```typescript
// 获取播放统计
const stats = player.getStats();
console.log('播放统计:', {
  totalPlayTime: stats.totalPlayTime,
  videosPlayed: stats.videosPlayed,
  averageLoadTime: stats.averageLoadTime,
  errorRate: stats.errorRate
});
```

## 🔗 相关文档

- [T2-Architecture](../t2-architecture/README.md) - 系统架构
- [T4-Models](../t4-models/README.md) - 行为模型
- [T5-Core](../t5-core/README.md) - 核心逻辑
- [项目总体文档](../README.md) - 完整系统说明

## 🚨 注意事项

1. **Rust依赖** - 原生模块需要Rust编译环境
2. **视频格式** - 支持MP4、WebM等Web兼容格式
3. **性能优化** - 大视频文件建议进行预处理
4. **错误处理** - 播放失败时自动降级到静态内容

---

*T3-Player为神宠系统提供强大的多媒体播放能力，是实现丰富交互体验的关键模块。*
