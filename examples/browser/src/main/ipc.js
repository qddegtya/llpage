const { ipcMain, dialog, shell } = require('electron');
// 修复：使用正确的require语法导入LLPage
const llpage = require('llpage');
const { createPage } = llpage;
const path = require('path');
const url = require('url');

// 全局引用，确保处理程序访问的是最新状态
let mainWindow = null;
let debugWindow = null;
let llpageManager = null;

// 页面ID到页面实例的映射
const pageIdMap = new Map();

/**
 * 设置IPC通信处理程序
 * @param {BrowserWindow} mainWin - 主窗口实例
 * @param {BrowserWindow} debugWin - 调试窗口实例
 * @param {PageManager} manager - llpage管理器实例
 */
function setup(mainWin, debugWin, manager) {
  console.log('设置IPC处理程序...');
  
  // 存储窗口和管理器引用
  mainWindow = mainWin;
  debugWindow = debugWin;
  llpageManager = manager;

  // 移除所有现有处理程序，防止重复注册
  removeAllHandlers();
  
  // 注册处理程序
  setupBrowserHandlers();
  setupDebugHandlers();
  setupWindowHandlers();

  console.log('IPC处理程序设置完成');
}

/**
 * 移除所有当前注册的IPC处理程序
 */
function removeAllHandlers() {
  const handlers = [
    'browser:new-tab',
    'browser:switch-tab',
    'browser:close-tab',
    'browser:get-all-tabs',
    'browser:refresh-tab',
    'browser:update-tab-data',
    'browser:toggle-pin',
    'browser:toggle-debug-window',
    'browser:open-external',
    'debug:get-llpage-state',
    'debug:close-all-tabs',
    'window:minimize',
    'window:maximize',
    'window:close',
    'window:is-maximized'
  ];
  
  handlers.forEach(channel => {
    try {
      ipcMain.removeHandler(channel);
    } catch (err) {
      // 忽略不存在的处理程序错误
    }
  });
}

/**
 * 设置浏览器主要功能的IPC处理程序
 */
function setupBrowserHandlers() {
  // 创建新标签页
  ipcMain.handle('browser:new-tab', (event, tabData = {}) => {
    console.log('处理新建标签页请求:', tabData);
    
    // 检查是否来自调试窗口
    const isFromDebugWindow = debugWindow && event.sender.id === debugWindow.webContents.id;
    const { url = 'about:blank', active = true } = tabData;
    
    // 创建新的页面对象
    const page = createPage({
      data: {
        url,
        title: 'New Tab',
        favicon: '',
        id: `tab-${Date.now()}`,
        loading: true,
        error: null,
        canGoBack: false,
        canGoForward: false
      }
    });
    
    // 将页面ID映射到页面实例
    pageIdMap.set(page.id, page);
    
    // 打开页面
    llpageManager.open(page);
    
    // 发送调试信息
    if (debugWindow && !debugWindow.isDestroyed()) {
      debugWindow.webContents.send('debug:page-lifecycle', {
        action: 'create',
        pageId: page.id,
        url: page.data.url,
        timestamp: Date.now()
      });
    }
    
    // 如果请求来自调试面板，通知主窗口创建标签页
    if (isFromDebugWindow && mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('browser:tab-created', { 
        pageId: page.id, 
        ...page.data 
      });
      console.log('已通知主窗口创建标签页:', page.id);
    }
    
    return { pageId: page.id, ...page.data };
  });

  // 获取所有标签页
  ipcMain.handle('browser:get-all-tabs', () => {
    console.log('处理获取所有标签页请求');
    
    if (!llpageManager) {
      console.error('llpageManager不存在');
      return { tabs: [], activePageId: null };
    }
    
    try {
      // 获取所有页面
      const pages = llpageManager.pageList ? Array.from(llpageManager.pageList) : [];
      const runningPageId = llpageManager.runningPage ? llpageManager.runningPage.id : null;
      
      // 返回完整的数据结构
      return {
        tabs: pages.map(page => ({
          id: page.id,
          ...page.data,
          isActive: page.id === runningPageId
        })),
        activePageId: runningPageId
      };
    } catch (error) {
      console.error('获取标签页数据失败:', error);
      return { tabs: [], activePageId: null, error: error.message };
    }
  });

  // 切换标签页
  ipcMain.handle('browser:switch-tab', async (event, pageId) => {
    console.log('处理切换标签页请求:', pageId);
    
    try {
      const page = pageIdMap.get(pageId);
      if (page) {
        llpageManager.switchToPage(page); // 修复：使用switchToPage而不是run
        
        // 向其他窗口通知
        if (mainWindow && !mainWindow.isDestroyed() && event.sender.id !== mainWindow.webContents.id) {
          mainWindow.webContents.send('browser:tab-activated', { id: pageId });
        }
        
        if (debugWindow && !debugWindow.isDestroyed()) {
          debugWindow.webContents.send('debug:page-lifecycle', {
            action: 'activate',
            pageId: pageId,
            timestamp: Date.now()
          });
        }
        
        return { success: true, pageData: { id: page.id, ...page.data } };
      }
      
      return { success: false, error: 'Page not found' };
    } catch (error) {
      console.error('切换标签页失败:', error);
      return { success: false, error: error.message };
    }
  });

  // 关闭标签页
  ipcMain.handle('browser:close-tab', async (event, pageId) => {
    console.log('处理关闭标签页请求:', pageId);
    
    try {
      // 检查是否来自调试窗口
      const isFromDebugWindow = debugWindow && event.sender.id === debugWindow.webContents.id;
      
      const pageBeingClosed = pageIdMap.get(pageId);
      if (!pageBeingClosed) {
        return { success: false, error: 'Page not found' };
      }
      
      // 记录当前运行页面ID
      const currentRunningId = llpageManager.runningPage ? llpageManager.runningPage.id : null;
      
      // 关闭页面
      await llpageManager.close(pageBeingClosed);
      
      // 从页面ID映射中移除页面
      pageIdMap.delete(pageId);
      
      // 通知调试窗口
      if (debugWindow && !debugWindow.isDestroyed()) {
        debugWindow.webContents.send('debug:page-lifecycle', {
          action: 'close',
          pageId: pageId,
          timestamp: Date.now()
        });
      }
      
      // 如果请求来自调试窗口，通知主窗口
      if (isFromDebugWindow && mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('browser:tab-closed', { pageId });
        console.log('已通知主窗口关闭标签页:', pageId);
      }
      
      // 确定新的活动页面
      let newActiveId = null;
      if (llpageManager.runningPage) {
        newActiveId = llpageManager.runningPage.id;
      } else if (llpageManager.pageList.size > 0) {
        // 如果没有运行页面但还有其他页面，激活第一个
        const firstPage = Array.from(llpageManager.pageList)[0];
        await llpageManager.run(firstPage);
        newActiveId = firstPage.id;
      }
      
      return { success: true, newActiveId };
    } catch (error) {
      console.error('关闭标签页失败:', error);
      return { success: false, error: error.message };
    }
  });

  // 刷新标签页
  ipcMain.handle('browser:refresh-tab', (event, pageId) => {
    console.log('处理刷新标签页请求:', pageId);
    
    try {
      const page = pageIdMap.get(pageId);
      if (page) {
        // 使用llpage刷新
        llpageManager.refresh(page);
        
        // 通知渲染进程刷新webview
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('browser:refresh-webview', pageId);
        }
        
        // 通知调试窗口
        if (debugWindow && !debugWindow.isDestroyed()) {
          debugWindow.webContents.send('debug:page-lifecycle', {
            action: 'refresh',
            pageId: pageId,
            timestamp: Date.now()
          });
        }
        
        return { success: true };
      }
      return { success: false, error: 'Page not found' };
    } catch (error) {
      console.error('刷新标签页失败:', error);
      return { success: false, error: error.message };
    }
  });

  // 更新标签页数据
  ipcMain.handle('browser:update-tab-data', (event, pageId, newData) => {
    try {
      const page = pageIdMap.get(pageId);
      if (page) {
        // 更新页面数据
        Object.assign(page.data, newData);
        
        // 通知窗口
        const updatedData = { pageId, data: newData };
        
        if (mainWindow && !mainWindow.isDestroyed() && event.sender.id !== mainWindow.webContents.id) {
          mainWindow.webContents.send('browser:tab-data-updated', updatedData);
        }
        
        if (debugWindow && !debugWindow.isDestroyed() && event.sender.id !== debugWindow.webContents.id) {
          debugWindow.webContents.send('debug:page-data-updated', updatedData);
        }
        
        return { success: true };
      }
      return { success: false, error: 'Page not found' };
    } catch (error) {
      console.error('更新标签页数据失败:', error);
      return { success: false, error: error.message };
    }
  });

  // 切换调试窗口
  ipcMain.handle('browser:toggle-debug-window', () => {
    console.log('处理切换调试窗口请求');
    
    if (debugWindow && !debugWindow.isDestroyed()) {
      if (debugWindow.isVisible()) {
        debugWindow.hide();
      } else {
        debugWindow.show();
        debugWindow.focus();
      }
      return { visible: debugWindow.isVisible() };
    }
    return { error: 'Debug window not available' };
  });

  // 处理URL打开请求
  ipcMain.handle('browser:open-external', (event, externalUrl) => {
    try {
      shell.openExternal(externalUrl);
      return { success: true };
    } catch (error) {
      console.error('打开外部URL失败:', error);
      return { success: false, error: error.message };
    }
  });
}

/**
 * 设置调试相关的IPC处理程序
 */
function setupDebugHandlers() {
  // 获取llpage状态
  ipcMain.handle('debug:get-llpage-state', () => {
    console.log('处理获取llpage状态请求');
    
    // 检查是否启用了调试面板
    const isDebugEnabled = process.argv.includes('--debug-panel');
    if (!isDebugEnabled) {
      return { error: 'Debug panel not enabled' };
    }
    
    if (!llpageManager) {
      return { error: 'llpageManager not initialized' };
    }
    
    try {
      // 返回llpage管理器的状态
      return {
        pageCount: llpageManager.pageList.size,
        activePageId: llpageManager.runningPage ? llpageManager.runningPage.id : null,
        pages: Array.from(llpageManager.pageList).map(page => ({
          id: page.id,
          url: page.data.url,
          title: page.data.title,
          isActive: llpageManager.runningPage && page.id === llpageManager.runningPage.id
        }))
      };
    } catch (error) {
      console.error('获取llpage状态失败:', error);
      return { error: error.message };
    }
  });

  // 关闭所有标签页
  ipcMain.handle('debug:close-all-tabs', async () => {
    console.log('处理关闭所有标签页请求');
    
    if (!llpageManager) {
      return { success: false, error: 'llpageManager not initialized' };
    }
    
    try {
      const pages = Array.from(llpageManager.pageList);
      
      // 通知主窗口关闭所有标签页
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('browser:close-all-tabs');
      }
      
      // 使用llpage的closeAll方法
      llpageManager.closeAll();
      
      // 清空页面ID映射
      pageIdMap.clear();
      
      return { success: true, closedCount: pages.length };
    } catch (error) {
      console.error('关闭所有标签页失败:', error);
      return { success: false, error: error.message };
    }
  });
}

/**
 * 设置窗口控制的IPC处理程序
 */
function setupWindowHandlers() {
  // 最小化窗口
  ipcMain.handle('window:minimize', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.minimize();
      return { success: true };
    }
    return { success: false };
  });

  // 最大化/还原窗口
  ipcMain.handle('window:maximize', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      if (mainWindow.isMaximized()) {
        mainWindow.restore();
      } else {
        mainWindow.maximize();
      }
      return { isMaximized: mainWindow.isMaximized() };
    }
    return { success: false };
  });

  // 关闭窗口
  ipcMain.handle('window:close', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.close();
      return { success: true };
    }
    return { success: false };
  });

  // 检查窗口是否最大化
  ipcMain.handle('window:is-maximized', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      return mainWindow.isMaximized();
    }
    return false;
  });
}

module.exports = {
  setup
};
