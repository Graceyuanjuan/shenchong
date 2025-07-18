import React from 'react'
import ReactDOM from 'react-dom/client'

// 简单测试组件
function TestApp() {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1>🎯 SaintGrid Pet System 测试</h1>
        <p>如果你看到这个页面，说明基础渲染正常</p>
        <div style={{ marginTop: '20px' }}>
          <button 
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#ff6b6b',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
            onClick={() => alert('测试按钮工作正常！')}
          >
            点击测试
          </button>
        </div>
      </div>
    </div>
  )
}

console.log('🌐 Simple Test App Starting...');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TestApp />
  </React.StrictMode>,
)

console.log('✅ Simple Test App Rendered');
