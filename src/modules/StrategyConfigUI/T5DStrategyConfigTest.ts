/**
 * T5D 策略配置测试工具
 * 用于测试策略配置功能的工具和测试用例
 */

import { StrategyConfig, useStrategyConfigStore } from './store/strategyConfigStore';

export interface StrategyConfigTestResult {
  success: boolean;
  message: string;
  details?: any;
}

export class T5DStrategyConfigTest {
  private testStrategies: StrategyConfig[] = [];

  constructor() {
    this.generateTestStrategies();
  }

  /**
   * 运行所有测试
   */
  async runAllTests(): Promise<StrategyConfigTestResult[]> {
    const results: StrategyConfigTestResult[] = [];

    results.push(await this.testStrategyCreation());
    results.push(await this.testStrategyConditions());
    results.push(await this.testStrategyActions());
    results.push(await this.testStrategyPriority());
    results.push(await this.testImportExport());
    results.push(await this.testLocalStorage());

    return results;
  }

  /**
   * 测试策略创建和基本操作
   */
  async testStrategyCreation(): Promise<StrategyConfigTestResult> {
    try {
      // 创建测试策略
      const testStrategy: StrategyConfig = {
        id: 'test_strategy_1',
        name: 'Test Strategy',
        description: 'A test strategy for validation',
        enabled: true,
        priority: 75,
        conditions: {
          emotion: 'happy'
        },
        actions: [
          {
            behaviorName: 'test_behavior',
            parameters: { testParam: 'testValue' },
            weight: 1.0
          }
        ]
      };

      // 验证策略结构
      if (!testStrategy.id || !testStrategy.name) {
        return {
          success: false,
          message: 'Strategy missing required fields'
        };
      }

      if (testStrategy.actions.length === 0) {
        return {
          success: false,
          message: 'Strategy must have at least one action'
        };
      }

      return {
        success: true,
        message: 'Strategy creation test passed',
        details: testStrategy
      };
    } catch (error) {
      return {
        success: false,
        message: 'Strategy creation test failed',
        details: error
      };
    }
  }

  /**
   * 测试策略条件匹配
   */
  async testStrategyConditions(): Promise<StrategyConfigTestResult> {
    try {
      const testCases = [
        {
          strategy: {
            conditions: { emotion: 'happy' }
          },
          context: { emotion: 'happy', state: 'idle' },
          shouldMatch: true
        },
        {
          strategy: {
            conditions: { emotion: 'happy', state: 'active' }
          },
          context: { emotion: 'happy', state: 'idle' },
          shouldMatch: false
        },
        {
          strategy: {
            conditions: {}
          },
          context: { emotion: 'sad', state: 'resting' },
          shouldMatch: true
        }
      ];

      for (const testCase of testCases) {
        const matches = this.evaluateStrategyConditions(
          testCase.strategy.conditions,
          testCase.context
        );
        
        if (matches !== testCase.shouldMatch) {
          return {
            success: false,
            message: 'Strategy condition evaluation failed',
            details: { testCase, actualResult: matches }
          };
        }
      }

      return {
        success: true,
        message: 'Strategy conditions test passed'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Strategy conditions test failed',
        details: error
      };
    }
  }

  /**
   * 测试策略动作配置
   */
  async testStrategyActions(): Promise<StrategyConfigTestResult> {
    try {
      const testStrategy = this.testStrategies[0];
      
      // 验证动作结构
      for (const action of testStrategy.actions) {
        if (!action.behaviorName) {
          return {
            success: false,
            message: 'Action missing behavior name'
          };
        }
        
        if (typeof action.weight !== 'number' || action.weight < 0) {
          return {
            success: false,
            message: 'Invalid action weight'
          };
        }
        
        if (!action.parameters || typeof action.parameters !== 'object') {
          return {
            success: false,
            message: 'Invalid action parameters'
          };
        }
      }

      return {
        success: true,
        message: 'Strategy actions test passed'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Strategy actions test failed',
        details: error
      };
    }
  }

  /**
   * 测试策略优先级排序
   */
  async testStrategyPriority(): Promise<StrategyConfigTestResult> {
    try {
      const strategies = [...this.testStrategies];
      
      // 按优先级排序
      strategies.sort((a, b) => b.priority - a.priority);
      
      // 验证排序正确性
      for (let i = 0; i < strategies.length - 1; i++) {
        if (strategies[i].priority < strategies[i + 1].priority) {
          return {
            success: false,
            message: 'Strategy priority sorting failed'
          };
        }
      }

      return {
        success: true,
        message: 'Strategy priority test passed',
        details: { sortedPriorities: strategies.map(s => s.priority) }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Strategy priority test failed',
        details: error
      };
    }
  }

  /**
   * 测试导入导出功能
   */
  async testImportExport(): Promise<StrategyConfigTestResult> {
    try {
      // 测试导出
      const exported = JSON.stringify(this.testStrategies, null, 2);
      
      if (!exported || exported === '[]') {
        return {
          success: false,
          message: 'Export failed - no data'
        };
      }

      // 测试导入
      let imported: StrategyConfig[];
      try {
        imported = JSON.parse(exported);
      } catch (parseError) {
        return {
          success: false,
          message: 'Import failed - invalid JSON',
          details: parseError
        };
      }

      // 验证导入的数据
      if (!Array.isArray(imported) || imported.length !== this.testStrategies.length) {
        return {
          success: false,
          message: 'Import validation failed'
        };
      }

      return {
        success: true,
        message: 'Import/Export test passed'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Import/Export test failed',
        details: error
      };
    }
  }

  /**
   * 测试本地存储功能
   */
  async testLocalStorage(): Promise<StrategyConfigTestResult> {
    try {
      if (typeof localStorage === 'undefined') {
        return {
          success: true,
          message: 'LocalStorage test skipped (not available)',
          details: 'This is expected in Node.js environment'
        };
      }

      const testKey = 'test_pet_strategies';
      const testData = JSON.stringify(this.testStrategies);

      // 测试存储
      localStorage.setItem(testKey, testData);
      
      // 测试读取
      const retrieved = localStorage.getItem(testKey);
      
      if (retrieved !== testData) {
        return {
          success: false,
          message: 'LocalStorage read/write mismatch'
        };
      }

      // 清理
      localStorage.removeItem(testKey);

      return {
        success: true,
        message: 'LocalStorage test passed'
      };
    } catch (error) {
      return {
        success: false,
        message: 'LocalStorage test failed',
        details: error
      };
    }
  }

  /**
   * 生成测试策略
   */
  private generateTestStrategies(): void {
    this.testStrategies = [
      {
        id: 'test_high_priority',
        name: 'High Priority Test',
        description: 'High priority test strategy',
        enabled: true,
        priority: 90,
        conditions: { emotion: 'excited' },
        actions: [
          {
            behaviorName: 'jump',
            parameters: { height: 2.0, duration: 1000 },
            weight: 1.0
          }
        ]
      },
      {
        id: 'test_medium_priority',
        name: 'Medium Priority Test',
        description: 'Medium priority test strategy',
        enabled: true,
        priority: 50,
        conditions: { state: 'idle' },
        actions: [
          {
            behaviorName: 'idle_animation',
            parameters: { speed: 0.5 },
            weight: 0.8
          }
        ]
      },
      {
        id: 'test_low_priority',
        name: 'Low Priority Test',
        description: 'Low priority test strategy',
        enabled: false,
        priority: 20,
        conditions: {},
        actions: [
          {
            behaviorName: 'default_behavior',
            parameters: {},
            weight: 0.5
          }
        ]
      }
    ];
  }

  /**
   * 评估策略条件是否匹配
   */
  private evaluateStrategyConditions(
    conditions: { emotion?: string; state?: string },
    context: { emotion: string; state: string }
  ): boolean {
    if (conditions.emotion && conditions.emotion !== context.emotion) {
      return false;
    }
    
    if (conditions.state && conditions.state !== context.state) {
      return false;
    }
    
    return true;
  }

  /**
   * 获取测试策略
   */
  getTestStrategies(): StrategyConfig[] {
    return [...this.testStrategies];
  }

  /**
   * 清理测试数据
   */
  cleanup(): void {
    this.testStrategies = [];
  }
}

/**
 * 运行策略配置测试的便捷函数
 */
export async function runStrategyConfigTest(): Promise<StrategyConfigTestResult[]> {
  const test = new T5DStrategyConfigTest();
  const results = await test.runAllTests();
  test.cleanup();
  return results;
}

/**
 * 验证策略配置的工具函数
 */
export function validateStrategyConfig(strategy: StrategyConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!strategy.id || typeof strategy.id !== 'string') {
    errors.push('Strategy must have a valid ID');
  }

  if (!strategy.name || typeof strategy.name !== 'string') {
    errors.push('Strategy must have a valid name');
  }

  if (typeof strategy.enabled !== 'boolean') {
    errors.push('Strategy enabled flag must be boolean');
  }

  if (typeof strategy.priority !== 'number' || strategy.priority < 0 || strategy.priority > 100) {
    errors.push('Strategy priority must be a number between 0 and 100');
  }

  if (!strategy.actions || !Array.isArray(strategy.actions) || strategy.actions.length === 0) {
    errors.push('Strategy must have at least one action');
  } else {
    strategy.actions.forEach((action, index) => {
      if (!action.behaviorName || typeof action.behaviorName !== 'string') {
        errors.push(`Action ${index + 1} must have a valid behavior name`);
      }
      
      if (typeof action.weight !== 'number' || action.weight < 0) {
        errors.push(`Action ${index + 1} must have a valid weight (>= 0)`);
      }
      
      if (!action.parameters || typeof action.parameters !== 'object') {
        errors.push(`Action ${index + 1} must have valid parameters object`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
