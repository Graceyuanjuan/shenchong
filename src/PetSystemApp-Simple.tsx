import React, { useState, useCallback } from 'react';
import { PetState, EmotionType } from './types';
import CircularBowlUI from './components/CircularBowlUI';

interface PetSystemAppState {
  currentState: PetState;
  currentEmotion: EmotionType;
  interactionCount: number;
}

const PetSystemApp: React.FC = () => {
  const [appState, setAppState] = useState<PetSystemAppState>({
    currentState: PetState.Idle,
    currentEmotion: EmotionType.Calm,
    interactionCount: 0
  });

  // 处理碗点击 - 四碗交互功能
  const handleBowlClick = useCallback(async (state: PetState, emotion: EmotionType) => {
    console.log(`[🍚 BOWL CLICK] 状态切换至: ${state}, 情绪切换至: ${emotion}`);
    
    // 更新状态和情绪
    setAppState(prev => ({
      ...prev,
      currentState: state,
      currentEmotion: emotion,
      interactionCount: prev.interactionCount + 1
    }));

    // 模拟插件调用
    console.log(`[🎯 PLUGIN] 调用插件：${state}_${emotion}_plugin`);
  }, []);

  // 获取状态显示文本
  const getStateText = () => {
    switch (appState.currentState) {
      case PetState.Idle: return '静碗';
      case PetState.Hover: return '感应碗';
      case PetState.Awaken: return '唤醒碗';
      case PetState.Control: return '控制碗';
      default: return '未知';
    }
  };

  // 获取情绪显示文本
  const getEmotionText = () => {
    switch (appState.currentEmotion) {
      case EmotionType.Calm: return '平静';
      case EmotionType.Curious: return '好奇';
      case EmotionType.Focused: return '专注';
      case EmotionType.Happy: return '开心';
      case EmotionType.Excited: return '兴奋';
      default: return '未知';
    }
  };

  return (
    <div className="pet-container">
      {/* 主要的汤圆碗体 */}
      <div
        style={{
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #95E1D3, #F38BA8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          boxShadow: '0 8px 32px rgba(149, 225, 211, 0.3)',
          cursor: 'pointer',
          // @ts-ignore - WebKit specific property
          WebkitAppRegion: 'no-drag' as any
        }}
        title={`状态: ${appState.currentState} | 情绪: ${appState.currentEmotion}`}
      >
        {/* 汤圆内容区域 */}
        <div style={{
          textAlign: 'center',
          color: 'white',
          fontWeight: 'bold',
          textShadow: '0 2px 4px rgba(0,0,0,0.5)',
          pointerEvents: 'none'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>
            😊
          </div>
        </div>

        {/* 圆形桌宠UI组件 */}
        <CircularBowlUI />
      </div>

      {/* 左下角状态和情绪显示区域 */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        padding: '16px',
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(10px)',
        borderRadius: '12px',
        color: 'white',
        fontSize: '14px',
        fontWeight: 'bold',
        zIndex: 10
      }}>
        <div style={{ marginBottom: '8px' }}>
          状态: <span style={{ color: '#FFD700' }}>{getStateText()}</span>
        </div>
        <div style={{ marginBottom: '8px' }}>
          情绪: <span style={{ color: '#FF69B4' }}>{getEmotionText()}</span>
        </div>
        <div>
          互动次数: <span style={{ color: '#98FB98' }}>{appState.interactionCount}</span>
        </div>
      </div>

      {/* 系统状态调试信息 */}
      <div style={{
        position: 'absolute',
        bottom: '10px',
        right: '10px',
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '8px',
        borderRadius: '4px',
        fontSize: '10px',
        maxWidth: '200px',
        pointerEvents: 'none'
      }}>
        <div>神宠系统 v1.0 | T6-E 四碗UI</div>
        <div>当前状态: {appState.currentState}</div>
        <div>当前情绪: {appState.currentEmotion}</div>
      </div>
    </div>
  );
};

export default PetSystemApp;
