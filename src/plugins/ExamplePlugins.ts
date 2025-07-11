/**
 * 示例插件 - 截图功能（增强版：支持情绪感知）
 * 演示如何实现一个符合增强版 IPlugin 接口的插件
 */

import { 
  IPlugin, 
  UserIntent, 
  PluginResponse, 
  EmotionType, 
  PetState,
  EmotionContext,
  PluginContext 
} from '../types';

export class ScreenshotPlugin implements IPlugin {
  id = 'screenshot_plugin';
  name = '截图助手';
  version = '2.0.0';
  description = '提供屏幕截图功能，支持全屏、区域和窗口截图，具备情绪感知能力';
  supportedIntents = ['screenshot'];
  
  // 插件能力声明
  capabilities = {
    stateAware: true,
    emotionAware: true,
    contextAware: true,
    supportedHooks: ['onStateChanged' as const]
  };

  /**
   * 插件初始化
   */
  async initialize(): Promise<void> {
    console.log(`📷 ${this.name} v${this.version} 插件已初始化 (支持情绪感知)`);
    // 这里可以进行一些初始化工作，比如检查权限、设置快捷键等
  }

  /**
   * 执行截图操作
   */
  async execute(intent: UserIntent, context: any): Promise<PluginResponse> {
    try {
      console.log(`📷 执行截图操作:`, intent);

      // 从意图参数中获取截图模式
      const mode = intent.parameters?.mode || 'fullscreen';
      
      switch (mode) {
        case 'fullscreen':
          return await this.captureFullscreen(context);
        case 'area':
          return await this.captureArea(context);
        case 'window':
          return await this.captureWindow(context);
        default:
          return await this.captureFullscreen(context);
      }
    } catch (error) {
      console.error('❌ 截图失败:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        data: null,
        message: `截图失败: ${errorMessage}`,
        emotion: EmotionType.Calm
      };
    }
  }

  /**
   * 全屏截图
   */
  private async captureFullscreen(context: any): Promise<PluginResponse> {
    // 模拟截图操作
    await this.delay(1000); // 模拟处理时间
    
    const filename = `screenshot_${Date.now()}.png`;
    
    // 在实际实现中，这里会调用系统API进行截图
    console.log(`📸 全屏截图已保存: ${filename}`);
    
    return {
      success: true,
      data: {
        filename,
        path: `/Desktop/${filename}`,
        mode: 'fullscreen',
        size: { width: 1920, height: 1080 },
        actions: ['screenshot_taken']
      },
      message: `全屏截图已保存为 ${filename}`,
      emotion: EmotionType.Happy,
      nextState: PetState.Hover // 截图后切换到悬浮状态，方便后续操作
    };
  }

  /**
   * 区域截图
   */
  private async captureArea(context: any): Promise<PluginResponse> {
    await this.delay(500);
    
    const filename = `area_screenshot_${Date.now()}.png`;
    
    console.log(`📸 区域截图已保存: ${filename}`);
    
    return {
      success: true,
      data: {
        filename,
        path: `/Desktop/${filename}`,
        mode: 'area',
        size: { width: 800, height: 600 },
        actions: ['screenshot_taken', 'area_selected']
      },
      message: `区域截图已保存为 ${filename}`,
      emotion: EmotionType.Focused,
      nextState: PetState.Hover
    };
  }

  /**
   * 窗口截图
   */
  private async captureWindow(context: any): Promise<PluginResponse> {
    await this.delay(800);
    
    const filename = `window_screenshot_${Date.now()}.png`;
    
    console.log(`📸 窗口截图已保存: ${filename}`);
    
    return {
      success: true,
      data: {
        filename,
        path: `/Desktop/${filename}`,
        mode: 'window',
        size: { width: 1200, height: 800 },
        actions: ['screenshot_taken', 'window_captured']
      },
      message: `当前窗口截图已保存为 ${filename}`,
      emotion: EmotionType.Happy,
      nextState: PetState.Hover
    };
  }

  /**
   * 增强状态触发方法 - 支持情绪感知
   */
  async trigger(state: PetState, emotion: EmotionContext, context?: PluginContext): Promise<PluginResponse> {
    console.log(`📷 [插件响应] ScreenshotPlugin | 状态: ${state} | 情绪: ${emotion.currentEmotion} | 强度: ${emotion.intensity.toFixed(2)}`);
    
    // 特殊情绪+状态组合的智能响应
    if (state === PetState.Awaken && emotion.currentEmotion === EmotionType.Curious) {
      console.log(`🌟 [智能响应] Awaken状态 + Curious情绪 → 执行探索性截图`);
      return await this.captureExploratoryScreenshot(emotion, context);
    }
    
    if (state === PetState.Awaken && emotion.currentEmotion === EmotionType.Focused) {
      console.log(`🎯 [智能响应] Awaken状态 + Focused情绪 → 执行精准截图`);
      return await this.captureFocusedScreenshot(emotion, context);
    }
    
    // 基于状态的基础响应
    switch (state) {
      case PetState.Awaken:
        console.log(`🌟 [状态响应] 唤醒状态 → 快速截图 (情绪: ${emotion.currentEmotion})`);
        return await this.captureQuickScreenshot(emotion, context);
        
      case PetState.Hover:
        console.log(`✨ [状态响应] 感应状态 → 显示截图选项 (情绪: ${emotion.currentEmotion})`);
        return await this.showScreenshotOptions(emotion, context);
        
      case PetState.Control:
        console.log(`⚙️ [状态响应] 控制状态 → 打开截图设置 (情绪: ${emotion.currentEmotion})`);
        return await this.showScreenshotSettings(emotion, context);
        
      default:
        console.log(`💤 [状态响应] ${state}状态 → 截图插件待命 (情绪: ${emotion.currentEmotion})`);
        return {
          success: true,
          data: null,
          message: `截图插件在${state}状态下待命中 (情绪: ${emotion.currentEmotion})`,
          emotion: EmotionType.Calm
        };
    }
  }

  /**
   * onStateChanged 钩子实现
   */
  async onStateChanged(oldState: PetState, newState: PetState, emotion: EmotionContext, context?: PluginContext): Promise<PluginResponse> {
    console.log(`📷 [钩子响应] ScreenshotPlugin.onStateChanged | ${oldState} → ${newState} | 情绪: ${emotion.currentEmotion}`);
    
    // 特定状态转换的响应
    if (oldState === PetState.Idle && newState === PetState.Awaken) {
      console.log(`🔥 [钩子智能] 从静态直接唤醒 → 可能需要紧急截图`);
      
      if (emotion.intensity > 0.7) {
        console.log(`⚡ [紧急响应] 高强度情绪(${emotion.intensity.toFixed(2)}) → 立即执行截图`);
        return await this.captureEmergencyScreenshot(emotion, context);
      }
    }
    
    if (newState === PetState.Control && emotion.currentEmotion === EmotionType.Focused) {
      console.log(`🎛️ [钩子智能] 进入控制状态且专注 → 预加载截图工具`);
      return {
        success: true,
        data: {
          actions: ['preload_tools'],
          tools: ['screenshot_selector', 'annotation_tools', 'share_options']
        },
        message: '截图工具已预加载完成',
        emotion: EmotionType.Focused
      };
    }
    
    return {
      success: true,
      data: null,
      message: `状态钩子执行完成: ${oldState} → ${newState}`,
      emotion: emotion.currentEmotion
    };
  }

  /**
   * 探索性截图 - 好奇情绪下的特殊行为
   */
  private async captureExploratoryScreenshot(emotion: EmotionContext, context?: PluginContext): Promise<PluginResponse> {
    await this.delay(800);
    
    const filename = `curious_exploration_${Date.now()}.png`;
    
    console.log(`🔍 [情绪响应] 好奇探索截图已保存: ${filename}`);
    
    return {
      success: true,
      data: {
        filename,
        path: `/Desktop/${filename}`,
        mode: 'exploration',
        size: { width: 1920, height: 1080 },
        emotionContext: {
          type: emotion.currentEmotion,
          intensity: emotion.intensity,
          triggers: emotion.triggers
        },
        actions: ['screenshot_taken', 'exploration_mode']
      },
      message: `好奇心驱动的探索截图完成: ${filename}`,
      emotion: EmotionType.Excited,
      nextState: PetState.Hover
    };
  }

  /**
   * 专注截图 - 专注情绪下的精准操作
   */
  private async captureFocusedScreenshot(emotion: EmotionContext, context?: PluginContext): Promise<PluginResponse> {
    await this.delay(600);
    
    const filename = `focused_precision_${Date.now()}.png`;
    
    console.log(`🎯 [情绪响应] 专注精准截图已保存: ${filename}`);
    
    return {
      success: true,
      data: {
        filename,
        path: `/Desktop/${filename}`,
        mode: 'precision',
        size: { width: 1920, height: 1080 },
        emotionContext: {
          type: emotion.currentEmotion,
          intensity: emotion.intensity,
          precision: 'high'
        },
        actions: ['screenshot_taken', 'precision_mode']
      },
      message: `专注状态下的精准截图完成: ${filename}`,
      emotion: EmotionType.Happy,
      nextState: PetState.Hover
    };
  }

  /**
   * 紧急截图 - 高强度情绪下的快速响应
   */
  private async captureEmergencyScreenshot(emotion: EmotionContext, context?: PluginContext): Promise<PluginResponse> {
    await this.delay(300); // 更快的响应时间
    
    const filename = `emergency_${Date.now()}.png`;
    
    console.log(`🚨 [紧急响应] 紧急截图已保存: ${filename}`);
    
    return {
      success: true,
      data: {
        filename,
        path: `/Desktop/${filename}`,
        mode: 'emergency',
        size: { width: 1920, height: 1080 },
        emotionContext: {
          type: emotion.currentEmotion,
          intensity: emotion.intensity,
          urgency: 'high'
        },
        actions: ['screenshot_taken', 'emergency_mode']
      },
      message: `紧急情况截图完成: ${filename}`,
      emotion: EmotionType.Calm, // 帮助用户平静下来
      nextState: PetState.Hover
    };
  }

  /**
   * 快速截图 - 基础唤醒状态响应
   */
  private async captureQuickScreenshot(emotion: EmotionContext, context?: PluginContext): Promise<PluginResponse> {
    await this.delay(500);
    
    const filename = `quick_${Date.now()}.png`;
    
    console.log(`⚡ [快速响应] 快速截图已保存: ${filename}`);
    
    return {
      success: true,
      data: {
        filename,
        path: `/Desktop/${filename}`,
        mode: 'quick',
        emotionContext: { type: emotion.currentEmotion, intensity: emotion.intensity },
        actions: ['screenshot_taken']
      },
      message: `快速截图完成: ${filename}`,
      emotion: EmotionType.Happy,
      nextState: PetState.Hover
    };
  }

  /**
   * 显示截图选项 - 感应状态响应
   */
  private async showScreenshotOptions(emotion: EmotionContext, context?: PluginContext): Promise<PluginResponse> {
    const emotionBasedOptions = this.getEmotionBasedOptions(emotion);
    
    console.log(`✨ [选项展示] 基于${emotion.currentEmotion}情绪的截图选项`);
    
    return {
      success: true,
      data: {
        actions: ['fullscreen_screenshot', 'area_screenshot', 'window_screenshot', ...emotionBasedOptions],
        hints: ['全屏截图', '区域截图', '窗口截图', ...this.getEmotionBasedHints(emotion)],
        emotionContext: { type: emotion.currentEmotion, intensity: emotion.intensity }
      },
      message: `截图选项已准备就绪 (情绪感知: ${emotion.currentEmotion})`,
      emotion: EmotionType.Curious,
      nextState: PetState.Hover
    };
  }

  /**
   * 显示截图设置 - 控制状态响应
   */
  private async showScreenshotSettings(emotion: EmotionContext, context?: PluginContext): Promise<PluginResponse> {
    const emotionBasedSettings = this.getEmotionBasedSettings(emotion);
    
    console.log(`⚙️ [设置展示] 基于${emotion.currentEmotion}情绪的截图设置`);
    
    return {
      success: true,
      data: {
        settings: {
          defaultMode: 'fullscreen',
          saveLocation: '/Desktop',
          format: 'png',
          quality: 'high',
          ...emotionBasedSettings
        },
        emotionContext: { type: emotion.currentEmotion, intensity: emotion.intensity }
      },
      message: `截图设置已打开 (情绪优化: ${emotion.currentEmotion})`,
      emotion: EmotionType.Focused,
      nextState: PetState.Control
    };
  }

  /**
   * 根据情绪获取特殊选项
   */
  private getEmotionBasedOptions(emotion: EmotionContext): string[] {
    switch (emotion.currentEmotion) {
      case EmotionType.Excited:
        return ['gif_capture', 'quick_share'];
      case EmotionType.Focused:
        return ['annotation_mode', 'precision_crop'];
      case EmotionType.Curious:
        return ['explore_mode', 'discovery_capture'];
      default:
        return [];
    }
  }

  /**
   * 根据情绪获取提示文本
   */
  private getEmotionBasedHints(emotion: EmotionContext): string[] {
    switch (emotion.currentEmotion) {
      case EmotionType.Excited:
        return ['GIF录制', '快速分享'];
      case EmotionType.Focused:
        return ['注释模式', '精准裁剪'];
      case EmotionType.Curious:
        return ['探索模式', '发现截图'];
      default:
        return [];
    }
  }

  /**
   * 根据情绪获取设置优化
   */
  private getEmotionBasedSettings(emotion: EmotionContext): Record<string, any> {
    switch (emotion.currentEmotion) {
      case EmotionType.Excited:
        return { quickMode: true, autoShare: true };
      case EmotionType.Focused:
        return { precisionMode: true, gridOverlay: true };
      case EmotionType.Sleepy:
        return { oneClickMode: true, autoSave: true };
      default:
        return {};
    }
  }

  /**
   * 插件销毁
   */
  async destroy(): Promise<void> {
    console.log(`📷 ${this.name} 插件已销毁`);
    // 清理资源，比如移除快捷键监听等
  }

  /**
   * 工具方法：延迟执行
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * 示例插件 - 笔记功能（增强版：支持情绪感知）
 */
export class NotePlugin implements IPlugin {
  id = 'note_plugin';
  name = '笔记助手';
  version = '2.0.0';
  description = '快速记录文字笔记，支持自动分类、搜索和情绪感知标注';
  supportedIntents = ['note'];

  // 插件能力声明
  capabilities = {
    stateAware: true,
    emotionAware: true,
    contextAware: true,
    supportedHooks: ['onStateChanged' as const]
  };

  private notes: Array<{
    id: string;
    content: string;
    timestamp: number;
    tags: string[];
    emotionContext?: {
      emotion: EmotionType;
      intensity: number;
      state: PetState;
    };
  }> = [];

  async initialize(): Promise<void> {
    console.log(`📝 ${this.name} v${this.version} 插件已初始化 (支持情绪感知)`);
    // 加载已保存的笔记
    await this.loadNotes();
  }

  async execute(intent: UserIntent, context: any): Promise<PluginResponse> {
    try {
      console.log(`📝 执行笔记操作:`, intent);

      const content = intent.parameters?.content || intent.rawInput.replace(/记录[：:]?\s*/, '');
      
      if (!content || content.trim().length === 0) {
        return {
          success: false,
          data: null,
          message: '请告诉我要记录什么内容，比如"记录：今天要买菜"',
          emotion: EmotionType.Curious
        };
      }

      return await this.saveNote(content.trim(), context);
    } catch (error) {
      console.error('❌ 笔记保存失败:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        data: null,
        message: `笔记保存失败: ${errorMessage}`,
        emotion: EmotionType.Calm
      };
    }
  }

  private async saveNote(content: string, context: any): Promise<PluginResponse> {
    // 尝试从上下文中获取情绪信息
    const emotionContext = context?.emotion || null;
    const currentState = context?.currentState || PetState.Idle;
    
    const note = {
      id: `note_${Date.now()}`,
      content,
      timestamp: Date.now(),
      tags: this.extractTags(content),
      emotionContext: emotionContext ? {
        emotion: emotionContext.currentEmotion,
        intensity: emotionContext.intensity,
        state: currentState
      } : undefined
    };

    this.notes.push(note);
    
    // 模拟保存到文件
    await this.delay(300);
    
    console.log(`📝 笔记已保存:`, note);

    const emotionInfo = note.emotionContext 
      ? ` (情绪: ${note.emotionContext.emotion}, 强度: ${note.emotionContext.intensity.toFixed(2)})` 
      : '';

    return {
      success: true,
      data: {
        noteId: note.id,
        content: note.content,
        tags: note.tags,
        totalNotes: this.notes.length,
        emotionContext: note.emotionContext,
        actions: ['note_saved']
      },
      message: `笔记已保存！${note.tags.length > 0 ? `标签: ${note.tags.join(', ')}` : ''}${emotionInfo}`,
      emotion: EmotionType.Happy,
      nextState: PetState.Hover
    };
  }

  private extractTags(content: string): string[] {
    const tags: string[] = [];
    
    // 提取 #标签
    const hashTags = content.match(/#[\u4e00-\u9fa5\w]+/g);
    if (hashTags) {
      tags.push(...hashTags.map(tag => tag.substring(1)));
    }
    
    // 根据内容推断标签
    if (/工作|任务|项目|会议/.test(content)) {
      tags.push('工作');
    }
    if (/学习|课程|知识|笔记/.test(content)) {
      tags.push('学习');
    }
    if (/生活|日常|购物|吃饭/.test(content)) {
      tags.push('生活');
    }
    
    return [...new Set(tags)];
  }

  private async loadNotes(): Promise<void> {
    // 在实际实现中，这里会从文件或数据库加载笔记
    console.log('📚 加载历史笔记...');
  }

  async destroy(): Promise<void> {
    console.log(`📝 ${this.name} 插件已销毁`);
    // 保存笔记到文件
    await this.saveNotesToFile();
  }

  private async saveNotesToFile(): Promise<void> {
    // 模拟保存到文件
    console.log(`💾 保存 ${this.notes.length} 条笔记到文件`);
  }

  /**
   * 增强状态触发方法 - 支持情绪感知
   */
  async trigger(state: PetState, emotion: EmotionContext, context?: PluginContext): Promise<PluginResponse> {
    console.log(`📝 [插件响应] NotePlugin | 状态: ${state} | 情绪: ${emotion.currentEmotion} | 强度: ${emotion.intensity.toFixed(2)}`);
    
    // 特殊情绪+状态组合的智能响应
    if (state === PetState.Hover && emotion.currentEmotion === EmotionType.Focused) {
      console.log(`🎯 [智能响应] Hover状态 + Focused情绪 → 自动记录摘要`);
      return await this.createFocusedSummary(emotion, context);
    }
    
    if (state === PetState.Awaken && emotion.currentEmotion === EmotionType.Excited) {
      console.log(`🚀 [智能响应] Awaken状态 + Excited情绪 → 创意记录模式`);
      return await this.activateCreativeMode(emotion, context);
    }
    
    // 基于状态的基础响应
    switch (state) {
      case PetState.Awaken:
        console.log(`🌟 [状态响应] 唤醒状态 → 快速笔记 (情绪: ${emotion.currentEmotion})`);
        return await this.activateQuickNoteMode(emotion, context);
        
      case PetState.Hover:
        console.log(`✨ [状态响应] 感应状态 → 显示笔记统计 (情绪: ${emotion.currentEmotion})`);
        return await this.showNotesStatistics(emotion, context);
        
      case PetState.Control:
        console.log(`⚙️ [状态响应] 控制状态 → 打开笔记管理 (情绪: ${emotion.currentEmotion})`);
        return await this.showNotesManagement(emotion, context);
        
      default:
        console.log(`💤 [状态响应] ${state}状态 → 笔记插件待命 (情绪: ${emotion.currentEmotion})`);
        return {
          success: true,
          data: {
            notesCount: this.notes.length,
            emotionContext: { type: emotion.currentEmotion, intensity: emotion.intensity }
          },
          message: `笔记助手在${state}状态下待命 (情绪: ${emotion.currentEmotion})`,
          emotion: EmotionType.Calm
        };
    }
  }

  /**
   * onStateChanged 钩子实现
   */
  async onStateChanged(oldState: PetState, newState: PetState, emotion: EmotionContext, context?: PluginContext): Promise<PluginResponse> {
    console.log(`📝 [钩子响应] NotePlugin.onStateChanged | ${oldState} → ${newState} | 情绪: ${emotion.currentEmotion}`);
    
    // 特定状态转换的响应
    if (oldState === PetState.Awaken && newState === PetState.Hover && emotion.currentEmotion === EmotionType.Happy) {
      console.log(`😊 [钩子智能] 愉快地从唤醒转到悬浮 → 可能刚完成了什么，建议记录`);
      return {
        success: true,
        data: {
          suggestion: {
            type: 'achievement_record',
            message: '看起来刚刚完成了什么，要记录一下成果吗？',
            templates: ['刚刚完成了...', '学到了...', '解决了...']
          },
          emotionContext: { type: emotion.currentEmotion, intensity: emotion.intensity }
        },
        message: '检测到成就时刻，建议记录',
        emotion: EmotionType.Happy
      };
    }
    
    if (newState === PetState.Awaken && emotion.intensity > 0.8) {
      console.log(`⚡ [钩子智能] 高强度情绪${emotion.currentEmotion}进入唤醒 → 快速情绪记录`);
      return {
        success: true,
        data: {
          emotionRecord: {
            emotion: emotion.currentEmotion,
            intensity: emotion.intensity,
            timestamp: Date.now(),
            quickTemplates: this.getEmotionBasedTemplates(emotion.currentEmotion)
          }
        },
        message: `检测到强烈${emotion.currentEmotion}情绪，建议记录当前感受`,
        emotion: emotion.currentEmotion
      };
    }
    
    return {
      success: true,
      data: null,
      message: `状态钩子执行完成: ${oldState} → ${newState}`,
      emotion: emotion.currentEmotion
    };
  }

  /**
   * 专注摘要创建 - 专注情绪下的自动摘要
   */
  private async createFocusedSummary(emotion: EmotionContext, context?: PluginContext): Promise<PluginResponse> {
    const summaryContent = `[专注摘要 ${new Date().toLocaleString()}]\n当前专注于重要工作中...`;
    
    const note = {
      id: `summary_${Date.now()}`,
      content: summaryContent,
      timestamp: Date.now(),
      tags: ['专注', '摘要', '自动'],
      emotionContext: {
        emotion: emotion.currentEmotion,
        intensity: emotion.intensity,
        state: PetState.Hover
      }
    };
    
    this.notes.push(note);
    
    console.log(`🎯 [情绪响应] 专注摘要已自动创建`);
    
    return {
      success: true,
      data: {
        noteId: note.id,
        content: note.content,
        autoCreated: true,
        emotionContext: note.emotionContext,
        actions: ['summary_created', 'auto_focus_mode']
      },
      message: '基于专注状态自动创建工作摘要',
      emotion: EmotionType.Focused,
      nextState: PetState.Hover
    };
  }

  /**
   * 创意记录模式 - 兴奋情绪下的创意捕捉
   */
  private async activateCreativeMode(emotion: EmotionContext, context?: PluginContext): Promise<PluginResponse> {
    console.log(`🚀 [情绪响应] 激活创意记录模式`);
    
    return {
      success: true,
      data: {
        mode: 'creative',
        actions: ['brainstorm_note', 'idea_capture', 'inspiration_record'],
        templates: ['💡 新想法：', '🌟 灵感闪现：', '🎨 创意构思：'],
        emotionContext: { type: emotion.currentEmotion, intensity: emotion.intensity },
        features: ['快速记录', '灵感链接', '创意标签']
      },
      message: '创意记录模式已激活！快速捕捉你的灵感',
      emotion: EmotionType.Excited,
      nextState: PetState.Awaken
    };
  }

  /**
   * 快速笔记模式
   */
  private async activateQuickNoteMode(emotion: EmotionContext, context?: PluginContext): Promise<PluginResponse> {
    const emotionBasedTemplates = this.getEmotionBasedTemplates(emotion.currentEmotion);
    
    return {
      success: true,
      data: {
        actions: ['quick_note', 'voice_note', 'clipboard_note'],
        templates: ['工作记录', '学习笔记', '生活备忘', ...emotionBasedTemplates],
        recentNotes: this.notes.slice(-3),
        emotionContext: { type: emotion.currentEmotion, intensity: emotion.intensity }
      },
      message: `快速笔记模式已激活 (情绪优化: ${emotion.currentEmotion})`,
      emotion: EmotionType.Focused,
      nextState: PetState.Awaken
    };
  }

  /**
   * 显示笔记统计
   */
  private async showNotesStatistics(emotion: EmotionContext, context?: PluginContext): Promise<PluginResponse> {
    const todayNotes = this.notes.filter(note => 
      new Date(note.timestamp).toDateString() === new Date().toDateString()
    );
    
    const emotionBasedHints = this.getEmotionBasedHints(emotion.currentEmotion);
    
    return {
      success: true,
      data: {
        totalNotes: this.notes.length,
        todayNotes: todayNotes.length,
        recentTags: this.getRecentTags(),
        hints: ['记录新笔记', '查看历史', '搜索笔记', ...emotionBasedHints],
        emotionContext: { type: emotion.currentEmotion, intensity: emotion.intensity }
      },
      message: `今日已记录 ${todayNotes.length} 条笔记 (情绪感知: ${emotion.currentEmotion})`,
      emotion: EmotionType.Curious,
      nextState: PetState.Hover
    };
  }

  /**
   * 显示笔记管理
   */
  private async showNotesManagement(emotion: EmotionContext, context?: PluginContext): Promise<PluginResponse> {
    const emotionBasedSettings = this.getEmotionBasedSettings(emotion.currentEmotion);
    
    return {
      success: true,
      data: {
        settings: {
          autoSave: true,
          tagSuggestions: true,
          exportFormat: 'markdown',
          syncEnabled: false,
          ...emotionBasedSettings
        },
        management: {
          totalNotes: this.notes.length,
          categories: this.getCategorizedNotes(),
          storageUsed: this.calculateStorageUsage()
        },
        emotionContext: { type: emotion.currentEmotion, intensity: emotion.intensity }
      },
      message: `笔记管理面板已打开 (情绪优化: ${emotion.currentEmotion})`,
      emotion: EmotionType.Focused,
      nextState: PetState.Control
    };
  }

  /**
   * 根据情绪获取模板建议
   */
  private getEmotionBasedTemplates(emotion: EmotionType): string[] {
    switch (emotion) {
      case EmotionType.Excited:
        return ['🚀 新发现：', '💡 突发奇想：'];
      case EmotionType.Focused:
        return ['� 重点记录：', '🎯 关键信息：'];
      case EmotionType.Happy:
        return ['😊 美好时刻：', '🎉 值得纪念：'];
      case EmotionType.Curious:
        return ['🤔 疑问记录：', '🔍 探索发现：'];
      default:
        return [];
    }
  }

  /**
   * 根据情绪获取操作提示
   */
  private getEmotionBasedHints(emotion: EmotionType): string[] {
    switch (emotion) {
      case EmotionType.Excited:
        return ['快速记录灵感', '分享有趣发现'];
      case EmotionType.Focused:
        return ['记录重点内容', '整理思路'];
      case EmotionType.Sleepy:
        return ['简单记录', '明日提醒'];
      default:
        return [];
    }
  }

  /**
   * 根据情绪获取设置优化
   */
  private getEmotionBasedSettings(emotion: EmotionType): Record<string, any> {
    switch (emotion) {
      case EmotionType.Excited:
        return { quickSave: true, autoShare: true };
      case EmotionType.Focused:
        return { detailedMode: true, structuredFormat: true };
      case EmotionType.Sleepy:
        return { simpleMode: true, minimalInterface: true };
      default:
        return {};
    }
  }

  /**
   * 获取最近使用的标签
   */
  private getRecentTags(): string[] {
    const tagCounts = new Map<string, number>();
    this.notes.slice(-10).forEach(note => {
      note.tags.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });
    
    return Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag);
  }

  /**
   * 获取分类笔记统计
   */
  private getCategorizedNotes(): Record<string, number> {
    const categories: Record<string, number> = {};
    this.notes.forEach(note => {
      note.tags.forEach(tag => {
        categories[tag] = (categories[tag] || 0) + 1;
      });
    });
    return categories;
  }

  /**
   * 计算存储使用量
   */
  private calculateStorageUsage(): string {
    const totalChars = this.notes.reduce((sum, note) => sum + note.content.length, 0);
    const sizeInKB = Math.round(totalChars * 2 / 1024); // 粗略估算
    return `${sizeInKB} KB`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
