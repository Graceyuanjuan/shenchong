/**
 * 策略配置面板组件
 * 用于配置和管理神宠行为策略的UI组件
 */

import React, { useState, useEffect } from 'react';
import { useStrategyConfigStore } from './store/strategyConfigStore';

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

interface StrategyConfigPanelProps {
  className?: string;
  onStrategyChange?: (strategies: StrategyConfig[]) => void;
}

export const StrategyConfigPanel: React.FC<StrategyConfigPanelProps> = ({
  className = '',
  onStrategyChange
}) => {
  const {
    strategies,
    selectedStrategy,
    addStrategy,
    updateStrategy,
    removeStrategy,
    selectStrategy,
    loadStrategies,
    saveStrategies
  } = useStrategyConfigStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editingStrategy, setEditingStrategy] = useState<StrategyConfig | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    loadStrategies();
  }, [loadStrategies]);

  useEffect(() => {
    if (onStrategyChange) {
      onStrategyChange(strategies);
    }
  }, [strategies, onStrategyChange]);

  const validateStrategy = (strategy: StrategyConfig): string[] => {
    const errors: string[] = [];
    
    if (!strategy.name || strategy.name.trim() === '') {
      errors.push('Strategy name is required');
    }
    
    if (!strategy.description || strategy.description.trim() === '') {
      errors.push('Strategy description is required');
    }
    
    if (strategy.priority < 0 || strategy.priority > 100) {
      errors.push('Priority must be between 0 and 100');
    }
    
    if (strategy.actions.length === 0) {
      errors.push('At least one action is required');
    }
    
    strategy.actions.forEach((action, index) => {
      if (!action.behaviorName || action.behaviorName.trim() === '') {
        errors.push(`Action ${index + 1}: Behavior name is required`);
      }
      if (action.weight < 0 || action.weight > 10) {
        errors.push(`Action ${index + 1}: Weight must be between 0 and 10`);
      }
    });
    
    return errors;
  };

  const handleCreateNew = () => {
    const newStrategy: StrategyConfig = {
      id: `strategy_${Date.now()}`,
      name: 'New Strategy',
      description: 'A new behavior strategy',
      enabled: true,
      priority: 50,
      conditions: {},
      actions: []
    };
    setEditingStrategy(newStrategy);
    setIsEditing(true);
  };

  const handleEdit = (strategy: StrategyConfig) => {
    setEditingStrategy({ ...strategy });
    setIsEditing(true);
    setValidationErrors([]);
  };

  const handleSave = () => {
    if (!editingStrategy) return;

    // 验证策略
    const errors = validateStrategy(editingStrategy);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);

    if (strategies.find(s => s.id === editingStrategy.id)) {
      updateStrategy(editingStrategy.id, editingStrategy);
    } else {
      addStrategy(editingStrategy);
    }

    setIsEditing(false);
    setEditingStrategy(null);
    saveStrategies();
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingStrategy(null);
    setValidationErrors([]);
  };

  const handleDelete = (strategyId: string) => {
    if (window.confirm('Are you sure you want to delete this strategy?')) {
      removeStrategy(strategyId);
      saveStrategies();
    }
  };

  const handleToggleEnabled = (strategyId: string) => {
    const strategy = strategies.find(s => s.id === strategyId);
    if (strategy) {
      updateStrategy(strategyId, { ...strategy, enabled: !strategy.enabled });
      saveStrategies();
    }
  };

  const addAction = () => {
    if (!editingStrategy) return;
    
    const newAction = {
      behaviorName: '',
      parameters: {},
      weight: 1.0
    };
    
    setEditingStrategy({
      ...editingStrategy,
      actions: [...editingStrategy.actions, newAction]
    });
  };

  const updateAction = (index: number, action: any) => {
    if (!editingStrategy) return;
    
    const newActions = [...editingStrategy.actions];
    newActions[index] = action;
    
    setEditingStrategy({
      ...editingStrategy,
      actions: newActions
    });
  };

  const removeAction = (index: number) => {
    if (!editingStrategy) return;
    
    const newActions = editingStrategy.actions.filter((_, i) => i !== index);
    setEditingStrategy({
      ...editingStrategy,
      actions: newActions
    });
  };

  if (isEditing && editingStrategy) {
    return (
      <div className={`strategy-config-panel editing ${className}`} style={{ 
        padding: '20px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '8px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <h3>Edit Strategy</h3>
          <button 
            onClick={handleSave}
            style={{
              marginRight: '10px',
              padding: '8px 16px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Save
          </button>
          <button 
            onClick={handleCancel}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>

        {validationErrors.length > 0 && (
          <div style={{ 
            backgroundColor: '#f8d7da', 
            color: '#721c24', 
            padding: '12px', 
            borderRadius: '4px', 
            marginBottom: '16px',
            border: '1px solid #f5c6cb'
          }}>
            <strong>Validation Errors:</strong>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '6px', marginBottom: '16px' }}>
          <h4>Basic Information</h4>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Name:</label>
            <input
              type="text"
              value={editingStrategy.name}
              onChange={(e) => setEditingStrategy({ ...editingStrategy, name: e.target.value })}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Description:</label>
            <textarea
              value={editingStrategy.description}
              onChange={(e) => setEditingStrategy({ ...editingStrategy, description: e.target.value })}
              rows={3}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                resize: 'vertical'
              }}
            />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Priority:</label>
            <input
              type="number"
              min="0"
              max="100"
              value={editingStrategy.priority}
              onChange={(e) => setEditingStrategy({ ...editingStrategy, priority: parseInt(e.target.value) || 0 })}
              style={{
                width: '100px',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            />
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '6px', marginBottom: '16px' }}>
          <h4>Conditions</h4>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Required Emotion:</label>
            <select
              value={editingStrategy.conditions.emotion || ''}
              onChange={(e) => setEditingStrategy({
                ...editingStrategy,
                conditions: { ...editingStrategy.conditions, emotion: e.target.value || undefined }
              })}
              style={{
                width: '200px',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            >
              <option value="">Any</option>
              <option value="happy">Happy</option>
              <option value="sad">Sad</option>
              <option value="excited">Excited</option>
              <option value="calm">Calm</option>
              <option value="sleepy">Sleepy</option>
              <option value="lonely">Lonely</option>
            </select>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Required State:</label>
            <select
              value={editingStrategy.conditions.state || ''}
              onChange={(e) => setEditingStrategy({
                ...editingStrategy,
                conditions: { ...editingStrategy.conditions, state: e.target.value || undefined }
              })}
              style={{
                width: '200px',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            >
              <option value="">Any</option>
              <option value="idle">Idle</option>
              <option value="active">Active</option>
              <option value="resting">Resting</option>
              <option value="interacting">Interacting</option>
            </select>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h4>Actions</h4>
            <button 
              onClick={addAction}
              style={{
                padding: '6px 12px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Add Action
            </button>
          </div>
          {editingStrategy.actions.map((action, index) => (
            <div key={index} style={{ 
              border: '1px solid #ddd', 
              borderRadius: '4px', 
              padding: '12px', 
              marginBottom: '8px',
              backgroundColor: '#f8f9fa'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span>Action {index + 1}</span>
                <button 
                  onClick={() => removeAction(index)}
                  style={{
                    padding: '4px 8px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Remove
                </button>
              </div>
              <div style={{ marginBottom: '8px' }}>
                <label htmlFor={`behavior-name-${index}`} style={{ display: 'block', marginBottom: '4px' }}>Behavior Name:</label>
                <input
                  id={`behavior-name-${index}`}
                  type="text"
                  value={action.behaviorName}
                  onChange={(e) => updateAction(index, { ...action, behaviorName: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '6px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>
              <div>
                <label htmlFor={`weight-${index}`} style={{ display: 'block', marginBottom: '4px' }}>Weight:</label>
                <input
                  id={`weight-${index}`}
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={action.weight}
                  onChange={(e) => updateAction(index, { ...action, weight: parseFloat(e.target.value) || 0 })}
                  style={{
                    width: '100px',
                    padding: '6px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`strategy-config-panel ${className}`} style={{ 
      padding: '20px', 
      backgroundColor: '#f8f9fa', 
      borderRadius: '8px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>Strategy Configuration</h3>
        <button 
          onClick={handleCreateNew}
          style={{
            padding: '8px 16px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Create New Strategy
        </button>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '6px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Name</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Description</th>
              <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>Priority</th>
              <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>Enabled</th>
              <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {strategies.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                  No strategies configured. Create your first strategy to get started.
                </td>
              </tr>
            ) : (
              strategies.map((strategy) => (
                <tr 
                  key={strategy.id}
                  style={{ 
                    backgroundColor: selectedStrategy?.id === strategy.id ? '#e3f2fd' : 'white',
                    cursor: 'pointer'
                  }}
                  onClick={() => selectStrategy(strategy.id)}
                >
                  <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                    <div style={{ fontWeight: 'bold' }}>{strategy.name}</div>
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                    <div style={{ fontSize: '14px', color: '#666' }}>{strategy.description}</div>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #eee' }}>
                    {strategy.priority}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #eee' }}>
                    <input
                      type="checkbox"
                      checked={strategy.enabled}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleToggleEnabled(strategy.id);
                      }}
                    />
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #eee' }}>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(strategy);
                      }}
                      style={{
                        marginRight: '8px',
                        padding: '4px 8px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(strategy.id);
                      }}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
