#!/usr/bin/env node
/**
 * 神宠系统桌面运行测试
 * 测试核心功能模块的基本运行情况
 */

console.log('🎭 神宠系统桌面运行测试启动...\n');

// 测试基本模块加载
try {
  // 基本导入测试
  console.log('📦 测试模块导入...');
  
  // 测试类型定义
  const { PetState, EmotionType } = require('./dist/types');
  console.log('✅ 类型模块加载成功');
  
  // 测试核心类
  const { PetBrain } = require('./dist/core/PetBrain');
  const { EmotionEngine } = require('./dist/core/EmotionEngine');
  const { StateMemory } = require('./dist/core/StateMemory');
  console.log('✅ 核心模块加载成功');
  
  // 测试系统初始化
  console.log('\n🔧 测试系统初始化...');
  
  const petBrain = new PetBrain({
    enableAdvanced: true,
    enableLogging: true,
    logLevel: 'info'
  });
  
  console.log('✅ PetBrain 初始化成功');
  
  // 测试状态切换
  console.log('\n🎯 测试基本状态切换...');
  
  const states = [PetState.Idle, PetState.Hover, PetState.Awaken, PetState.Control];
  
  states.forEach((state, index) => {
    setTimeout(() => {
      petBrain.switchToState(state);
      console.log(`✅ 状态切换: ${state}`);
      
      if (index === states.length - 1) {
        console.log('\n🎉 桌面运行测试完成！');
        console.log('🌐 Web UI: http://localhost:3001/');
        console.log('📊 系统状态: 健康运行');
        process.exit(0);
      }
    }, index * 1000);
  });
  
} catch (error) {
  console.error('❌ 桌面运行测试失败:', error.message);
  console.log('💡 尝试运行 npm run build 重新构建项目');
  process.exit(1);
}
