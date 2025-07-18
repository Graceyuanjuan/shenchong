/**
 * 策略配置状态管理
 * 使用简单的状态管理模式来管理策略配置
 */

import { useState, useCallback, useEffect } from 'react';

export interface StrategyConfig {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  priority: number;
  conditions: {
    emotion?: string;
    state?: string;
    timeRange?: {
      start: number;
      end: number;
    };
  };
  actions: {
    behaviorName: string;
    parameters: Record<string, any>;
    weight: number;
  }[];
}

// 简单的全局状态管理
let globalStrategies: StrategyConfig[] = [];
let globalSelectedStrategy: StrategyConfig | null = null;
const listeners: Array<() => void> = [];

const notifyListeners = () => {
  listeners.forEach(listener => listener());
};

const subscribe = (listener: () => void) => {
  listeners.push(listener);
  return () => {
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
};

// 存储管理函数
const saveToStorage = (strategies: StrategyConfig[]) => {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('pet_strategies', JSON.stringify(strategies));
    }
  } catch (error) {
    console.warn('Failed to save strategies to localStorage:', error);
  }
};

const loadFromStorage = (): StrategyConfig[] => {
  try {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('pet_strategies');
      if (stored) {
        return JSON.parse(stored);
      }
    }
  } catch (error) {
    console.warn('Failed to load strategies from localStorage:', error);
  }
  return getDefaultStrategies();
};

const getDefaultStrategies = (): StrategyConfig[] => {
  return [
    {
      id: 'default_happy_strategy',
      name: 'Happy Behaviors',
      description: 'Behaviors to perform when the pet is happy',
      enabled: true,
      priority: 80,
      conditions: {
        emotion: 'happy'
      },
      actions: [
        {
          behaviorName: 'bounce',
          parameters: { amplitude: 0.5, speed: 2 },
          weight: 1.0
        },
        {
          behaviorName: 'spin',
          parameters: { rotations: 2, duration: 1000 },
          weight: 0.8
        }
      ]
    },
    {
      id: 'default_idle_strategy',
      name: 'Idle Behaviors',
      description: 'Behaviors to perform during idle time',
      enabled: true,
      priority: 50,
      conditions: {
        state: 'idle'
      },
      actions: [
        {
          behaviorName: 'idle_blink',
          parameters: { frequency: 0.3 },
          weight: 1.0
        },
        {
          behaviorName: 'idle_sway',
          parameters: { amplitude: 0.1, speed: 0.5 },
          weight: 0.6
        }
      ]
    },
    {
      id: 'default_sleepy_strategy',
      name: 'Sleepy Behaviors',
      description: 'Behaviors to perform when the pet is sleepy',
      enabled: true,
      priority: 70,
      conditions: {
        emotion: 'sleepy'
      },
      actions: [
        {
          behaviorName: 'yawn',
          parameters: { duration: 2000 },
          weight: 1.0
        },
        {
          behaviorName: 'nod_off',
          parameters: { duration: 5000 },
          weight: 0.9
        }
      ]
    }
  ];
};

// 初始化全局状态
if (globalStrategies.length === 0) {
  globalStrategies = loadFromStorage();
}

/**
 * 策略配置状态管理 Hook
 */
export const useStrategyConfigStore = () => {
  const [strategies, setStrategies] = useState<StrategyConfig[]>(globalStrategies);
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyConfig | null>(globalSelectedStrategy);

  // 订阅全局状态变化
  useEffect(() => {
    const unsubscribe = subscribe(() => {
      setStrategies([...globalStrategies]);
      setSelectedStrategy(globalSelectedStrategy);
    });
    return unsubscribe;
  }, []);

  const addStrategy = useCallback((strategy: StrategyConfig) => {
    globalStrategies.push(strategy);
    notifyListeners();
  }, []);

  const updateStrategy = useCallback((id: string, updates: Partial<StrategyConfig>) => {
    const index = globalStrategies.findIndex(s => s.id === id);
    if (index > -1) {
      globalStrategies[index] = { ...globalStrategies[index], ...updates };
      notifyListeners();
    }
  }, []);

  const removeStrategy = useCallback((id: string) => {
    const index = globalStrategies.findIndex(s => s.id === id);
    if (index > -1) {
      globalStrategies.splice(index, 1);
      if (globalSelectedStrategy?.id === id) {
        globalSelectedStrategy = null;
      }
      notifyListeners();
    }
  }, []);

  const selectStrategy = useCallback((id: string) => {
    globalSelectedStrategy = globalStrategies.find(s => s.id === id) || null;
    notifyListeners();
  }, []);

  const clearSelection = useCallback(() => {
    globalSelectedStrategy = null;
    notifyListeners();
  }, []);

  const loadStrategies = useCallback(() => {
    globalStrategies = loadFromStorage();
    notifyListeners();
  }, []);

  const saveStrategies = useCallback(() => {
    saveToStorage(globalStrategies);
  }, []);

  const resetToDefaults = useCallback(() => {
    globalStrategies = getDefaultStrategies();
    globalSelectedStrategy = null;
    saveToStorage(globalStrategies);
    notifyListeners();
  }, []);

  const exportStrategies = useCallback(() => {
    return JSON.stringify(globalStrategies, null, 2);
  }, []);

  const importStrategies = useCallback((jsonData: string) => {
    try {
      const imported = JSON.parse(jsonData) as StrategyConfig[];
      if (Array.isArray(imported)) {
        globalStrategies = imported;
        globalSelectedStrategy = null;
        saveToStorage(globalStrategies);
        notifyListeners();
        return true;
      }
    } catch (error) {
      console.error('Failed to import strategies:', error);
    }
    return false;
  }, []);

  const getStrategyById = useCallback((id: string) => {
    return globalStrategies.find(s => s.id === id);
  }, []);

  const getEnabledStrategies = useCallback(() => {
    return globalStrategies.filter(s => s.enabled).sort((a, b) => b.priority - a.priority);
  }, []);

  const getStrategiesForCondition = useCallback((emotion?: string, state?: string) => {
    return globalStrategies.filter(strategy => {
      if (!strategy.enabled) return false;
      
      if (emotion && strategy.conditions.emotion && strategy.conditions.emotion !== emotion) {
        return false;
      }
      
      if (state && strategy.conditions.state && strategy.conditions.state !== state) {
        return false;
      }
      
      return true;
    }).sort((a, b) => b.priority - a.priority);
  }, []);

  return {
    strategies,
    selectedStrategy,
    addStrategy,
    updateStrategy,
    removeStrategy,
    selectStrategy,
    clearSelection,
    loadStrategies,
    saveStrategies,
    resetToDefaults,
    exportStrategies,
    importStrategies,
    getStrategyById,
    getEnabledStrategies,
    getStrategiesForCondition
  };
};