/**
 * 策略导入导出组件
 */

import React, { useState } from 'react';
import { useStrategyConfigStore } from '../store/strategyConfigStore';

interface StrategyImportExportProps {
  className?: string;
}

export const StrategyImportExport: React.FC<StrategyImportExportProps> = ({
  className = ''
}) => {
  const {
    exportStrategies,
    importStrategies,
    resetToDefaults
  } = useStrategyConfigStore();

  const [importText, setImportText] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [exportText, setExportText] = useState('');
  const [message, setMessage] = useState('');

  const handleExport = () => {
    const exported = exportStrategies();
    setExportText(exported);
    setShowExport(true);
    setShowImport(false);
  };

  const handleImport = () => {
    if (!importText.trim()) {
      setMessage('Please enter strategy data to import');
      return;
    }

    const success = importStrategies(importText);
    if (success) {
      setMessage('Strategies imported successfully!');
      setImportText('');
      setShowImport(false);
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } else {
      setMessage('Failed to import strategies. Please check the data format.');
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset to default strategies? This will remove all custom strategies.')) {
      resetToDefaults();
      setMessage('Strategies reset to defaults');
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(exportText);
      setMessage('Copied to clipboard!');
      setTimeout(() => setMessage(''), 2000);
    } catch (error) {
      setMessage('Failed to copy to clipboard');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const downloadAsFile = () => {
    const blob = new Blob([exportText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pet-strategies-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setMessage('Strategy file downloaded!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setImportText(content);
    };
    reader.readAsText(file);
  };

  return (
    <div className={`strategy-import-export ${className}`}>
      <h4>Import / Export Strategies</h4>
      
      {message && (
        <div style={{
          padding: '8px 12px',
          marginBottom: '12px',
          backgroundColor: message.includes('Failed') || message.includes('error') ? '#f8d7da' : '#d1edff',
          color: message.includes('Failed') || message.includes('error') ? '#721c24' : '#0c5460',
          borderRadius: '4px',
          border: `1px solid ${message.includes('Failed') || message.includes('error') ? '#f5c6cb' : '#bee5eb'}`
        }}>
          {message}
        </div>
      )}

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
        gap: '8px', 
        marginBottom: '16px' 
      }}>
        <button 
          onClick={handleExport}
          style={{
            padding: '8px 12px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Export Strategies
        </button>
        
        <button 
          onClick={() => { setShowImport(!showImport); setShowExport(false); }}
          style={{
            padding: '8px 12px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Import Strategies
        </button>
        
        <button 
          onClick={handleReset}
          style={{
            padding: '8px 12px',
            backgroundColor: '#ffc107',
            color: '#212529',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Reset to Defaults
        </button>
      </div>

      {/* Export Panel */}
      {showExport && (
        <div style={{ 
          backgroundColor: 'white', 
          padding: '16px', 
          borderRadius: '6px', 
          border: '1px solid #ddd',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h5 style={{ margin: 0 }}>Exported Strategy Data</h5>
            <div>
              <button 
                onClick={copyToClipboard}
                style={{
                  marginRight: '8px',
                  padding: '6px 12px',
                  backgroundColor: '#17a2b8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Copy to Clipboard
              </button>
              <button 
                onClick={downloadAsFile}
                style={{
                  marginRight: '8px',
                  padding: '6px 12px',
                  backgroundColor: '#6f42c1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Download File
              </button>
              <button 
                onClick={() => setShowExport(false)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Close
              </button>
            </div>
          </div>
          
          <textarea
            value={exportText}
            readOnly
            rows={10}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '12px',
              backgroundColor: '#f8f9fa'
            }}
          />
          
          <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
            Copy this data to backup your strategies or share them with others.
          </div>
        </div>
      )}

      {/* Import Panel */}
      {showImport && (
        <div style={{ 
          backgroundColor: 'white', 
          padding: '16px', 
          borderRadius: '6px', 
          border: '1px solid #ddd',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h5 style={{ margin: 0 }}>Import Strategy Data</h5>
            <button 
              onClick={() => setShowImport(false)}
              style={{
                padding: '6px 12px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Close
            </button>
          </div>
          
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              Upload from file:
            </label>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              Or paste strategy data:
            </label>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              rows={8}
              placeholder="Paste exported strategy JSON data here..."
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '12px'
              }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={handleImport}
              style={{
                padding: '8px 16px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Import Strategies
            </button>
            <button 
              onClick={() => setImportText('')}
              style={{
                padding: '8px 16px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Clear
            </button>
          </div>
          
          <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
            <strong>Warning:</strong> Importing will replace all current strategies. Make sure to export your current strategies first if you want to keep them.
          </div>
        </div>
      )}
    </div>
  );
};
