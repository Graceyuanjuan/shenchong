/**
 * 策略条件编辑器组件
 */

import React from 'react';

interface StrategyConditions {
  emotion?: string;
  state?: string;
  timeRange?: {
    start: number;
    end: number;
  };
}

interface StrategyConditionEditorProps {
  conditions: StrategyConditions;
  onChange: (conditions: StrategyConditions) => void;
  className?: string;
}

const EMOTION_OPTIONS = [
  { value: '', label: 'Any Emotion' },
  { value: 'happy', label: 'Happy' },
  { value: 'sad', label: 'Sad' },
  { value: 'excited', label: 'Excited' },
  { value: 'calm', label: 'Calm' },
  { value: 'sleepy', label: 'Sleepy' },
  { value: 'lonely', label: 'Lonely' },
  { value: 'curious', label: 'Curious' },
  { value: 'playful', label: 'Playful' }
];

const STATE_OPTIONS = [
  { value: '', label: 'Any State' },
  { value: 'idle', label: 'Idle' },
  { value: 'active', label: 'Active' },
  { value: 'resting', label: 'Resting' },
  { value: 'interacting', label: 'Interacting' },
  { value: 'moving', label: 'Moving' },
  { value: 'sleeping', label: 'Sleeping' }
];

export const StrategyConditionEditor: React.FC<StrategyConditionEditorProps> = ({
  conditions,
  onChange,
  className = ''
}) => {
  const updateCondition = (key: keyof StrategyConditions, value: any) => {
    const newConditions = { ...conditions };
    if (value === '' || value === undefined) {
      delete newConditions[key];
    } else {
      newConditions[key] = value;
    }
    onChange(newConditions);
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const parseTime = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return (hours || 0) * 60 + (minutes || 0);
  };

  const toggleTimeRange = () => {
    if (conditions.timeRange) {
      updateCondition('timeRange', undefined);
    } else {
      updateCondition('timeRange', { start: 9 * 60, end: 17 * 60 }); // 9:00 AM to 5:00 PM
    }
  };

  const updateTimeRange = (field: 'start' | 'end', value: number) => {
    if (!conditions.timeRange) return;
    
    const newTimeRange = { ...conditions.timeRange, [field]: value };
    updateCondition('timeRange', newTimeRange);
  };

  return (
    <div className={`strategy-condition-editor ${className}`}>
      <h4>Activation Conditions</h4>
      <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '6px', border: '1px solid #ddd' }}>
        
        {/* Emotion Condition */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', fontSize: '14px' }}>
            Required Emotion:
          </label>
          <select
            value={conditions.emotion || ''}
            onChange={(e) => updateCondition('emotion', e.target.value || undefined)}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              backgroundColor: 'white'
            }}
          >
            {EMOTION_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
            Strategy will only activate when the pet has this emotion (or any emotion if not specified)
          </div>
        </div>

        {/* State Condition */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', fontSize: '14px' }}>
            Required State:
          </label>
          <select
            value={conditions.state || ''}
            onChange={(e) => updateCondition('state', e.target.value || undefined)}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              backgroundColor: 'white'
            }}
          >
            {STATE_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
            Strategy will only activate when the pet is in this state (or any state if not specified)
          </div>
        </div>

        {/* Time Range Condition */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <input
              type="checkbox"
              checked={!!conditions.timeRange}
              onChange={toggleTimeRange}
              style={{ marginRight: '8px' }}
            />
            <label style={{ fontWeight: 'bold', fontSize: '14px' }}>
              Time Range Restriction
            </label>
          </div>
          
          {conditions.timeRange && (
            <div style={{ backgroundColor: '#f8f9fa', padding: '12px', borderRadius: '4px', border: '1px solid #e9ecef' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Start Time:</label>
                  <input
                    type="time"
                    value={formatTime(conditions.timeRange.start)}
                    onChange={(e) => updateTimeRange('start', parseTime(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '6px',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>End Time:</label>
                  <input
                    type="time"
                    value={formatTime(conditions.timeRange.end)}
                    onChange={(e) => updateTimeRange('end', parseTime(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '6px',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  />
                </div>
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                Strategy will only be active during this time range each day
              </div>
            </div>
          )}
          
          {!conditions.timeRange && (
            <div style={{ fontSize: '12px', color: '#666' }}>
              Check the box above to restrict this strategy to specific times of day
            </div>
          )}
        </div>

        {/* Condition Summary */}
        <div style={{ 
          marginTop: '16px', 
          padding: '12px', 
          backgroundColor: '#e3f2fd', 
          borderRadius: '4px',
          border: '1px solid #bbdefb'
        }}>
          <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>
            Activation Summary:
          </div>
          <div style={{ fontSize: '13px', color: '#1976d2' }}>
            This strategy will activate when the pet is{' '}
            {conditions.emotion ? (
              <span style={{ fontWeight: 'bold' }}>{conditions.emotion}</span>
            ) : (
              'in any emotion'
            )}
            {' '}and{' '}
            {conditions.state ? (
              <span style={{ fontWeight: 'bold' }}>{conditions.state}</span>
            ) : (
              'in any state'
            )}
            {conditions.timeRange && (
              <>
                {' '}between{' '}
                <span style={{ fontWeight: 'bold' }}>
                  {formatTime(conditions.timeRange.start)} - {formatTime(conditions.timeRange.end)}
                </span>
              </>
            )}
            .
          </div>
        </div>
      </div>
    </div>
  );
};
