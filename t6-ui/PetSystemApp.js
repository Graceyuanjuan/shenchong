import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { SaintGridPetSystem } from './index';
import { PetState, EmotionType } from './types';
import { StrategyConfigPanel } from './modules/StrategyConfigUI/StrategyConfigPanel';
const PetSystemApp = () => {
    const [petSystem, setPetSystem] = useState(null);
    const [appState, setAppState] = useState({
        currentState: PetState.Awaken, // 改为awaken状态
        currentEmotion: EmotionType.Happy, // 改为happy情绪
        isSystemReady: false,
        pluginStatus: '',
        rhythmMode: 'steady',
        lastBehavior: '',
        showStrategyPanel: false
    });
    // 初始化神宠系统
    useEffect(() => {
        const initPetSystem = async () => {
            try {
                console.log('🎯 Initializing SaintGrid Pet System...');
                const system = new SaintGridPetSystem();
                await system.start();
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
            }
            catch (error) {
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
        if (!petSystem)
            return;
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
        }
        catch (error) {
            console.error('❌ Hover state transition failed:', error);
        }
    }, [petSystem]);
    // 处理鼠标离开 - 返回 idle 状态
    const handleMouseLeave = useCallback(async () => {
        if (!petSystem)
            return;
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
        }
        catch (error) {
            console.error('❌ Idle state transition failed:', error);
        }
    }, [petSystem]);
    // 处理左键点击 - 触发 awaken 状态
    const handleLeftClick = useCallback(async () => {
        if (!petSystem)
            return;
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
        }
        catch (error) {
            console.error('❌ Awaken state transition failed:', error);
        }
    }, [petSystem]);
    // 处理右键点击 - 触发 control 状态
    const handleRightClick = useCallback(async (event) => {
        event.preventDefault();
        if (!petSystem)
            return;
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
        }
        catch (error) {
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
    return (_jsxs("div", { className: "pet-container", children: [_jsx("button", { onClick: toggleStrategyPanel, style: {
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
                }, children: appState.showStrategyPanel ? '❌ 关闭配置' : '⚙️ 策略配置' }), appState.showStrategyPanel && (_jsx("div", { style: {
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
                }, children: _jsx(StrategyConfigPanel, {}) })), _jsx("div", { className: getStateClassName(), onMouseEnter: handleMouseEnter, onMouseLeave: handleMouseLeave, onClick: handleLeftClick, onContextMenu: handleRightClick, title: `状态: ${appState.currentState} | 情绪: ${appState.currentEmotion}`, children: _jsx("div", { style: {
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        textAlign: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                        pointerEvents: 'none'
                    }, children: _jsx("div", { style: { fontSize: '48px', marginBottom: '8px' }, children: "\uD83D\uDE0A" }) }) }), _jsxs("div", { style: {
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
                }, children: [_jsxs("div", { style: { marginBottom: '8px' }, children: ["\u72B6\u6001: ", _jsx("span", { style: { color: '#FFD700' }, children: appState.currentState === 'awaken' ? 'awaken' : appState.currentState })] }), _jsxs("div", { style: { marginBottom: '8px' }, children: ["\u60C5\u7EEA: ", _jsx("span", { style: { color: '#FF69B4' }, children: appState.currentEmotion === 'happy' ? 'happy' : appState.currentEmotion })] }), _jsxs("div", { children: ["\u4E92\u52A8\u6B21\u6570: ", _jsx("span", { style: { color: '#98FB98' }, children: "0" })] })] }), _jsx("div", { className: `plugin-indicator ${appState.pluginStatus ? 'show' : ''}`, children: appState.pluginStatus && `🔌 ${appState.pluginStatus}` }), window.electronAPI?.isDev && (_jsxs("div", { style: {
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
                }, children: [_jsx("div", { children: "\u795E\u5BA0\u7CFB\u7EDF v1.0 |" }), _jsxs("div", { children: ["\u7CFB\u7EDF: ", appState.isSystemReady ? '✅ 就绪' : '⏳ 初始化'] }), _jsxs("div", { children: ["\u884C\u4E3A: ", appState.lastBehavior] }), _jsxs("div", { children: ["\u8282\u594F: ", appState.rhythmMode] })] }))] }));
};
export default PetSystemApp;
//# sourceMappingURL=PetSystemApp.js.map