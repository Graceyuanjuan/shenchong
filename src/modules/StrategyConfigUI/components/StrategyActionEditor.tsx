/**
 * 策略动作编辑器组件
 */

import React from 'react';

interface StrategyAction {
  behaviorName: string;
  parameters: Record<string, any>;
  weight: number;
}

interface StrategyActionEditorProps {
  actions: StrategyAction[];
  onChange: (actions: StrategyAction[]) => void;
  className?: string;
}

export const StrategyActionEditor: React.FC<StrategyActionEditorProps> = ({
  actions,
  onChange,
  className = ''
}) => {
  const addAction = () => {
    const newAction: StrategyAction = {
      behaviorName: '',
      parameters: {},
      weight: 1.0
    };
    onChange([...actions, newAction]);
  };

  const updateAction = (index: number, action: StrategyAction) => {
    const newActions = [...actions];
    newActions[index] = action;
    onChange(newActions);
  };

  const removeAction = (index: number) => {
    const newActions = actions.filter((_, i) => i !== index);
    onChange(newActions);
  };

  const updateParameters = (index: number, paramKey: string, paramValue: any) => {
    const action = actions[index];
    const newParameters = { ...action.parameters, [paramKey]: paramValue };
    updateAction(index, { ...action, parameters: newParameters });
  };

  const removeParameter = (index: number, paramKey: string) => {
    const action = actions[index];
    const newParameters = { ...action.parameters };
    delete newParameters[paramKey];
    updateAction(index, { ...action, parameters: newParameters });
  };

  const addParameter = (index: number) => {
    const key = prompt('Parameter name:');
    if (key && key.trim()) {
      updateParameters(index, key.trim(), '');
    }
  };

  return (
    <div className={`strategy-action-editor ${className}`}>
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
      
      {actions.map((action, index) => (
        <div key={index} style={{ 
          border: '1px solid #ddd', 
          borderRadius: '4px', 
          padding: '12px', 
          marginBottom: '8px',
          backgroundColor: '#f8f9fa'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontWeight: 'bold' }}>Action {index + 1}</span>
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
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: '8px', marginBottom: '8px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Behavior Name:</label>
              <input
                type="text"
                value={action.behaviorName}
                onChange={(e) => updateAction(index, { ...action, behaviorName: e.target.value })}
                placeholder="e.g., bounce, spin, blink"
                style={{
                  width: '100%',
                  padding: '6px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Weight:</label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={action.weight}
                onChange={(e) => updateAction(index, { ...action, weight: parseFloat(e.target.value) || 0 })}
                style={{
                  width: '100%',
                  padding: '6px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Parameters:</label>
              <button 
                onClick={() => addParameter(index)}
                style={{
                  padding: '4px 8px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Add Parameter
              </button>
            </div>
            
            {Object.entries(action.parameters).length === 0 ? (
              <div style={{ padding: '8px', backgroundColor: 'white', borderRadius: '4px', color: '#666', fontSize: '14px' }}>
                No parameters configured
              </div>
            ) : (
              <div style={{ backgroundColor: 'white', borderRadius: '4px', padding: '8px' }}>
                {Object.entries(action.parameters).map(([key, value]) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ minWidth: '80px', fontSize: '14px' }}>{key}:</span>
                    <input
                      type="text"
                      value={typeof value === 'string' ? value : JSON.stringify(value)}
                      onChange={(e) => {
                        let newValue: any = e.target.value;
                        // Try to parse as number or boolean
                        if (!isNaN(Number(newValue)) && newValue !== '') {
                          newValue = Number(newValue);
                        } else if (newValue === 'true') {
                          newValue = true;
                        } else if (newValue === 'false') {
                          newValue = false;
                        }
                        updateParameters(index, key, newValue);
                      }}
                      style={{
                        flex: 1,
                        padding: '4px 6px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        marginLeft: '8px',
                        marginRight: '8px',
                        fontSize: '14px'
                      }}
                    />
                    <button 
                      onClick={() => removeParameter(index, key)}
                      style={{
                        padding: '2px 6px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
      
      {actions.length === 0 && (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center', 
          color: '#666',
          backgroundColor: 'white',
          borderRadius: '4px',
          border: '1px dashed #ddd'
        }}>
          No actions configured. Click "Add Action" to create your first action.
        </div>
      )}
    </div>
  );
};
