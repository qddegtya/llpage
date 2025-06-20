const { contextBridge, ipcRenderer } = require('electron');

// 安全地将API暴露给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 浏览器标签页操作API
  browser: {
    // 新建标签页
    newTab: (tabData) => ipcRenderer.invoke('browser:new-tab', tabData),
    
    // 切换标签页
    switchTab: (pageId) => ipcRenderer.invoke('browser:switch-tab', pageId),
    
    // 关闭标签页
    closeTab: (pageId) => ipcRenderer.invoke('browser:close-tab', pageId),
    
    // 获取所有标签页
    getAllTabs: () => ipcRenderer.invoke('browser:get-all-tabs'),
    
    // 刷新标签页
    refreshTab: (pageId) => ipcRenderer.invoke('browser:refresh-tab', pageId),
    
    // 更新标签页数据
    updateTabData: (pageId, data) => ipcRenderer.invoke('browser:update-tab-data', pageId, data),
    
    // 切换标签页固定状态
    togglePinTab: (pageId) => ipcRenderer.invoke('browser:toggle-pin', pageId),
    
    // 切换调试窗口
    toggleDebugWindow: () => ipcRenderer.invoke('browser:toggle-debug-window'),
    
    // 接收浏览器事件
    onAction: (callback) => ipcRenderer.on('browser:action', (_, action) => callback(action)),
    
    // 监听标签页激活
    onTabActivated: (callback) => ipcRenderer.on('browser:tab-activated', (_, data) => callback(data)),
    
    // 监听标签页数据更新
    onTabDataUpdated: (callback) => ipcRenderer.on('browser:tab-data-updated', (_, data) => callback(data)),
    
    // 监听标签页创建事件（从调试面板）
    onTabCreated: (callback) => ipcRenderer.on('browser:tab-created', (_, data) => callback(data)),
    
    // 监听标签页关闭事件（从调试面板）
    onTabClosed: (callback) => ipcRenderer.on('browser:tab-closed', (_, data) => callback(data)),
    
    // 监听关闭所有标签页的通知
    onCloseAllTabs: (callback) => ipcRenderer.on('browser:close-all-tabs', () => callback()),
    
    // 监听WebView刷新事件
    onRefreshWebview: (callback) => ipcRenderer.on('browser:refresh-webview', (_, pageId) => callback(pageId))
  },
  
  // 窗口控制API
  window: {
    // 最小化窗口
    minimize: () => ipcRenderer.invoke('window:minimize'),
    
    // 最大化/还原窗口
    maximize: () => ipcRenderer.invoke('window:maximize'),
    
    // 关闭窗口
    close: () => ipcRenderer.invoke('window:close'),
    
    // 检查窗口是否最大化
    isMaximized: () => ipcRenderer.invoke('window:is-maximized')
  }
});

// 当DOM加载完成，可以做一些渲染进程初始化工作
window.addEventListener('DOMContentLoaded', () => {
  console.log('DOM加载完成，预加载脚本初始化完成');
});
