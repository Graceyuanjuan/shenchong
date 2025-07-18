const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;

function createWindow() {
  // 获取屏幕尺寸
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;
  
  // 圆形桌宠窗口尺寸 - 更小更圆润
  const windowSize = 160; // 进一步缩小窗口
  
  // 计算右下角位置 (留出一些边距)
  const x = screenWidth - windowSize - 20;
  const y = screenHeight - windowSize - 20;

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
    // 在开发环境下尝试多个端口
    const tryLoadURL = async () => {
      const ports = [3000, 3001, 3002, 3003, 3004, 3005];
      for (const port of ports) {
        try {
          const url = `http://localhost:${port}`;
          console.log(`🔍 Trying to load: ${url}`);
          await mainWindow.loadURL(url);
          console.log(`✅ Successfully loaded: ${url}`);
          break;
        } catch (error) {
          console.log(`❌ Failed to load port ${port}: ${error.message}`);
          continue;
        }
      }
    };
    tryLoadURL();
    // 开发环境下打开开发者工具
    mainWindow.webContents.openDevTools();
  } else {
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
