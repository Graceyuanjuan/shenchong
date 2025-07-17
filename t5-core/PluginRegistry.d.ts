/**
 * 插件注册器 - 管理所有注册插件的生命周期与调用权限
 */
import { IPlugin, UserIntent, PluginResponse } from '../types';
export declare class PluginRegistry {
    private plugins;
    private intentMapping;
    private pluginStatus;
    /**
     * 注册插件
     */
    registerPlugin(plugin: IPlugin): Promise<void>;
    /**
     * 卸载插件
     */
    unregisterPlugin(pluginId: string): Promise<void>;
    /**
     * 根据意图获取可用插件
     */
    getPluginsForIntent(intentType: string): IPlugin[];
    /**
     * 获取插件
     */
    getPlugin(pluginId: string): IPlugin | undefined;
    /**
     * 获取所有已注册的插件
     */
    getAllPlugins(): IPlugin[];
    /**
     * 获取插件状态
     */
    getPluginStatus(pluginId: string): 'active' | 'inactive' | 'error' | 'not_found';
    /**
     * 设置插件状态
     */
    setPluginStatus(pluginId: string, status: 'active' | 'inactive' | 'error'): void;
    /**
     * 获取支持的意图类型列表
     */
    getSupportedIntents(): string[];
    /**
     * 执行插件
     */
    executePlugin(pluginId: string, intent: UserIntent, context: any): Promise<PluginResponse>;
    /**
     * 健康检查
     */
    healthCheck(): Promise<Record<string, boolean>>;
}
//# sourceMappingURL=PluginRegistry.d.ts.map