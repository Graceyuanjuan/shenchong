const { contextBridge, ipcRenderer } = require('electron');

// 暴露安全的 API 给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 宠物状态变化
  onPetStateChange: (stateData) => ipcRenderer.invoke('pet-state-change', stateData),
  
  // 宠物情绪变化
  onPetEmotionChange: (emotionData) => ipcRenderer.invoke('pet-emotion-change', emotionData),
  
  // 宠物行为触发
  onPetBehaviorTrigger: (behaviorData) => ipcRenderer.invoke('pet-behavior-trigger', behaviorData),
  
  // 获取平台信息
  platform: process.platform,
  
  // 开发环境标识
  isDev: process.env.NODE_ENV === 'development'
});

console.log('🌉 SaintGrid Pet System Preload Script Loaded');
