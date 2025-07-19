const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;

function createWindow() {
  // 获取屏幕尺寸
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;
  
  // 圆形桌宠窗口尺寸 - 调整为合适大小
  const windowSize = 200; // 增加窗口大小以适应神宠
  
  // 计算右下角位置 (留出一些边距)
  const x = screenWidth - windowSize - 50;
  const y = screenHeight - windowSize - 50;

  // 创建圆形桌宠窗口 - 豆包风格圆润设计
  mainWindow = new BrowserWindow({
    width: windowSize,
    height: windowSize,
    x: x,
    y: y,
    frame: false, // 无边框窗口
    transparent: true, // 透明窗口
    alwaysOnTop: true, // 始终置顶
    resizable: false,
    movable: true,
    skipTaskbar: true, // 不显示在任务栏
    roundedCorners: true, // macOS圆角支持
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // 加载应用
  if (isDev) {
    console.log('🔧 Development mode detected, loading desktop app...');
    // 开发环境：直接加载桌面版
    const tryLoadURL = async () => {
      const ports = [3000, 3001, 3003, 3002, 3004, 3005]; // 优先3000端口
      console.log('🔍 Starting URL loading sequence...');
      for (const port of ports) {
        try {
          const url = `http://localhost:${port}/bowl-desktop.html`;
          console.log(`🔍 Trying to load desktop app from: ${url}`);
          await mainWindow.loadURL(url);
          console.log(`✅ Desktop app successfully loaded from: ${url}`);
          
          // 确认加载完成
          mainWindow.webContents.once('did-finish-load', () => {
            console.log('🎨 Desktop UI loaded and ready');
          });
          
          return; // 成功加载
        } catch (error) {
          console.log(`❌ Failed to load from port ${port}: ${error.message}`);
          continue;
        }
      }
      
      // 如果所有端口都失败，加载主页面
      console.log(`⚠️ All desktop.html attempts failed, loading main page`);
      try {
        await mainWindow.loadURL(`http://localhost:3000`);
        console.log(`📱 Loaded main page as fallback`);
      } catch (fallbackError) {
        console.log(`❌ Even fallback failed: ${fallbackError.message}`);
      }
    };
    tryLoadURL();
    // 启用开发者工具来调试
    mainWindow.webContents.openDevTools();
  } else {
    console.log('📦 Production mode detected, loading built files...');
    mainWindow.loadFile(path.join(__dirname, '../dist-ui/index.html'));
  }

  // 窗口关闭处理
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // 设置窗口行为
  mainWindow.setSkipTaskbar(true); // 不显示在任务栏
  
  console.log('🐣 SaintGrid Pet System UI Window Created');
}

// Electron 应用准备就绪
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// 关闭所有窗口时退出应用 (macOS 除外)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC 通信处理
ipcMain.handle('pet-state-change', async (event, stateData) => {
  console.log('🎯 Pet State Change:', stateData);
  return { success: true };
});

ipcMain.handle('pet-emotion-change', async (event, emotionData) => {
  console.log('😊 Pet Emotion Change:', emotionData);
  return { success: true };
});

ipcMain.handle('pet-behavior-trigger', async (event, behaviorData) => {
  console.log('🎬 Pet Behavior Trigger:', behaviorData);
  return { success: true };
});

console.log('🚀 SaintGrid Pet System Electron Main Process Started');
