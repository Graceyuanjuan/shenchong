import React, { useState, useEffect, useCallback } from 'react';
import { PetState, EmotionType } from './types';
import PetBowl from './components/PetBowl';
import './index.css';

interface PetSystemAppState {
  currentState: PetState;
  currentEmotion: EmotionType;
  isSystemReady: boolean;
  pluginStatus: string;
  rhythmMode: string;
  behavior: string;
  showStrategyPanel: boolean;
  interactionCount: number; // 新增：互动次数计数器
}

const PetSystemApp: React.FC = () => {
  const [petSystem, setPetSystem] = useState<any | null>(null);
  const [appState, setAppState] = useState<PetSystemAppState>({
    currentState: PetState.Awaken,  // 改为awaken状态
    currentEmotion: EmotionType.Happy,  // 改为happy情绪
    isSystemReady: false,
    pluginStatus: '',
    rhythmMode: 'steady',
    behavior: '',
    showStrategyPanel: false,
    interactionCount: 0 // 初始化互动次数
  });

  // 初始化神宠系统
  useEffect(() => {
    const initPetSystem = async () => {
      try {
        console.log('🎯 Initializing SaintGrid Pet System...');
        // 模拟系统初始化 
        const system = {
          start: async () => console.log('✅ Pet System started'),
          stop: async () => console.log('⏹️ Pet System stopped')
        };
        
        setPetSystem(system);
        setAppState(prev => ({ ...prev, isSystemReady: true }));
        
        console.log('✅ Pet System UI Integration Completed');
        
        // 通知 Electron 主进程
        if (window.electronAPI) {
          await window.electronAPI.onPetStateChange({
            state: PetState.Idle,
            emotion: EmotionType.Calm,
            timestamp: Date.now()
          });
        }
      } catch (error) {
        console.error('❌ Pet System Initialization Failed:', error);
      }
    };

    initPetSystem();

    // 清理函数
    return () => {
      if (petSystem) {
        petSystem.stop().catch(console.error);
      }
    };
  }, []);

  // 处理鼠标悬停 - 触发 hover 状态
  const handleMouseEnter = useCallback(async () => {
    if (!petSystem) return;

    try {
      console.log('🖱️ Mouse Enter - Triggering Hover State');
      await petSystem.onLeftClick(); // 这会触发状态转换到 hover
      
      setAppState(prev => ({
        ...prev,
        currentState: PetState.Hover,
        currentEmotion: EmotionType.Curious,
        lastBehavior: 'hover_enter'
      }));

      // 通知 Electron
      if (window.electronAPI) {
        await window.electronAPI.onPetStateChange({
          state: PetState.Hover,
          emotion: EmotionType.Curious,
          action: 'mouse_enter',
          timestamp: Date.now()
        });
      }
    } catch (error) {
      console.error('❌ Hover state transition failed:', error);
    }
  }, [petSystem]);

  // 处理鼠标离开 - 返回 idle 状态
  const handleMouseLeave = useCallback(async () => {
    if (!petSystem) return;

    try {
      console.log('🖱️ Mouse Leave - Returning to Idle State');
      await petSystem.onMouseLeave();
      
      setAppState(prev => ({
        ...prev,
        currentState: PetState.Idle,
        currentEmotion: EmotionType.Calm,
        lastBehavior: 'hover_exit'
      }));

      // 通知 Electron
      if (window.electronAPI) {
        await window.electronAPI.onPetStateChange({
          state: PetState.Idle,
          emotion: EmotionType.Calm,
          action: 'mouse_leave',
          timestamp: Date.now()
        });
      }
    } catch (error) {
      console.error('❌ Idle state transition failed:', error);
    }
  }, [petSystem]);

  // 处理左键点击 - 触发 awaken 状态
  const handleLeftClick = useCallback(async () => {
    if (!petSystem) return;

    try {
      console.log('👆 Left Click - Triggering Awaken State');
      await petSystem.onLeftClick();
      
      setAppState(prev => ({
        ...prev,
        currentState: PetState.Awaken,
        currentEmotion: EmotionType.Excited,
        lastBehavior: 'awaken_click',
        pluginStatus: 'screenshot_ready'
      }));

      // 通知 Electron
      if (window.electronAPI) {
        await window.electronAPI.onPetBehaviorTrigger({
          state: PetState.Awaken,
          emotion: EmotionType.Excited,
          action: 'left_click',
          plugin: 'screenshot',
          timestamp: Date.now()
        });
      }
    } catch (error) {
      console.error('❌ Awaken state transition failed:', error);
    }
  }, [petSystem]);

  // 处理右键点击 - 触发 control 状态
  const handleRightClick = useCallback(async (event: React.MouseEvent) => {
    event.preventDefault();
    if (!petSystem) return;

    try {
      console.log('👆 Right Click - Triggering Control State');
      await petSystem.onRightClick();
      
      setAppState(prev => ({
        ...prev,
        currentState: PetState.Control,
        currentEmotion: EmotionType.Focused,
        lastBehavior: 'control_menu',
        pluginStatus: 'note_ready'
      }));

      // 通知 Electron
      if (window.electronAPI) {
        await window.electronAPI.onPetBehaviorTrigger({
          state: PetState.Control,
          emotion: EmotionType.Focused,
          action: 'right_click',
          plugin: 'note',
          timestamp: Date.now()
        });
      }
    } catch (error) {
      console.error('❌ Control state transition failed:', error);
    }
  }, [petSystem]);

  // 切换策略配置面板
  const toggleStrategyPanel = useCallback(() => {
    setAppState(prev => ({
      ...prev,
      showStrategyPanel: !prev.showStrategyPanel
    }));
  }, []);

  // 处理碗点击 - 新增四碗交互功能
  const handleBowlClick = useCallback(async (state: PetState, emotion: EmotionType) => {
    if (!petSystem) return;

    try {
      console.log(`[🍚 BOWL CLICK] 状态切换至: ${state}, 情绪切换至: ${emotion}`);
      
      // 更新状态和情绪
      setAppState(prev => ({
        ...prev,
        currentState: state,
        currentEmotion: emotion,
        lastBehavior: `bowl_${state}_${emotion}`,
        interactionCount: prev.interactionCount + 1
      }));

      // 模拟调度器行为调度
      try {
        console.log(`[🎯 SCHEDULER] 模拟调度行为 - 状态: ${state}, 情绪: ${emotion}`);
        console.log(`[🎯 PLUGIN] 调用插件：${state}_${emotion}_plugin`);
      } catch (schedulerError) {
        console.warn(`[⚠️ SCHEDULER] 调度器调用失败:`, schedulerError);
        console.log(`[🎯 PLUGIN] 调用插件：${state}_${emotion}_plugin`);
      }

      // 通知 Electron
      if (window.electronAPI) {
        await window.electronAPI.onPetStateChange({
          state,
          emotion,
          action: 'bowl_click',
          timestamp: Date.now()
        });
      }
    } catch (error) {
      console.error('❌ Bowl click handling failed:', error);
    }
  }, [petSystem]);

  // 生成状态对应的 CSS 类名
  const getStateClassName = () => {
    const stateClass = `pet-state-${appState.currentState.toLowerCase()}`;
    const emotionClass = `emotion-${appState.currentEmotion.toLowerCase()}`;
    return `pet-bowl ${stateClass} ${emotionClass}`;
  };

  // 获取状态显示文本
  const getStateText = () => {
    switch (appState.currentState) {
      case PetState.Idle: return '💤 静碗';
      case PetState.Hover: return '✨ 感应碗';
      case PetState.Awaken: return '🌟 唤醒碗';
      case PetState.Control: return '⚙️ 控制碗';
      default: return '🔄 未知';
    }
  };

  // 获取情绪显示文本
  const getEmotionText = () => {
    switch (appState.currentEmotion) {
      case EmotionType.Calm: return '😌 平静';
      case EmotionType.Curious: return '🔍 好奇';
      case EmotionType.Focused: return '🎯 专注';
      case EmotionType.Happy: return '😊 开心';
      case EmotionType.Excited: return '🎉 兴奋';
      default: return '😐 未知';
    }
  };

  return (
    <div className="pet-container">
      {/* 配置面板切换按钮 */}
      <button
        onClick={toggleStrategyPanel}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          padding: '8px 12px',
          backgroundColor: appState.showStrategyPanel ? '#dc3545' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: 'bold',
          zIndex: 1000
        }}
      >
        {appState.showStrategyPanel ? '❌ 关闭配置' : '⚙️ 策略配置'}
      </button>

      {/* 策略配置面板 */}
      {appState.showStrategyPanel && (
        <div style={{
          position: 'absolute',
          top: '50px',
          right: '10px',
          width: '600px',
          maxHeight: 'calc(100vh - 70px)',
          overflow: 'auto',
          backgroundColor: 'white',
          border: '1px solid #ddd',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          zIndex: 999
        }}>
          <div>策略配置面板(模拟)</div>
        </div>
      )}

      {/* 网页端显示功能提示 */}
      {!window.electronAPI && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          padding: '16px',
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '12px',
          color: '#333',
          fontSize: '14px',
          fontWeight: 'bold',
          zIndex: 10,
          maxWidth: '300px'
        }}>
          <div style={{ marginBottom: '12px', fontSize: '16px', color: '#007ACC' }}>
            🎯 SaintGrid Pet System
          </div>
          <div style={{ marginBottom: '8px' }}>
            🖱️ <strong>悬停</strong>：显示语音控制
          </div>
          <div style={{ marginBottom: '8px' }}>
            👆 <strong>左键</strong>：快捷操作面板
          </div>
          <div style={{ marginBottom: '8px' }}>
            🖱️ <strong>右键</strong>：系统设置菜单
          </div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
            当前：{appState.currentState} | {appState.currentEmotion}
          </div>
        </div>
      )}

      {/* 主要的神宠UI - 使用PetBowl组件 */}
      <PetBowl />

      {/* 桌面端隐藏状态信息，网页端在右下角显示 */}
      {!window.electronAPI && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          padding: '12px',
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(10px)',
          borderRadius: '8px',
          color: 'white',
          fontSize: '12px',
          fontWeight: 'bold',
          zIndex: 10
        }}>
          <div>互动次数: <span style={{ color: '#98FB98' }}>{appState.interactionCount}</span></div>
        </div>
      )}

      {/* 桌面端隐藏状态信息，网页端在右下角显示 */}
      {!window.electronAPI && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          padding: '12px',
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(10px)',
          borderRadius: '8px',
          color: 'white',
          fontSize: '12px',
          fontWeight: 'bold',
          zIndex: 10
        }}>
          <div>互动次数: <span style={{ color: '#98FB98' }}>{appState.interactionCount}</span></div>
        </div>
      )}

      {/* 插件状态指示器 */}
      <div className={`plugin-indicator ${appState.pluginStatus ? 'show' : ''}`}>
        {appState.pluginStatus && `🔌 ${appState.pluginStatus}`}
      </div>

      {/* 系统状态调试信息 (仅开发环境) */}
      {window.electronAPI?.isDev && (
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
          <div>神宠系统 v1.0 |</div>
          <div>系统: {appState.isSystemReady ? '✅ 就绪' : '⏳ 初始化'}</div>
          <div>行为: {appState.behavior}</div>
          <div>节奏: {appState.rhythmMode}</div>
        </div>
      )}
    </div>
  );
};

export default PetSystemApp;
