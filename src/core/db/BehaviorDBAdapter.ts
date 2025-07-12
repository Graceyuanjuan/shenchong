/**
 * T5-A-3 | BehaviorDB集成适配器
 * 将现有策略管理器迁移到使用BehaviorDB持久化
 */

import { BehaviorDB } from './BehaviorDB';
import { StrategyRecord, StrategyAction } from '../../schema/strategySchema';
import { PetState, EmotionType } from '../../types';

// 现有策略规则接口（来自原始系统）
interface LegacyBehaviorStrategyRule {
  id: string;
  name: string;
  description: string;
  state: PetState | PetState[];
  emotion: EmotionType | EmotionType[];
  priority: number;
  actions: LegacyBehaviorAction[];
  cooldownMs?: number;
  maxExecutions?: number;
  enabled: boolean;
}

interface LegacyBehaviorAction {
  type: string;
  delayMs?: number;
  priority?: number;
  execute: (context: any) => Promise<any>;
}

export class BehaviorDBAdapter {
  private behaviorDB: BehaviorDB;
  private migrationComplete: boolean = false;

  constructor(dbPath?: string) {
    this.behaviorDB = new BehaviorDB(dbPath);
  }

  /**
   * 初始化适配器
   */
  async initialize(): Promise<void> {
    await this.behaviorDB.initialize();
    
    // 检查是否需要迁移现有策略
    const existingStrategies = await this.behaviorDB.loadStrategies();
    if (existingStrategies.length === 0) {
      console.log('🔄 开始迁移现有策略到BehaviorDB...');
      await this.migrateDefaultStrategies();
    }
    
    this.migrationComplete = true;
    console.log('✅ BehaviorDB适配器初始化完成');
  }

  /**
   * 迁移默认策略到新格式
   */
  private async migrateDefaultStrategies(): Promise<void> {
    const defaultStrategies = this.getDefaultLegacyStrategies();
    
    for (const legacyStrategy of defaultStrategies) {
      const newStrategy = this.convertLegacyToNew(legacyStrategy);
      await this.behaviorDB.saveStrategy(newStrategy);
    }
    
    console.log(`✅ 迁移完成: ${defaultStrategies.length} 个策略`);
  }

  /**
   * 将旧格式策略转换为新格式
   */
  private convertLegacyToNew(legacy: LegacyBehaviorStrategyRule): StrategyRecord {
    // 处理状态和情绪数组
    const states = Array.isArray(legacy.state) ? legacy.state : [legacy.state];
    const emotions = Array.isArray(legacy.emotion) ? legacy.emotion : [legacy.emotion];

    // 转换动作
    const actions: StrategyAction[] = legacy.actions.map((action, index) => ({
      id: `${legacy.id}_action_${index}`,
      type: action.type,
      name: `${action.type}_action`,
      delay: action.delayMs || 0,
      priority: action.priority || 5,
      params: {
        // 由于execute函数无法序列化，我们将创建参数化的动作
        actionType: action.type,
        legacy: true
      }
    }));

    return {
      id: legacy.id,
      name: legacy.name,
      description: legacy.description,
      enabled: legacy.enabled,
      conditions: {
        states,
        emotions,
        priority: legacy.priority,
        cooldown: legacy.cooldownMs,
        maxExecutions: legacy.maxExecutions
      },
      actions,
      metadata: {
        version: '1.0.0',
        author: 'System Migration',
        description: `Migrated from legacy strategy: ${legacy.description}`,
        tags: ['migrated', 'legacy'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deprecated: false,
        dependencies: []
      }
    };
  }

  /**
   * 获取与状态和情绪匹配的策略
   */
  async getMatchingStrategies(state: PetState, emotion: EmotionType): Promise<StrategyRecord[]> {
    if (!this.migrationComplete) {
      throw new Error('BehaviorDB适配器未完成初始化');
    }
    
    return this.behaviorDB.getMatchingStrategies(state, emotion);
  }

  /**
   * 保存新策略
   */
  async saveStrategy(strategy: StrategyRecord): Promise<void> {
    return this.behaviorDB.saveStrategy(strategy);
  }

  /**
   * 删除策略
   */
  async deleteStrategy(strategyId: string): Promise<boolean> {
    return this.behaviorDB.deleteStrategy(strategyId);
  }

  /**
   * 获取所有策略
   */
  async getAllStrategies(): Promise<StrategyRecord[]> {
    return this.behaviorDB.getCachedStrategies();
  }

  /**
   * 设置策略变化监听器
   */
  onStrategiesChanged(callback: (strategies: StrategyRecord[]) => void): void {
    this.behaviorDB.onStrategiesChanged(callback);
  }

  /**
   * 记录策略执行统计
   */
  recordExecution(strategyId: string, executionTime: number, success: boolean, error?: string): void {
    this.behaviorDB.recordExecution(strategyId, executionTime, success, error);
  }

  /**
   * 获取执行统计
   */
  getExecutionStats(strategyId?: string) {
    return this.behaviorDB.getExecutionStats(strategyId);
  }

  /**
   * 创建策略快照
   */
  async createSnapshot(description?: string) {
    return this.behaviorDB.createSnapshot(description);
  }

  /**
   * 从快照恢复
   */
  async restoreFromSnapshot(snapshotId: string): Promise<boolean> {
    return this.behaviorDB.restoreFromSnapshot(snapshotId);
  }

  /**
   * 销毁适配器
   */
  async destroy(): Promise<void> {
    await this.behaviorDB.destroy();
  }

  /**
   * 获取默认的旧格式策略（用于迁移）
   */
  private getDefaultLegacyStrategies(): LegacyBehaviorStrategyRule[] {
    return [
      {
        id: 'ControlState',
        name: '控制状态策略',
        description: '在控制状态下的默认行为',
        state: PetState.Control,
        emotion: [EmotionType.Focused, EmotionType.Calm],
        priority: 8,
        actions: [
          {
            type: 'control_activation',
            delayMs: 0,
            priority: 8,
            execute: async () => ({
              success: true,
              message: '🎯 神宠进入专注控制模式'
            })
          },
          {
            type: 'plugin_trigger',
            delayMs: 500,
            priority: 7,
            execute: async () => ({
              success: true,
              message: '⚡ 启动专业工具...'
            })
          }
        ],
        cooldownMs: 2000,
        enabled: true
      },
      {
        id: 'AwakenState',
        name: '唤醒状态策略',
        description: '在唤醒状态下的响应行为',
        state: PetState.Awaken,
        emotion: [EmotionType.Curious, EmotionType.Excited],
        priority: 7,
        actions: [
          {
            type: 'awaken_response',
            delayMs: 0,
            priority: 7,
            execute: async () => ({
              success: true,
              message: '🌟 神宠积极回应你的召唤！'
            })
          },
          {
            type: 'plugin_trigger',
            delayMs: 3000,
            priority: 6,
            execute: async () => ({
              success: true,
              message: '🔌 启动互动插件...'
            })
          }
        ],
        cooldownMs: 1000,
        enabled: true
      },
      {
        id: 'HoverState',
        name: '悬停状态策略',
        description: '鼠标悬停时的反馈行为',
        state: PetState.Hover,
        emotion: [EmotionType.Curious, EmotionType.Happy],
        priority: 4,
        actions: [
          {
            type: 'hover_feedback',
            delayMs: 0,
            priority: 4,
            execute: async () => ({
              success: true,
              message: '✨ 神宠感受到了你的关注！'
            })
          }
        ],
        cooldownMs: 800,
        enabled: true
      },
      {
        id: 'IdleState',
        name: '静止状态策略',
        description: '空闲状态下的自动行为',
        state: PetState.Idle,
        emotion: [EmotionType.Calm, EmotionType.Happy],
        priority: 2,
        actions: [
          {
            type: 'idle_animation',
            delayMs: 0,
            priority: 3,
            execute: async () => ({
              success: true,
              message: '😌 神宠正在安静地等待...'
            })
          },
          {
            type: 'emotional_expression',
            delayMs: 2000,
            priority: 2,
            execute: async () => ({
              success: true,
              message: '✨ 散发着平静的光芒'
            })
          }
        ],
        cooldownMs: 5000,
        enabled: true
      },
      {
        id: 'EmotionDriven',
        name: '情绪驱动策略',
        description: '基于情绪变化的响应策略',
        state: [PetState.Idle, PetState.Hover, PetState.Awaken],
        emotion: [EmotionType.Excited, EmotionType.Happy],
        priority: 6,
        actions: [
          {
            type: 'emotion_animation',
            delayMs: 0,
            priority: 6,
            execute: async () => ({
              success: true,
              message: '🎭 情绪动画表达中...'
            })
          }
        ],
        cooldownMs: 3000,
        enabled: true
      },
      {
        id: 'TimeAware',
        name: '时间感知策略',
        description: '基于时间的自动行为策略',
        state: [PetState.Idle, PetState.Hover],
        emotion: [EmotionType.Calm],
        priority: 1,
        actions: [
          {
            type: 'time_based_behavior',
            delayMs: 1000,
            priority: 1,
            execute: async () => ({
              success: true,
              message: '⏰ 时间感知行为触发'
            })
          }
        ],
        cooldownMs: 10000,
        enabled: true
      }
    ];
  }
}

export default BehaviorDBAdapter;
