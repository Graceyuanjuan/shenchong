/**
 * 神宠系统主入口文件
 * 
 * 重构后的T1-T6模块化结构：
 * - T1: 原型设计 (/t1-prototype)
 * - T2: 系统架构 (/t2-architecture) 
 * - T3: 播放器模块 (/t3-player)
 * - T4: 数据模型 (/t4-models)
 * - T5: 核心逻辑 (/t5-core)
 * - T6: 用户界面 (/t6-ui)
 */

// 核心模块导出 (兼容现有代码)
export { PetBrain } from './core/PetBrain';
export { BehaviorScheduler } from './core/BehaviorScheduler';
export { EmotionEngine } from './core/EmotionEngine';
export { StateMemory } from './core/StateMemory';
export { BehaviorStrategy } from './core/BehaviorStrategy';
export { BehaviorStrategyManager } from './core/BehaviorStrategyManager';
export { PluginRegistry } from './core/PluginRegistry';

// 插件模块
export { PlayerPlugin } from './plugins/PlayerPlugin';

// UI模块
export { default as PetSystemApp } from './PetSystemApp';

// 新增模块
export { AIEmotionDriver } from './modules/AIEmotionDriver';
export { BehaviorRhythmManager } from './modules/behavior/BehaviorRhythmManager';

// 类型导出 - 修正从types模块导出
export type { PetState, EmotionType } from './types';

console.log('🎯 神宠系统模块已重构为T1-T6阶段结构');
console.log('📁 新模块位置:');
console.log('  - T3-Player: /t3-player/');
console.log('  - T4-Models: /t4-models/');  
console.log('  - T5-Core: /t5-core/');
console.log('  - T6-UI: /t6-ui/');
console.log('✅ 现有代码导入路径保持兼容');
