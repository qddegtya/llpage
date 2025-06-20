const { contextBridge, ipcRenderer } = require('electron');

// 安全地将API暴露给调试面板的渲染进程
contextBridge.exposeInMainWorld('debugAPI', {
  // 获取LLPage状态
  getLLPageState: () => ipcRenderer.invoke('debug:get-llpage-state'),
  
  // 页面生命周期事件监听
  onPageLifecycle: (callback) => {
    ipcRenderer.on('debug:page-lifecycle', (_, data) => callback(data));
  },
  
  // 页面数据更新事件监听
  onPageDataUpdated: (callback) => {
    ipcRenderer.on('debug:page-data-updated', (_, data) => callback(data));
  },

  // 浏览器操作API
  browser: {
    // 新建标签页
    newTab: (tabData) => ipcRenderer.invoke('browser:new-tab', tabData),
    
    // 切换标签页
    switchTab: (pageId) => ipcRenderer.invoke('browser:switch-tab', pageId),
    
    // 关闭标签页
    closeTab: (pageId) => ipcRenderer.invoke('browser:close-tab', pageId),
    
    // 刷新标签页
    refreshTab: (pageId) => ipcRenderer.invoke('browser:refresh-tab', pageId),
    
    // 获取所有标签页
    getAllTabs: () => ipcRenderer.invoke('browser:get-all-tabs')
  },

  // 关闭所有标签页
  closeAllTabs: () => ipcRenderer.invoke('debug:close-all-tabs'),
  
  // 关闭窗口
  closeWindow: () => ipcRenderer.send('debug:close-window')
});

// 调试窗口渲染进程加载完成时的事件
window.addEventListener('DOMContentLoaded', () => {
  console.log('调试面板DOM加载完成');
});
