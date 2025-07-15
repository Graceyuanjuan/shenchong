/**
 * 策略预览卡片组件
 * 用于显示策略配置的预览信息
 */

import React from 'react';

interface StrategyAction {
  behaviorName: string;
  parameters: Record<string, any>;
  weight: number;
}

interface StrategyConfig {
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
  actions: StrategyAction[];
}

interface StrategyPreviewCardProps {
  strategy: StrategyConfig;
  className?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleEnabled?: () => void;
  isSelected?: boolean;
}

export const StrategyPreviewCard: React.FC<StrategyPreviewCardProps> = ({
  strategy,
  className = '',
  onEdit,
  onDelete,
  onToggleEnabled,
  isSelected = false
}) => {
  const getConditionsText = () => {
    const conditions: string[] = [];
    if (strategy.conditions.emotion) {
      conditions.push(`Emotion: ${strategy.conditions.emotion}`);
    }
    if (strategy.conditions.state) {
      conditions.push(`State: ${strategy.conditions.state}`);
    }
    if (strategy.conditions.timeRange) {
      conditions.push(`Time: ${strategy.conditions.timeRange.start}-${strategy.conditions.timeRange.end}`);
    }
    return conditions.length > 0 ? conditions.join(', ') : 'Any condition';
  };

  const cardStyle: React.CSSProperties = {
    border: `2px solid ${isSelected ? '#007bff' : '#ddd'}`,
    borderRadius: '8px',
    padding: '16px',
    backgroundColor: strategy.enabled ? 'white' : '#f8f9fa',
    boxShadow: isSelected ? '0 4px 8px rgba(0,123,255,0.2)' : '0 2px 4px rgba(0,0,0,0.1)',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    opacity: strategy.enabled ? 1 : 0.7
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  };

  const titleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: '18px',
    fontWeight: 'bold',
    color: strategy.enabled ? '#333' : '#666'
  };

  const priorityBadgeStyle: React.CSSProperties = {
    backgroundColor: strategy.priority >= 80 ? '#28a745' : 
                     strategy.priority >= 50 ? '#ffc107' : '#6c757d',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 'bold'
  };

  const descriptionStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#666',
    marginBottom: '12px',
    lineHeight: '1.4'
  };

  const conditionsStyle: React.CSSProperties = {
    fontSize: '13px',
    color: '#007bff',
    marginBottom: '12px',
    padding: '8px',
    backgroundColor: '#f0f8ff',
    borderRadius: '4px',
    border: '1px solid #e3f2fd'
  };

  const actionsStyle: React.CSSProperties = {
    marginBottom: '12px'
  };

  const actionItemStyle: React.CSSProperties = {
    display: 'inline-block',
    backgroundColor: '#e9ecef',
    padding: '4px 8px',
    margin: '2px',
    borderRadius: '12px',
    fontSize: '12px',
    color: '#495057'
  };

  const buttonGroupStyle: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
    justifyContent: 'flex-end'
  };

  const buttonStyle: React.CSSProperties = {
    padding: '6px 12px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 'bold'
  };

  const editButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#007bff',
    color: 'white'
  };

  const deleteButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#dc3545',
    color: 'white'
  };

  const toggleButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: strategy.enabled ? '#ffc107' : '#28a745',
    color: 'white'
  };

  return (
    <div className={className} style={cardStyle}>
      <div style={headerStyle}>
        <h4 style={titleStyle}>{strategy.name}</h4>
        <span style={priorityBadgeStyle}>Priority: {strategy.priority}</span>
      </div>
      
      <p style={descriptionStyle}>{strategy.description}</p>
      
      <div style={conditionsStyle}>
        <strong>Conditions:</strong> {getConditionsText()}
      </div>
      
      <div style={actionsStyle}>
        <strong style={{ fontSize: '13px', color: '#333' }}>Actions:</strong>
        <div style={{ marginTop: '4px' }}>
          {strategy.actions.length === 0 ? (
            <span style={{ fontSize: '12px', color: '#999', fontStyle: 'italic' }}>
              No actions defined
            </span>
          ) : (
            strategy.actions.map((action, index) => (
              <span key={index} style={actionItemStyle}>
                {action.behaviorName} (w: {action.weight})
              </span>
            ))
          )}
        </div>
      </div>
      
      <div style={buttonGroupStyle}>
        {onToggleEnabled && (
          <button
            style={toggleButtonStyle}
            onClick={(e) => {
              e.stopPropagation();
              onToggleEnabled();
            }}
          >
            {strategy.enabled ? 'Disable' : 'Enable'}
          </button>
        )}
        {onEdit && (
          <button
            style={editButtonStyle}
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            Edit
          </button>
        )}
        {onDelete && (
          <button
            style={deleteButtonStyle}
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};
