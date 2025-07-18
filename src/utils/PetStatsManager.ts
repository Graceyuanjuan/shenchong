// 内部状态管理器 - 仅用于后台统计，不展示给用户

export interface PetStats {
  currentState: string;
  emotion: string;
  interactionCount: number;
  lastInteractionTime: number;
  dailyStats: {
    hoverCount: number;
    clickCount: number;
    rightClickCount: number;
    activeTime: number; // 活跃时间（毫秒）
  };
  weeklyTrends: {
    averageInteractions: number;
    mostActiveTime: string;
    preferredActions: string[];
  };
}

class PetStatsManager {
  private stats: PetStats = {
    currentState: '静碗',
    emotion: '平静',
    interactionCount: 0,
    lastInteractionTime: Date.now(),
    dailyStats: {
      hoverCount: 0,
      clickCount: 0,
      rightClickCount: 0,
      activeTime: 0
    },
    weeklyTrends: {
      averageInteractions: 0,
      mostActiveTime: '未知',
      preferredActions: []
    }
  };

  // 更新当前状态
  updateState(state: string, emotion: string = '平静') {
    this.stats.currentState = state;
    this.stats.emotion = emotion;
    this.stats.lastInteractionTime = Date.now();
  }

  // 记录交互事件
  recordInteraction(type: 'hover' | 'click' | 'rightClick') {
    this.stats.interactionCount++;
    this.stats.lastInteractionTime = Date.now();
    
    switch (type) {
      case 'hover':
        this.stats.dailyStats.hoverCount++;
        break;
      case 'click':
        this.stats.dailyStats.clickCount++;
        break;
      case 'rightClick':
        this.stats.dailyStats.rightClickCount++;
        break;
    }

    // 更新情绪状态
    this.updateEmotionBasedOnActivity();
  }

  // 基于活动更新情绪
  private updateEmotionBasedOnActivity() {
    const total = this.stats.dailyStats.hoverCount + 
                  this.stats.dailyStats.clickCount + 
                  this.stats.dailyStats.rightClickCount;
    
    if (total === 0) {
      this.stats.emotion = '平静';
    } else if (total < 5) {
      this.stats.emotion = '好奇';
    } else if (total < 15) {
      this.stats.emotion = '愉快';
    } else {
      this.stats.emotion = '兴奋';
    }
  }

  // 获取统计数据（仅供内部使用）
  getStats(): PetStats {
    return { ...this.stats };
  }

  // 获取简要状态报告（用于开发调试）
  getStatusReport(): string {
    return `状态: ${this.stats.currentState} | 情绪: ${this.stats.emotion} | 交互次数: ${this.stats.interactionCount}`;
  }

  // 重置日常统计
  resetDailyStats() {
    this.stats.dailyStats = {
      hoverCount: 0,
      clickCount: 0,
      rightClickCount: 0,
      activeTime: 0
    };
  }

  // 导出统计数据到JSON（用于数据分析）
  exportStatsToJSON(): string {
    return JSON.stringify(this.stats, null, 2);
  }
}

// 全局唯一实例
export const petStatsManager = new PetStatsManager();

// 仅在开发模式下提供调试接口
if (process.env.NODE_ENV === 'development') {
  (window as any).petStatsManager = petStatsManager;
  console.log('🐾 PetStatsManager已加载 - 开发模式下可通过 window.petStatsManager 访问统计数据');
}
