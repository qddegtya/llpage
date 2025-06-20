const { app, BrowserWindow, protocol, session } = require('electron');
const path = require('path');
const url = require('url');

// 修复：使用正确的require语法导入LLPage
const llpage = require('llpage');
const { createLLPageManager } = llpage;

// 开发模式下启用调试日志
if (process.env.NODE_ENV !== 'production') {
  console.log('Running in development mode');
}

// LLPage 管理器实例
const llpageManager = createLLPageManager({
  size: 20, // 允许最多20个标签页共存
});

// 窗口引用
let mainWindow = null;
let debugWindow = null;

// 协议注册 - 允许加载本地资源
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
]);

async function createMainWindow() {
  // 创建主窗口
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    frame: false, // 无框架窗口，自定义标题栏
    transparent: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload', 'preload.js'),
      webviewTag: true, // 启用webview标签
      webSecurity: true
    }
  });

  // 加载主页面
  await mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  
  // 开发环境下打开开发者工具
  if (process.env.NODE_ENV !== 'production') {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }
  
  // 窗口关闭时清除引用
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
  
  return mainWindow;
}

async function createDebugWindow() {
  // 创建调试窗口
  debugWindow = new BrowserWindow({
    width: 800,
    height: 600,
    x: 50,
    y: 50,
    title: 'Debug Panel',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload', 'debug-preload.js')
    }
  });

  // 加载调试页面
  await debugWindow.loadFile(path.join(__dirname, 'renderer', 'debug.html'));
  
  // 开发环境下打开开发者工具
  if (process.env.NODE_ENV !== 'production') {
    debugWindow.webContents.openDevTools({ mode: 'detach' });
  }
  
  // 窗口关闭时清除引用
  debugWindow.on('closed', () => {
    debugWindow = null;
  });
  
  return debugWindow;
}

// 当Electron完成初始化并准备创建浏览器窗口时调用此方法
app.whenReady().then(async () => {
  // 注册自定义协议 - 用于加载本地资源
  protocol.registerFileProtocol('app', (request, callback) => {
    const url = request.url.slice(6); // 移除 "app://" 前缀
    const filePath = path.normalize(`${__dirname}/${url}`);
    callback({ path: filePath });
  });

  // 提前设置IPC处理程序，确保窗口创建时已经注册
  console.log('初始化IPC通信...');
  const ipc = require('./main/ipc');
  
  // 设置基础IPC处理程序（不需要窗口引用的部分）
  ipc.setup(null, null, llpageManager);

  // 创建主窗口
  mainWindow = await createMainWindow();
  
  // 创建调试窗口（如果需要）
  if (process.argv.includes('--debug-panel')) {
    debugWindow = await createDebugWindow();
  }
  
  // 重新设置IPC处理程序，现在包含窗口引用
  console.log('更新IPC处理程序...');
  ipc.setup(mainWindow, debugWindow, llpageManager);

  // 等待主窗口准备就绪
  mainWindow.once('ready-to-show', () => {
    console.log('主窗口已准备就绪');
    mainWindow.show();
  });
  
  // 设置应用菜单
  require('./main/menu').setup();
  
  // 监听窗口激活事件
  app.on('activate', async function () {
    // 在macOS上，当点击dock图标且没有其他窗口打开时，通常会重新创建一个窗口
    if (BrowserWindow.getAllWindows().length === 0) {
      await createMainWindow();
      
      // 如果启用了调试模式但窗口不存在，重新创建
      if (process.argv.includes('--debug-panel') && !debugWindow) {
        await createDebugWindow();
      }
      
      // 重新设置IPC，确保新窗口能正常工作
      console.log('重新初始化IPC通信...');
      ipc.setup(mainWindow, debugWindow, llpageManager);
    }
  });
});

// 当所有窗口都被关闭时退出，除了在 macOS 上
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 在应用程序退出前清理
app.on('quit', () => {
  console.log('应用程序退出，清理资源...');
});

// 捕获未处理的Promise异常
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
});
