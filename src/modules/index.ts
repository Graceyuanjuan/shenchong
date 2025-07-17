/**
 * 神宠系统统一模块导出
 * 提供各阶段模块的统一访问接口
 */

// 核心模块导出 - 使用 src/core 下的文件
export { PetBrain } from '../core/PetBrain';
export { BehaviorScheduler } from '../core/BehaviorScheduler';
export { EmotionEngine } from '../core/EmotionEngine';
export { StateMemory } from '../core/StateMemory';
export { PluginRegistry } from '../core/PluginRegistry';
export { BehaviorStrategy } from '../core/BehaviorStrategy';
export { BehaviorStrategyManager } from '../core/BehaviorStrategyManager';

// 插件模块
export { PlayerPlugin } from '../plugins/PlayerPlugin';

// AI 情绪驱动模块
export { AIEmotionDriver } from './AIEmotionDriver';

// 行为节奏管理器 
export { BehaviorRhythmManager } from './rhythm/BehaviorRhythmManager';

// UI 主程序
export { default as PetSystemApp } from '../PetSystemApp';
