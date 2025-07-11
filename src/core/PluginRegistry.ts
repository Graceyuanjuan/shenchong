/**
 * 插件注册器 - 管理所有注册插件的生命周期与调用权限
 */

import { IPlugin, UserIntent, PluginResponse } from '../types';

export class PluginRegistry {
  private plugins: Map<string, IPlugin> = new Map();
  private intentMapping: Map<string, string[]> = new Map(); // intent -> plugin ids
  private pluginStatus: Map<string, 'active' | 'inactive' | 'error'> = new Map();

  /**
   * 注册插件
   */
  async registerPlugin(plugin: IPlugin): Promise<void> {
    try {
      // 检查插件是否已存在
      if (this.plugins.has(plugin.id)) {
        throw new Error(`Plugin ${plugin.id} already registered`);
      }

      // 初始化插件
      await plugin.initialize();
      
      // 注册插件
      this.plugins.set(plugin.id, plugin);
      this.pluginStatus.set(plugin.id, 'active');

      // 建立意图映射
      plugin.supportedIntents.forEach(intent => {
        if (!this.intentMapping.has(intent)) {
          this.intentMapping.set(intent, []);
        }
        this.intentMapping.get(intent)!.push(plugin.id);
      });

      console.log(`🧩 Plugin registered: ${plugin.name} (${plugin.id})`);
    } catch (error) {
      this.pluginStatus.set(plugin.id, 'error');
      console.error(`❌ Failed to register plugin ${plugin.id}:`, error);
      throw error;
    }
  }

  /**
   * 卸载插件
   */
  async unregisterPlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    try {
      // 清理意图映射
      plugin.supportedIntents.forEach(intent => {
        const pluginIds = this.intentMapping.get(intent);
        if (pluginIds) {
          const index = pluginIds.indexOf(pluginId);
          if (index > -1) {
            pluginIds.splice(index, 1);
          }
          if (pluginIds.length === 0) {
            this.intentMapping.delete(intent);
          }
        }
      });

      // 销毁插件
      await plugin.destroy();
      
      // 移除插件
      this.plugins.delete(pluginId);
      this.pluginStatus.delete(pluginId);

      console.log(`🗑️ Plugin unregistered: ${plugin.name} (${pluginId})`);
    } catch (error) {
      console.error(`❌ Failed to unregister plugin ${pluginId}:`, error);
      throw error;
    }
  }

  /**
   * 根据意图获取可用插件
   */
  getPluginsForIntent(intentType: string): IPlugin[] {
    const pluginIds = this.intentMapping.get(intentType) || [];
    return pluginIds
      .filter(id => this.pluginStatus.get(id) === 'active')
      .map(id => this.plugins.get(id)!)
      .filter(Boolean);
  }

  /**
   * 获取插件
   */
  getPlugin(pluginId: string): IPlugin | undefined {
    return this.plugins.get(pluginId);
  }

  /**
   * 获取所有已注册的插件
   */
  getAllPlugins(): IPlugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * 获取插件状态
   */
  getPluginStatus(pluginId: string): 'active' | 'inactive' | 'error' | 'not_found' {
    return this.pluginStatus.get(pluginId) || 'not_found';
  }

  /**
   * 设置插件状态
   */
  setPluginStatus(pluginId: string, status: 'active' | 'inactive' | 'error'): void {
    if (this.plugins.has(pluginId)) {
      this.pluginStatus.set(pluginId, status);
    }
  }

  /**
   * 获取支持的意图类型列表
   */
  getSupportedIntents(): string[] {
    return Array.from(this.intentMapping.keys());
  }

  /**
   * 执行插件
   */
  async executePlugin(pluginId: string, intent: UserIntent, context: any): Promise<PluginResponse> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    const status = this.pluginStatus.get(pluginId);
    if (status !== 'active') {
      throw new Error(`Plugin ${pluginId} is not active (status: ${status})`);
    }

    try {
      const response = await plugin.execute(intent, context);
      return response;
    } catch (error) {
      console.error(`❌ Plugin execution error (${pluginId}):`, error);
      this.setPluginStatus(pluginId, 'error');
      throw error;
    }
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<Record<string, boolean>> {
    const health: Record<string, boolean> = {};
    
    for (const [pluginId, plugin] of this.plugins) {
      try {
        // 这里可以调用插件的健康检查方法（如果有的话）
        health[pluginId] = this.pluginStatus.get(pluginId) === 'active';
      } catch (error) {
        health[pluginId] = false;
        this.setPluginStatus(pluginId, 'error');
      }
    }
    
    return health;
  }
}
