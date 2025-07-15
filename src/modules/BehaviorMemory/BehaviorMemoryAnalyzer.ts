/**
 * 行为记忆分析器
 * 负责分析行为记录并生成报告和模式识别
 */

import { BehaviorRecord, BehaviorPattern } from './types';
import { BehaviorMemory } from './BehaviorMemory';

export interface AnalysisReport {
  totalRecords: number;
  uniqueBehaviors: number;
  mostFrequentBehavior: string;
  averageExecutionTime: number;
  successRate: number;
  patterns: BehaviorPattern[];
  recommendations: string[];
}

export class BehaviorMemoryAnalyzer {
  private memory: BehaviorMemory;

  constructor(memory?: BehaviorMemory) {
    this.memory = memory || BehaviorMemory.getInstance();
  }

  /**
   * 生成分析报告
   */
  generateReport(): AnalysisReport {
    const records = this.memory.getAllRecords();
    
    if (records.length === 0) {
      return {
        totalRecords: 0,
        uniqueBehaviors: 0,
        mostFrequentBehavior: '',
        averageExecutionTime: 0,
        successRate: 0,
        patterns: [],
        recommendations: ['No behavior data available']
      };
    }

    const behaviorCounts = this.countBehaviors(records);
    const mostFrequent = this.getMostFrequentBehavior(behaviorCounts);
    const successRate = this.calculateSuccessRate(records);
    const patterns = this.identifyPatterns(records);
    const recommendations = this.generateRecommendations(records, patterns);

    return {
      totalRecords: records.length,
      uniqueBehaviors: Object.keys(behaviorCounts).length,
      mostFrequentBehavior: mostFrequent,
      averageExecutionTime: this.calculateAverageExecutionTime(records),
      successRate,
      patterns,
      recommendations
    };
  }

  /**
   * 识别行为模式
   */
  identifyPatterns(records: BehaviorRecord[]): BehaviorPattern[] {
    const patterns: BehaviorPattern[] = [];
    
    // 分析情绪-行为模式
    const emotionBehaviorMap = this.groupByEmotion(records);
    for (const [emotion, behaviorRecords] of emotionBehaviorMap) {
      const behaviorCounts = this.countBehaviors(behaviorRecords);
      const totalCount = behaviorRecords.length;
      
      for (const [behavior, count] of Object.entries(behaviorCounts)) {
        const frequency = count / totalCount;
        if (frequency > 0.3) { // 如果某个行为在特定情绪下出现频率超过30%
          patterns.push({
            id: `emotion_${emotion}_${behavior}`,
            patternType: 'emotion-behavior',
            frequency,
            confidence: this.calculateConfidence(frequency, count),
            conditions: { emotion },
            outcomes: { [behavior]: count }
          });
        }
      }
    }

    // 分析时间模式
    const timePatterns = this.analyzeTimePatterns(records);
    patterns.push(...timePatterns);

    return patterns;
  }

  private countBehaviors(records: BehaviorRecord[]): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const record of records) {
      counts[record.behaviorName] = (counts[record.behaviorName] || 0) + 1;
    }
    return counts;
  }

  private getMostFrequentBehavior(behaviorCounts: Record<string, number>): string {
    let maxCount = 0;
    let mostFrequent = '';
    
    for (const [behavior, count] of Object.entries(behaviorCounts)) {
      if (count > maxCount) {
        maxCount = count;
        mostFrequent = behavior;
      }
    }
    
    return mostFrequent;
  }

  private calculateSuccessRate(records: BehaviorRecord[]): number {
    const successCount = records.filter(r => r.outcome === 'success').length;
    return records.length > 0 ? successCount / records.length : 0;
  }

  private calculateAverageExecutionTime(records: BehaviorRecord[]): number {
    if (records.length === 0) return 0;
    
    const times = records.map(r => r.metadata?.executionTime || 0);
    const total = times.reduce((sum, time) => sum + time, 0);
    return total / records.length;
  }

  private groupByEmotion(records: BehaviorRecord[]): Map<string, BehaviorRecord[]> {
    const groups = new Map<string, BehaviorRecord[]>();
    
    for (const record of records) {
      const emotion = record.emotion;
      if (!groups.has(emotion)) {
        groups.set(emotion, []);
      }
      groups.get(emotion)!.push(record);
    }
    
    return groups;
  }

  private analyzeTimePatterns(records: BehaviorRecord[]): BehaviorPattern[] {
    // 这里可以添加时间模式分析逻辑
    // 例如：分析一天中不同时间段的行为偏好
    return [];
  }

  private calculateConfidence(frequency: number, sampleSize: number): number {
    // 简单的置信度计算，基于频率和样本大小
    const baseConfidence = frequency;
    const sampleBonus = Math.min(sampleSize / 100, 0.2); // 样本大小加成，最多20%
    return Math.min(baseConfidence + sampleBonus, 1.0);
  }

  private generateRecommendations(records: BehaviorRecord[], patterns: BehaviorPattern[]): string[] {
    const recommendations: string[] = [];
    
    if (records.length < 10) {
      recommendations.push('Collect more behavior data for better analysis');
    }
    
    const successRate = this.calculateSuccessRate(records);
    if (successRate < 0.8) {
      recommendations.push('Consider reviewing behavior execution logic to improve success rate');
    }
    
    if (patterns.length === 0) {
      recommendations.push('No clear patterns detected. Consider diversifying behavior strategies');
    } else {
      recommendations.push(`Detected ${patterns.length} behavioral patterns. Consider leveraging these for optimization`);
    }
    
    return recommendations;
  }
}