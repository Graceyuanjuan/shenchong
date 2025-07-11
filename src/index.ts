/**
 * SaintGrid 神宠系统 - 主入口文件
 * 展示如何初始化和使用主脑系统
 */

import { PetBrain } from './core/PetBrain';
import { PetState, EmotionType, AIProvider } from './types';
import { ScreenshotPlugin, NotePlugin } from './plugins/ExamplePlugins';

/**
 * 神宠系统启动器
 */
export class SaintGridPetSystem {
  private petBrain: PetBrain;
  private isRunning: boolean = false;

  constructor() {
    // 初始化主脑
    this.petBrain = new PetBrain({
      defaultState: PetState.Idle,
      defaultEmotion: EmotionType.Calm,
      memoryLimit: 2000,
      aiProviders: [AIProvider.OpenAI, AIProvider.Claude, AIProvider.Doubao],
      plugins: ['screenshot_plugin', 'note_plugin']
    });

    this.setupEventListeners();
  }

  /**
   * 启动神宠系统
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.warn('⚠️ 神宠系统已经在运行中');
      return;
    }

    try {
      console.log('🌐 启动 SaintGrid 神宠系统...');

      // 初始化主脑
      await this.petBrain.initialize();

      // 注册示例插件
      await this.registerPlugins();

      this.isRunning = true;
      console.log('✅ 神宠系统启动成功！');
      
      // 展示欢迎信息
      this.showWelcomeMessage();

      // 开始交互循环（在实际应用中，这会是UI事件驱动的）
      this.startInteractionDemo();

    } catch (error) {
      console.error('❌ 神宠系统启动失败:', error);
      throw error;
    }
  }

  /**
   * 注册插件
   */
  private async registerPlugins(): Promise<void> {
    console.log('🧩 注册插件...');

    // 注册截图插件
    const screenshotPlugin = new ScreenshotPlugin();
    await this.petBrain.registerPlugin(screenshotPlugin);

    // 注册笔记插件
    const notePlugin = new NotePlugin();
    await this.petBrain.registerPlugin(notePlugin);

    console.log('✅ 所有插件注册完成');
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    // 监听状态变化
    this.petBrain.on('state_changed', (data: any) => {
      console.log(`🔄 状态变化: ${data.oldState} → ${data.newState}`);
      this.onStateChanged(data.newState, data.emotion);
    });

    // 监听情绪变化
    this.petBrain.on('input_processed', (data: any) => {
      console.log(`😊 情绪状态: ${data.emotion.currentEmotion} (${data.emotion.intensity.toFixed(2)})`);
    });

    // 监听插件注册
    this.petBrain.on('plugin_registered', (data: any) => {
      console.log(`🧩 插件已注册: ${data.plugin.name}`);
    });

    // 监听心跳
    this.petBrain.on('heartbeat', (data: any) => {
      // 每隔一段时间显示系统状态（实际使用时可能不需要这么频繁）
      if (Math.random() < 0.05) { // 5%概率显示
        this.logSystemStatus();
      }
    });
  }

  /**
   * 处理用户输入
   */
  async handleUserInput(input: string): Promise<void> {
    if (!this.isRunning) {
      console.warn('⚠️ 神宠系统未启动');
      return;
    }

    try {
      console.log(`\n👤 用户输入: "${input}"`);
      
      const response = await this.petBrain.processInput(input);
      
      console.log(`🤖 神宠回应: ${response.response}`);
      console.log(`😊 当前情绪: ${response.emotion}`);
      
      if (response.actions && response.actions.length > 0) {
        console.log(`🎬 执行动作: ${response.actions.join(', ')}`);
      }

      // 显示情绪表现
      this.displayEmotionFeedback();

    } catch (error) {
      console.error('❌ 处理用户输入失败:', error);
    }
  }

  /**
   * 状态变化处理
   */
  private onStateChanged(newState: PetState, emotion: any): void {
    switch (newState) {
      case PetState.Idle:
        console.log('💤 进入静碗状态 - 汤圆安静地漂浮着...');
        break;
      case PetState.Hover:
        console.log('✨ 进入感应碗状态 - 汤圆开始发光，准备响应...');
        break;
      case PetState.Awaken:
        console.log('🌟 进入唤醒碗状态 - 工具菜单已激活！');
        break;
      case PetState.Control:
        console.log('⚙️ 进入控制碗状态 - 设置菜单已打开');
        break;
    }
  }

  /**
   * 显示情绪反馈
   */
  private displayEmotionFeedback(): void {
    const emotionInfo = this.petBrain.getCurrentEmotion();
    const display = emotionInfo.display;
    
    console.log(`🎭 情绪表现: ${display.animation} | 颜色: ${display.color} | 特效: ${display.particle || '无'}`);
  }

  /**
   * 欢迎信息
   */
  private showWelcomeMessage(): void {
    console.log(`
🍡 欢迎使用 SaintGrid 神宠系统！

我是您的汤圆小助手，支持以下功能：
📷 截图功能 - 说"截图"、"全屏截图"、"区域截图"
📝 笔记功能 - 说"记录：您的内容"
💬 对话交流 - 随时与我聊天
⚙️ 设置管理 - 说"设置"或"帮助"

四态交互模式：
① 静碗 (Idle) - 默认状态，安静待命
② 感应碗 (Hover) - 悬浮激活，显示提示
③ 唤醒碗 (Awaken) - 工具激活，执行功能
④ 控制碗 (Control) - 设置面板，系统配置

快来试试和我交流吧！
    `);
  }

  /**
   * 交互演示
   */
  private async startInteractionDemo(): Promise<void> {
    console.log('\n🎮 开始交互演示...\n');

    // 模拟一系列用户交互
    const demoInputs = [
      '你好',
      '截图',
      '记录：今天学习了AI宠物系统开发',
      '我很开心！',
      '设置',
      '区域截图',
      '记录：#工作 完成了神宠系统的主脑架构',
      '帮助'
    ];

    for (let i = 0; i < demoInputs.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // 等待2秒
      await this.handleUserInput(demoInputs[i]);
    }

    console.log('\n🎉 交互演示完成！');
    this.logSystemStatus();
  }

  /**
   * 记录系统状态
   */
  private logSystemStatus(): void {
    const status = this.petBrain.getSystemStatus();
    console.log(`
📊 系统状态报告:
- 当前状态: ${status.state}
- 当前情绪: ${status.emotion}
- 注册插件: ${status.pluginCount} 个
- 内存使用: ${status.memoryUsage.totalMemories}/${status.memoryUsage.memoryLimit}
- 运行时间: ${Math.floor(status.uptime / 1000)} 秒
- 最后交互: ${new Date(status.lastInteraction).toLocaleTimeString()}
    `);
  }

  /**
   * 获取推荐操作
   */
  getRecommendations(): string[] {
    return this.petBrain.getRecommendedActions();
  }

  /**
   * 获取当前状态
   */
  getCurrentState(): PetState {
    return this.petBrain.getCurrentState();
  }

  /**
   * 获取当前情绪
   */
  getCurrentEmotion(): {
    emotion: EmotionType;
    intensity: number;
    display: any;
  } {
    return this.petBrain.getCurrentEmotion();
  }

  /**
   * 获取完整的状态信息
   */
  getFullStateInfo(): {
    currentState: PetState;
    stateHistory: PetState[];
    emotion: EmotionType;
    lastInteraction: number;
  } {
    const stats = this.petBrain.getStateStatistics();
    const emotion = this.petBrain.getCurrentEmotion();
    const status = this.petBrain.getSystemStatus();
    
    return {
      currentState: this.petBrain.getCurrentState(),
      stateHistory: stats.stateHistory,
      emotion: emotion.emotion,
      lastInteraction: status.lastInteraction
    };
  }

  /**
   * 模拟鼠标悬浮事件
   */
  async onMouseHover(): Promise<void> {
    return this.petBrain.onMouseHover();
  }

  /**
   * 模拟左键点击事件
   */
  async onLeftClick(): Promise<void> {
    return this.petBrain.onLeftClick();
  }

  /**
   * 模拟右键点击事件
   */
  async onRightClick(): Promise<void> {
    return this.petBrain.onRightClick();
  }

  /**
   * 模拟鼠标离开事件
   */
  async onMouseLeave(): Promise<void> {
    return this.petBrain.onMouseLeave();
  }

  /**
   * 获取当前状态的可用操作
   */
  getAvailableActions(): {
    state: PetState;
    actions: string[];
    description: string;
    emotion: EmotionType;
  } {
    return this.petBrain.getAvailableActions();
  }

  /**
   * 获取状态历史
   */
  getStateHistory(): PetState[] {
    return this.petBrain.getStateHistory();
  }

  /**
   * 获取状态统计
   */
  getStateStatistics(): {
    stateHistory: PetState[];
    currentState: PetState;
    mostFrequentState: PetState;
    stateFrequency: Record<PetState, number>;
  } {
    return this.petBrain.getStateStatistics();
  }

  /**
   * 注册状态转换回调
   */
  onStateTransition(state: PetState, callback: Function): void {
    this.petBrain.onStateTransition(state, callback);
  }

  /**
   * 手动切换状态（用于测试）
   */
  async switchToState(state: PetState): Promise<void> {
    await this.petBrain.transitionToState(state);
  }

  /**
   * 停止神宠系统
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    console.log('🛑 正在关闭神宠系统...');
    
    await this.petBrain.destroy();
    this.isRunning = false;
    
    console.log('✅ 神宠系统已关闭');
  }
}

// 导出主要类型和系统
export * from './types';
export * from './core/PetBrain';
export { ScreenshotPlugin, NotePlugin } from './plugins/ExamplePlugins';

// 如果直接运行此文件，启动演示（Node.js环境）
/*
if (require.main === module) {
  const petSystem = new SaintGridPetSystem();
  
  petSystem.start().catch(error => {
    console.error('❌ 系统启动失败:', error);
    process.exit(1);
  });
  
  // 优雅关闭
  process.on('SIGINT', async () => {
    console.log('\n👋 接收到退出信号...');
    await petSystem.stop();
    process.exit(0);
  });
}
*/

// 浏览器环境下的启动函数
export async function startPetSystemDemo(): Promise<SaintGridPetSystem> {
  const petSystem = new SaintGridPetSystem();
  await petSystem.start();
  return petSystem;
}
