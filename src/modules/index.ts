/**
 * 神宠系统统一模块导出
 * 提供各阶段模块的统一访问接口
 */

// T3-Player 播放器模块
export { PlayerPlugin } from '../../t3-player/PlayerPlugin';

// T4-Models 数据模型
export { BehaviorStrategy } from '../../t4-models/BehaviorStrategy';
export { BehaviorStrategyManager } from '../../t4-models/BehaviorStrategyManager';

// T5-Core 核心逻辑
export { PetBrain } from '../../t5-core/PetBrain';
export { BehaviorScheduler } from '../../t5-core/BehaviorScheduler';
export { EmotionEngine } from '../../t5-core/EmotionEngine';
export { StateMemory } from '../../t5-core/StateMemory';
export { PluginRegistry } from '../../t5-core/PluginRegistry';
export { AIEmotionDriver } from '../../t5-core/AIEmotionDriver';
export { BehaviorRhythmManager } from '../../t5-core/behavior/BehaviorRhythmManager';

// T6-UI 用户界面
export { PetSystemApp } from '../../t6-ui/PetSystemApp';

// 兼容性导出 - 从原始位置导出仍可用的模块
export { BehaviorStrategy as CoreBehaviorStrategy } from '../core/BehaviorStrategy';
export { BehaviorScheduler as CoreBehaviorScheduler } from '../core/BehaviorScheduler';
export { EmotionEngine as CoreEmotionEngine } from '../core/EmotionEngine';
