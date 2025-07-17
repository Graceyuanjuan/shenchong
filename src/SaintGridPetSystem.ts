/**
 * SaintGrid 神宠系统 - 主入口类
 * 提供简化的API接口，包装PetBrain核心功能
 */

import { PetBrain } from './core/PetBrain';
import { PetState, EmotionType, AIProvider, PetBrainConfig } from './types';

export class SaintGridPetSystem {
  private petBrain: PetBrain;
  private isRunning: boolean = false;

  constructor(config?: Partial<PetBrainConfig>) {
    // 默认配置
    const defaultConfig: PetBrainConfig = {
      defaultState: PetState.Idle,
      defaultEmotion: EmotionType.Calm,
      memoryLimit: 2000,
      aiProviders: [AIProvider.OpenAI, AIProvider.Claude, AIProvider.Doubao],
      plugins: []
    };

    // 合并用户配置
    const finalConfig = { ...defaultConfig, ...config };
    
    // 初始化主脑
    this.petBrain = new PetBrain(finalConfig);
  }

  /**
   * 启动神宠系统
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      return;
    }

    await this.petBrain.initialize();
    this.isRunning = true;
  }

  /**
   * 停止神宠系统
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    await this.petBrain.destroy();
    this.isRunning = false;
  }

  /**
   * 获取当前状态
   */
  getCurrentState(): PetState {
    return this.petBrain.getCurrentState();
  }

  /**
   * 切换状态
   */
  async switchToState(state: PetState): Promise<void> {
    await this.petBrain.transitionToState(state);
  }

  /**
   * 处理用户输入
   */
  async processUserInput(input: string): Promise<any> {
    return await this.petBrain.processInput(input);
  }

  /**
   * 获取当前情绪
   */
  getCurrentEmotion(): EmotionType {
    return this.petBrain.getCurrentEmotion().emotion;
  }

  /**
   * 获取情绪详情（包含强度等）
   */
  getEmotionDetails(): { emotion: EmotionType; intensity: number; display: any } {
    return this.petBrain.getCurrentEmotion();
  }

  /**
   * 设置情绪
   */
  async setEmotion(emotion: EmotionType): Promise<void> {
    // PetBrain没有直接的setEmotion方法，通过processInput实现
    await this.petBrain.processInput(`emotion:${emotion}`);
  }

  /**
   * 处理用户输入 (别名方法)
   */
  async handleUserInput(input: string): Promise<any> {
    return await this.processUserInput(input);
  }

  /**
   * 获取可用操作
   */
  getAvailableActions(): string[] {
    return this.petBrain.getRecommendedActions();
  }

  /**
   * 获取状态历史
   */
  getStateHistory(): PetState[] {
    return this.petBrain.getStateHistory();
  }

  /**
   * 获取状态统计 (别名方法)
   */
  getStateStatistics(): any {
    return this.getStatistics();
  }

  /**
   * 获取推荐操作
   */
  getRecommendations(): string[] {
    return this.getAvailableActions();
  }

  /**
   * 添加事件监听器
   */
  addEventListener(event: string, callback: Function): void {
    this.petBrain.on(event, callback);
  }

  /**
   * 移除事件监听器
   */
  removeEventListener(event: string, callback: Function): void {
    this.petBrain.off(event, callback);
  }

  /**
   * 获取统计信息
   */
  getStatistics(): any {
    return this.petBrain.getStateStatistics();
  }

  /**
   * 获取底层PetBrain实例（高级使用）
   */
  getPetBrain(): PetBrain {
    return this.petBrain;
  }

  /**
   * 鼠标悬浮事件
   */
  async onMouseHover(): Promise<void> {
    await this.petBrain.onMouseHover();
  }

  /**
   * 左键点击事件
   */
  async onLeftClick(): Promise<void> {
    await this.petBrain.onLeftClick();
  }

  /**
   * 右键点击事件
   */
  async onRightClick(): Promise<void> {
    await this.petBrain.onRightClick();
  }

  /**
   * 鼠标离开事件
   */
  async onMouseLeave(): Promise<void> {
    await this.petBrain.onMouseLeave();
  }
}
