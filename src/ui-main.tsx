import React from 'react'
import ReactDOM from 'react-dom/client'
import PetSystemApp from './PetSystemApp'  // 使用完整功能版本
import './ui-styles.css'

// 扩展 Window 接口以包含 electronAPI
declare global {
  interface Window {
    electronAPI?: {
      onPetStateChange: (stateData: any) => Promise<any>;
      onPetEmotionChange: (emotionData: any) => Promise<any>;
      onPetBehaviorTrigger: (behaviorData: any) => Promise<any>;
      platform: string;
      isDev: boolean;
    };
  }
}

console.log('🌐 SaintGrid Pet System UI Starting...');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PetSystemApp />
  </React.StrictMode>,
)

console.log('✅ SaintGrid Pet System UI Rendered');
