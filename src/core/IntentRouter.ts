/**
 * 意图调度器 - 识别用户输入的语义意图，选择对应插件响应
 */

import { UserIntent } from '../types';

export class IntentRouter {
  private intentPatterns: Map<string, RegExp[]> = new Map();
  private intentKeywords: Map<string, string[]> = new Map();
  private intentPriority: Map<string, number> = new Map();

  constructor() {
    this.initializeDefaultIntents();
  }

  /**
   * 初始化默认意图识别规则
   */
  private initializeDefaultIntents(): void {
    // 截图相关意图
    this.registerIntent('screenshot', {
      patterns: [
        /截图|screenshot|capture/i,
        /保存.*图片|save.*image/i,
        /记录.*屏幕|record.*screen/i
      ],
      keywords: ['截图', '截屏', '保存', '拍照', 'screenshot', 'capture'],
      priority: 8
    });

    // 复制相关意图
    this.registerIntent('copy', {
      patterns: [
        /复制|copy|剪贴板/i,
        /拷贝|duplicate/i
      ],
      keywords: ['复制', '拷贝', '剪贴板', 'copy', 'clipboard'],
      priority: 7
    });

    // 记录相关意图
    this.registerIntent('note', {
      patterns: [
        /记录|记要|笔记|note/i,
        /保存.*文字|save.*text/i,
        /写下|记下|write.*down/i
      ],
      keywords: ['记录', '笔记', '记要', '写下', 'note', 'memo'],
      priority: 6
    });

    // 投屏相关意图
    this.registerIntent('cast', {
      patterns: [
        /投屏|cast|screen.*share/i,
        /分享.*屏幕|share.*screen/i,
        /镜像|mirror/i
      ],
      keywords: ['投屏', '分享', '镜像', 'cast', 'share', 'mirror'],
      priority: 7
    });

    // 对话相关意图
    this.registerIntent('chat', {
      patterns: [
        /聊天|chat|对话|conversation/i,
        /问.*问题|ask.*question/i,
        /讨论|discuss/i
      ],
      keywords: ['聊天', '对话', '问题', '讨论', 'chat', 'talk'],
      priority: 5
    });

    // 设置相关意图
    this.registerIntent('settings', {
      patterns: [
        /设置|settings|配置|config/i,
        /偏好|preference/i,
        /选项|options/i
      ],
      keywords: ['设置', '配置', '偏好', 'settings', 'config'],
      priority: 4
    });

    // 帮助相关意图
    this.registerIntent('help', {
      patterns: [
        /帮助|help|怎么.*用|how.*to/i,
        /指南|guide|教程|tutorial/i
      ],
      keywords: ['帮助', '指南', '教程', 'help', 'guide'],
      priority: 3
    });

    // 情绪表达意图
    this.registerIntent('emotion', {
      patterns: [
        /开心|高兴|happy|excited/i,
        /难过|伤心|sad|upset/i,
        /生气|愤怒|angry|mad/i,
        /累了|疲惫|tired|sleepy/i
      ],
      keywords: ['开心', '难过', '生气', '累', 'happy', 'sad', 'angry', 'tired'],
      priority: 9
    });
  }

  /**
   * 注册意图识别规则
   */
  registerIntent(intentType: string, config: {
    patterns: RegExp[];
    keywords: string[];
    priority: number;
  }): void {
    this.intentPatterns.set(intentType, config.patterns);
    this.intentKeywords.set(intentType, config.keywords);
    this.intentPriority.set(intentType, config.priority);
  }

  /**
   * 识别用户输入的意图
   */
  parseIntent(input: string): UserIntent[] {
    const intents: UserIntent[] = [];
    const lowerInput = input.toLowerCase();

    // 遍历所有已注册的意图类型
    for (const [intentType, patterns] of Array.from(this.intentPatterns)) {
      let confidence = 0;
      const parameters: Record<string, any> = {};

      // 检查正则模式匹配
      for (const pattern of patterns) {
        if (pattern.test(input)) {
          confidence += 0.4;
          break;
        }
      }

      // 检查关键词匹配
      const keywords = this.intentKeywords.get(intentType) || [];
      let keywordMatches = 0;
      for (const keyword of keywords) {
        if (lowerInput.includes(keyword.toLowerCase())) {
          keywordMatches++;
        }
      }
      
      if (keywordMatches > 0) {
        confidence += (keywordMatches / keywords.length) * 0.6;
      }

      // 如果置信度足够高，添加到候选意图中
      if (confidence > 0.3) {
        intents.push({
          type: intentType,
          confidence: Math.min(confidence, 1.0),
          parameters,
          rawInput: input,
          timestamp: Date.now()
        });
      }
    }

    // 按置信度和优先级排序
    intents.sort((a, b) => {
      const priorityA = this.intentPriority.get(a.type) || 0;
      const priorityB = this.intentPriority.get(b.type) || 0;
      
      // 先按置信度排序，再按优先级排序
      if (Math.abs(a.confidence - b.confidence) > 0.1) {
        return b.confidence - a.confidence;
      }
      return priorityB - priorityA;
    });

    return intents;
  }

  /**
   * 获取最佳意图
   */
  getBestIntent(input: string): UserIntent | null {
    const intents = this.parseIntent(input);
    return intents.length > 0 ? intents[0] : null;
  }

  /**
   * 基于上下文优化意图识别
   */
  parseIntentWithContext(input: string, context: {
    previousIntents?: UserIntent[];
    currentState?: string;
    emotionState?: string;
    timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
  }): UserIntent[] {
    let intents = this.parseIntent(input);

    // 基于上下文调整置信度
    if (context.previousIntents && context.previousIntents.length > 0) {
      const lastIntent = context.previousIntents[context.previousIntents.length - 1];
      
      // 如果用户连续执行相同类型的操作，提高相关意图的置信度
      intents = intents.map(intent => {
        if (intent.type === lastIntent.type) {
          return {
            ...intent,
            confidence: Math.min(intent.confidence + 0.1, 1.0)
          };
        }
        return intent;
      });
    }

    // 基于当前状态调整
    if (context.currentState === 'awaken') {
      // 在唤醒状态下，工具类意图优先级更高
      const toolIntents = ['screenshot', 'copy', 'note', 'cast'];
      intents = intents.map(intent => {
        if (toolIntents.includes(intent.type)) {
          return {
            ...intent,
            confidence: Math.min(intent.confidence + 0.15, 1.0)
          };
        }
        return intent;
      });
    }

    // 基于情绪状态调整
    if (context.emotionState === 'sleepy' && context.timeOfDay === 'night') {
      // 夜晚困倦状态下，降低高活跃度操作的优先级
      const activeIntents = ['screenshot', 'cast'];
      intents = intents.map(intent => {
        if (activeIntents.includes(intent.type)) {
          return {
            ...intent,
            confidence: Math.max(intent.confidence - 0.2, 0)
          };
        }
        return intent;
      });
    }

    // 重新排序
    return intents.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * 提取意图参数
   */
  extractParameters(intent: UserIntent): Record<string, any> {
    const { type, rawInput } = intent;
    const parameters: Record<string, any> = {};

    switch (type) {
      case 'screenshot':
        // 提取截图相关参数
        if (/全屏|full.*screen/i.test(rawInput)) {
          parameters.mode = 'fullscreen';
        } else if (/区域|area|part/i.test(rawInput)) {
          parameters.mode = 'area';
        } else if (/窗口|window/i.test(rawInput)) {
          parameters.mode = 'window';
        }
        break;

      case 'note':
        // 提取记录内容
        const noteMatch = rawInput.match(/记录[：:]?\s*(.+)/i);
        if (noteMatch) {
          parameters.content = noteMatch[1].trim();
        }
        break;

      case 'chat':
        // 提取对话主题
        const chatMatch = rawInput.match(/关于\s*(.+)|about\s+(.+)/i);
        if (chatMatch) {
          parameters.topic = (chatMatch[1] || chatMatch[2]).trim();
        }
        break;

      case 'emotion':
        // 提取情绪类型
        if (/开心|高兴|happy|excited/i.test(rawInput)) {
          parameters.emotionType = 'happy';
        } else if (/难过|伤心|sad|upset/i.test(rawInput)) {
          parameters.emotionType = 'sad';
        } else if (/生气|愤怒|angry|mad/i.test(rawInput)) {
          parameters.emotionType = 'angry';
        } else if (/累了|疲惫|tired|sleepy/i.test(rawInput)) {
          parameters.emotionType = 'tired';
        }
        break;
    }

    return { ...intent.parameters, ...parameters };
  }

  /**
   * 获取支持的意图类型
   */
  getSupportedIntents(): string[] {
    return Array.from(this.intentPatterns.keys());
  }
}
