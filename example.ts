/**
 * SaintGrid 神宠系统使用示例
 * 展示如何在实际项目中集成和使用主脑系统
 */

import { SaintGridPetSystem, PetState, EmotionType } from './src';

async function main() {
  console.log('🌐 SaintGrid 神宠系统演示\n');

  // 创建神宠系统实例
  const petSystem = new SaintGridPetSystem();

  try {
    // 启动系统
    await petSystem.start();

    // 设置事件监听
    setupEventListeners(petSystem);

    // 模拟用户交互序列
    await simulateUserInteractions(petSystem);

    // 展示系统功能
    await demonstrateSystemFeatures(petSystem);

  } catch (error) {
    console.error('❌ 系统运行错误:', error);
  } finally {
    // 关闭系统
    await petSystem.stop();
  }
}

/**
 * 设置事件监听器
 */
function setupEventListeners(petSystem: SaintGridPetSystem) {
  // 这里需要访问 petBrain，在实际实现中应该提供相应的方法
  console.log('🎧 设置事件监听器...');
}

/**
 * 模拟用户交互
 */
async function simulateUserInteractions(petSystem: SaintGridPetSystem) {
  console.log('🎮 开始用户交互模拟...\n');

  const interactions = [
    // 基础交互
    { input: '你好', description: '基础问候' },
    { input: '截图', description: '触发截图功能' },
    { input: '全屏截图', description: '指定截图模式' },
    
    // 记录功能
    { input: '记录：完成了神宠系统开发', description: '记录工作内容' },
    { input: '记录：#学习 TypeScript插件架构很有趣', description: '带标签的记录' },
    
    // 情绪交互
    { input: '我今天很开心！', description: '表达积极情绪' },
    { input: '有点累了', description: '表达疲惫情绪' },
    
    // 功能询问
    { input: '设置', description: '访问设置功能' },
    { input: '帮助', description: '获取帮助信息' },
    
    // 复杂交互
    { input: '区域截图然后记录一下', description: '复合操作意图' },
    { input: '今天工作效率很高，截个图留念', description: '情绪 + 功能请求' }
  ];

  for (let i = 0; i < interactions.length; i++) {
    const { input, description } = interactions[i];
    
    console.log(`\n--- 交互 ${i + 1}: ${description} ---`);
    console.log(`👤 用户: "${input}"`);
    
    try {
      await petSystem.handleUserInput(input);
      
      // 延迟以模拟真实交互间隔
      await delay(1500);
    } catch (error) {
      console.error(`❌ 交互失败:`, error);
    }
  }
}

/**
 * 展示系统功能
 */
async function demonstrateSystemFeatures(petSystem: SaintGridPetSystem) {
  console.log('\n🔧 系统功能演示...\n');

  // 展示推荐功能
  console.log('📋 当前推荐操作:');
  const recommendations = petSystem.getRecommendations();
  recommendations.forEach((action, index) => {
    console.log(`  ${index + 1}. ${action}`);
  });

  console.log('\n🎭 状态切换演示:');
  
  // 演示状态切换
  const states = [PetState.Hover, PetState.Awaken, PetState.Control, PetState.Idle];
  for (const state of states) {
    console.log(`🔄 切换到: ${state}`);
    await petSystem.switchToState(state);
    await delay(1000);
  }

  console.log('\n✅ 系统功能演示完成');
}

/**
 * 延迟函数
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 在浏览器环境中运行
 */
export async function runBrowserDemo(): Promise<void> {
  await main();
}

/**
 * 导出供外部调用
 */
export { main as runDemo };

// 环境检测（在支持的环境中可以直接运行）
// 注意：需要适当的环境和依赖支持
/*
if (typeof window === 'undefined') {
  // Node.js 环境
  main().catch(console.error);
} else {
  // 浏览器环境
  console.log('🌐 在浏览器环境中运行，请调用 runBrowserDemo() 函数');
}
*/
