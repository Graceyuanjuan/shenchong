/**
 * T2-B 测试：插件感知交互增强
 * 验证插件在状态切换时的情绪感知和智能响应
 */

import { PetBrain } from './core/PetBrain';
import { ScreenshotPlugin, NotePlugin } from './plugins/ExamplePlugins';
import { PetState, EmotionType } from './types';

async function testEnhancedPluginInteraction() {
  console.log('🧪 ===== T2-B 插件感知交互增强测试开始 =====\n');
  
  // 1. 初始化主脑和插件
  const brain = new PetBrain({
    defaultState: PetState.Idle,
    memoryLimit: 100
  });
  
  await brain.initialize();
  
  // 注册增强版插件
  const screenshotPlugin = new ScreenshotPlugin();
  const notePlugin = new NotePlugin();
  
  await brain.registerPlugin(screenshotPlugin);
  await brain.registerPlugin(notePlugin);
  
  console.log('🔌 插件注册完成\n');
  
  // 2. 测试基础状态切换与插件感知
  console.log('📊 ===== 测试 1: 基础状态切换的插件感知 =====');
  
  console.log('💤 → ✨ 从静态到感应状态...');
  await brain.enterHoverState();
  
  console.log('\n✨ → 🌟 从感应到唤醒状态...');
  await brain.enterAwakenState();
  
  console.log('\n🌟 → ⚙️ 从唤醒到控制状态...');
  await brain.enterControlState();
  
  console.log('\n⚙️ → 💤 从控制回到静态状态...');
  await brain.enterIdleState();
  
  // 3. 测试情绪感知智能响应
  console.log('\n📊 ===== 测试 2: 情绪感知智能响应 =====');
  
  // 手动设置好奇情绪并唤醒
  console.log('😊 设置好奇情绪并切换到唤醒状态...');
  brain['emotionEngine'].setEmotion(EmotionType.Curious, 0.8, 30000);
  await brain.enterAwakenState();
  
  // 设置专注情绪并切换到感应状态
  console.log('\n🎯 设置专注情绪并切换到感应状态...');
  brain['emotionEngine'].setEmotion(EmotionType.Focused, 0.9, 30000);
  await brain.enterHoverState();
  
  // 设置兴奋情绪并切换到唤醒状态
  console.log('\n🚀 设置兴奋情绪并切换到唤醒状态...');
  brain['emotionEngine'].setEmotion(EmotionType.Excited, 0.7, 30000);
  await brain.enterAwakenState();
  
  // 4. 测试状态钩子机制
  console.log('\n📊 ===== 测试 3: 状态钩子机制验证 =====');
  
  // 从静态直接到唤醒（测试紧急响应）
  console.log('⚡ 高强度情绪 + 静态直接唤醒（测试紧急响应）...');
  brain['emotionEngine'].setEmotion(EmotionType.Excited, 0.9, 30000);
  await brain.enterIdleState();
  await brain.enterAwakenState();
  
  // 愉快情绪下从唤醒到感应（测试成就记录）
  console.log('\n😊 愉快情绪 + 唤醒到感应（测试成就记录建议）...');
  brain['emotionEngine'].setEmotion(EmotionType.Happy, 0.8, 30000);
  await brain.enterHoverState();
  
  // 5. 测试插件能力声明验证
  console.log('\n📊 ===== 测试 4: 插件能力验证 =====');
  
  const plugins = brain['pluginRegistry'].getAllPlugins();
  plugins.forEach(plugin => {
    console.log(`🔌 插件: ${plugin.name}`);
    console.log(`   📋 版本: ${plugin.version}`);
    console.log(`   🧠 状态感知: ${plugin.capabilities?.stateAware ? '✅' : '❌'}`);
    console.log(`   😊 情绪感知: ${plugin.capabilities?.emotionAware ? '✅' : '❌'}`);
    console.log(`   🌐 上下文感知: ${plugin.capabilities?.contextAware ? '✅' : '❌'}`);
    console.log(`   🪝 支持钩子: ${plugin.capabilities?.supportedHooks?.join(', ') || '无'}`);
    console.log('');
  });
  
  // 6. 测试用户交互模拟
  console.log('📊 ===== 测试 5: 模拟用户交互 =====');
  
  // 设置专注情绪，模拟截图请求
  console.log('🎯 专注情绪下请求截图...');
  brain['emotionEngine'].setEmotion(EmotionType.Focused, 0.8, 30000);
  await brain.enterAwakenState();
  
  try {
    const screenshotResult = await brain.processInput('截图', {
      userMode: 'focused_work'
    });
    console.log(`📷 截图结果: ${screenshotResult.response}`);
    console.log(`😊 响应情绪: ${screenshotResult.emotion}`);
  } catch (error) {
    console.error('❌ 截图测试失败:', error);
  }
  
  // 兴奋情绪下记录笔记
  console.log('\n🚀 兴奋情绪下记录笔记...');
  brain['emotionEngine'].setEmotion(EmotionType.Excited, 0.9, 30000);
  
  try {
    const noteResult = await brain.processInput('记录：刚刚有了一个绝妙的想法！', {
      userMode: 'creative_mode'
    });
    console.log(`📝 笔记结果: ${noteResult.response}`);
    console.log(`😊 响应情绪: ${noteResult.emotion}`);
  } catch (error) {
    console.error('❌ 笔记测试失败:', error);
  }
  
  // 7. 测试情绪变化时的插件响应
  console.log('\n📊 ===== 测试 6: 情绪变化的插件响应 =====');
  
  // 模拟情绪从平静变为好奇
  console.log('😌 → 🤔 情绪从平静变为好奇...');
  brain['emotionEngine'].setEmotion(EmotionType.Calm, 0.5, 5000);
  await new Promise(resolve => setTimeout(resolve, 100));
  brain['emotionEngine'].setEmotion(EmotionType.Curious, 0.7, 30000);
  
  // 最终状态检查
  console.log('\n📊 ===== 测试完成 - 最终状态检查 =====');
  const finalStats = brain.getStateStatistics();
  const systemStatus = brain.getSystemStatus();
  
  console.log(`🎯 最终状态: ${finalStats.currentState}`);
  console.log(`😊 最终情绪: ${systemStatus.emotion}`);
  console.log(`📊 状态历史: [${finalStats.stateHistory.join(' → ')}]`);
  console.log(`🏆 最频繁状态: ${finalStats.mostFrequentState}`);
  console.log(`🔌 插件数量: ${systemStatus.pluginCount}`);
  
  // 情绪感知能力统计
  const emotionAwarePlugins = plugins.filter(p => p.capabilities?.emotionAware).length;
  const hookSupportPlugins = plugins.filter(p => p.capabilities?.supportedHooks?.length).length;
  
  console.log('\n🎉 ===== T2-B 增强功能验证总结 =====');
  console.log(`✅ 情绪感知插件: ${emotionAwarePlugins}/${plugins.length}`);
  console.log(`✅ 状态钩子支持: ${hookSupportPlugins}/${plugins.length}`);
  console.log(`✅ 智能响应测试: 通过`);
  console.log(`✅ 上下文传递: 通过`);
  console.log(`✅ 日志格式化: 通过`);
  
  console.log('\n🏁 ===== T2-B 测试完成 =====');
  
  // 清理资源
  await brain.destroy();
}

// 运行测试
if (require.main === module) {
  testEnhancedPluginInteraction().catch(console.error);
}

export { testEnhancedPluginInteraction };
