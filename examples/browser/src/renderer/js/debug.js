// 调试窗口脚本
document.addEventListener('DOMContentLoaded', () => {
  // DOM 元素引用
  const elements = {
    pageCount: document.getElementById('page-count'),
    maxSize: document.getElementById('max-size'),
    pagesList: document.getElementById('pages-list'),
    llpageSize: document.getElementById('llpage-size'),
    llpageIsFull: document.getElementById('llpage-is-full'),
    llpageIsEmpty: document.getElementById('llpage-is-empty'),
    llpageRunningPage: document.getElementById('llpage-running-page'),
    llpageListSize: document.getElementById('llpage-list-size'),
    llpageLruSize: document.getElementById('llpage-lru-size'),
    pageDetails: document.getElementById('page-details'),
    pageId: document.getElementById('page-id'),
    pageUrl: document.getElementById('page-url'),
    pageTitle: document.getElementById('page-title'),
    pageIsRunning: document.getElementById('page-is-running'),
    pageIsDead: document.getElementById('page-is-dead'),
    pageIsEliminated: document.getElementById('page-is-eliminated'),
    pageEliminationCount: document.getElementById('page-elimination-count'),
    pageIsPin: document.getElementById('page-is-pin'),
    lifecycleLog: document.getElementById('lifecycle-log'),
    refreshStatus: document.getElementById('refresh-status'),
    createTestTab: document.getElementById('create-test-tab'),
    closeAllTabs: document.getElementById('close-all-tabs'),
    clearLogs: document.getElementById('clear-logs')
  };
  
  // 调试面板状态
  const debugState = {
    llpageState: null,
    selectedPageId: null,
    lifecycleEvents: []
  };
  
  // 初始化
  init();
  
  async function init() {
    await refreshLLPageState();
    setupEventListeners();
  }
  
  // 获取LLPage状态
  async function refreshLLPageState() {
    try {
      const state = await window.debugAPI.getLLPageState();
      
      // 检查是否有错误
      if (state.error) {
        console.error('获取llpage状态失败:', state.error);
        showDisabledState();
        return;
      }
      
      // 缓存状态
      debugState.llpageState = state;
      
      // 更新状态面板
      updateStatusPanel(state);
      
      // 渲染页面列表
      renderPagesList(state.pages || []);
    } catch (error) {
      console.error('刷新状态失败:', error);
      showDisabledState();
    }
  }
  
  // 更新状态面板
  function updateStatusPanel(state) {
    const pageCount = state.pageCount || 0;
    const maxPages = 20; // 默认最大页面数
    
    elements.pageCount.textContent = pageCount;
    elements.maxSize.textContent = maxPages;
    elements.llpageSize.textContent = maxPages;
    elements.llpageIsFull.textContent = pageCount >= maxPages ? 'Yes' : 'No';
    elements.llpageIsEmpty.textContent = pageCount === 0 ? 'Yes' : 'No';
    elements.llpageRunningPage.textContent = state.activePageId || 'None';
    elements.llpageListSize.textContent = pageCount;
    elements.llpageLruSize.textContent = pageCount;
    
    // 高亮标记正在运行的页面
    if (state.activePageId) {
      const pageItems = document.querySelectorAll('.page-item');
      pageItems.forEach(item => {
        if (item.dataset.pageId === state.activePageId) {
          item.classList.add('border-l-4', 'border-green-500');
        } else {
          item.classList.remove('border-l-4', 'border-green-500');
        }
      });
    }
  }
  
  // 渲染页面列表
  function renderPagesList(pages) {
    // 清空现有列表
    elements.pagesList.innerHTML = '';
    
    if (!pages || pages.length === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.className = 'text-gray-400 text-sm p-2';
      emptyMessage.textContent = 'No pages available';
      elements.pagesList.appendChild(emptyMessage);
      return;
    }
    
    // 创建页面列表项
    pages.forEach(page => {
      const template = document.getElementById('page-item-template');
      const clone = template.content.cloneNode(true);
      const pageItem = clone.querySelector('.page-item');
      
      pageItem.dataset.pageId = page.id;
      
      // 设置主标题（页面ID）
      const title = pageItem.querySelector('.font-medium');
      title.textContent = `Page #${page.id}`;
      
      // 设置URL
      const url = pageItem.querySelector('.text-xs');
      url.textContent = page.url || 'about:blank';
      
      // 设置状态标记
      const statusBadge = pageItem.querySelector('.status-badge');
      if (page.isRunning) {
        statusBadge.textContent = 'Running';
        statusBadge.classList.add('bg-green-600');
      } else if (page.isEliminated) {
        statusBadge.textContent = 'Eliminated';
        statusBadge.classList.add('bg-red-600');
      } else if (page.isDead) {
        statusBadge.textContent = 'Dead';
        statusBadge.classList.add('bg-gray-600');
      } else {
        statusBadge.textContent = 'Paused';
        statusBadge.classList.add('bg-yellow-600');
      }
      
      // 如果是固定页面，添加额外标记
      if (page.isPin) {
        const pinBadge = document.createElement('span');
        pinBadge.className = 'px-1 py-0.5 rounded text-xs bg-blue-600 ml-1';
        pinBadge.textContent = 'Pinned';
        pageItem.querySelector('.flex.space-x-1').appendChild(pinBadge);
      }
      
      // 添加点击事件处理
      pageItem.addEventListener('click', () => {
        // 显示详细信息
        debugState.selectedPageId = page.id;
        showPageDetails(page);
      });
      
      elements.pagesList.appendChild(pageItem);
    });
  }
  
  // 显示页面详情
  function showPageDetails(page) {
    elements.pageDetails.classList.remove('hidden');
    
    elements.pageId.textContent = page.id;
    elements.pageUrl.textContent = page.url || 'about:blank';
    elements.pageTitle.textContent = page.title || 'Untitled';
    elements.pageIsRunning.textContent = page.isRunning ? 'Yes' : 'No';
    elements.pageIsDead.textContent = page.isDead ? 'Yes' : 'No';
    elements.pageIsEliminated.textContent = page.isEliminated ? 'Yes' : 'No';
    elements.pageEliminationCount.textContent = page.eliminationCount;
    elements.pageIsPin.textContent = page.isPin ? 'Yes' : 'No';
    
    // 高亮选中的页面
    const pageItems = document.querySelectorAll('.page-item');
    pageItems.forEach(item => {
      if (item.dataset.pageId === page.id) {
        item.classList.add('bg-gray-700');
      } else {
        item.classList.remove('bg-gray-700');
      }
    });
  }
  
  // 添加生命周期事件日志
  function addLifecycleEvent(eventData) {
    // 限制日志条数
    if (debugState.lifecycleEvents.length > 200) {
      debugState.lifecycleEvents.shift();
    }
    
    // 添加时间戳
    const eventWithTimestamp = {
      ...eventData,
      displayTime: new Date(eventData.timestamp).toLocaleTimeString()
    };
    
    // 添加到日志数组
    debugState.lifecycleEvents.push(eventWithTimestamp);
    
    // 更新日志显示
    updateLifecycleLog();
  }
  
  // 更新生命周期日志显示
  function updateLifecycleLog() {
    elements.lifecycleLog.innerHTML = '';
    
    debugState.lifecycleEvents.forEach(event => {
      let logMessage = '';
      const time = `[${event.displayTime}]`;
      
      switch (event.action) {
        case 'create':
          logMessage = `${time} Created page #${event.pageId} with URL: ${event.url}`;
          break;
        case 'switch':
          logMessage = `${time} Switched to page #${event.pageId}`;
          break;
        case 'close':
          logMessage = `${time} Closed page #${event.pageId}`;
          break;
        case 'refresh':
          logMessage = `${time} Refreshed page #${event.pageId}`;
          break;
        case 'update':
          const dataStr = JSON.stringify(event.data, null, 2);
          logMessage = `${time} Updated page #${event.pageId} with data: ${dataStr}`;
          break;
        case 'pin':
          logMessage = `${time} Pinned page #${event.pageId}`;
          break;
        case 'unpin':
          logMessage = `${time} Unpinned page #${event.pageId}`;
          break;
        default:
          logMessage = `${time} Unknown action '${event.action}' on page #${event.pageId}`;
      }
      
      elements.lifecycleLog.innerHTML += logMessage + '\n';
    });
    
    // 滚动到底部
    elements.lifecycleLog.scrollTop = elements.lifecycleLog.scrollHeight;
  }
  
  // 在调试面板被禁用时显示状态
  function showDisabledState() {
    elements.pagesList.innerHTML = '<div class="text-center p-4 text-gray-400">Debug mode is not enabled</div>';
    elements.llpageSize.textContent = '-';
    elements.llpageIsFull.textContent = '-';
    elements.llpageIsEmpty.textContent = '-';
    elements.llpageRunningPage.textContent = '-';
    elements.llpageListSize.textContent = '-';
    elements.llpageLruSize.textContent = '-';
    elements.pageDetails.classList.add('hidden');
  }
  
  // 创建测试标签页
  async function createTestTab() {
    const testUrls = [
      'https://github.com/qddegtya/llpage',
      'https://www.google.com',
      'https://www.github.com',
      'https://www.wikipedia.org',
      'https://www.stackoverflow.com'
    ];
    
    const randomUrl = testUrls[Math.floor(Math.random() * testUrls.length)];
    await window.debugAPI.browser.newTab({ url: randomUrl, active: true });
    
    // 刷新状态
    setTimeout(refreshLLPageState, 500);
  }
  
  // 关闭所有标签页
  async function closeAllTabs() {
    try {
      const result = await window.debugAPI.closeAllTabs();
      console.log('关闭所有标签页结果:', result);
      
      // 刷新状态
      setTimeout(refreshLLPageState, 500);
    } catch (error) {
      console.error('关闭所有标签页失败:', error);
    }
  }
  
  // 清除日志
  function clearLogs() {
    debugState.lifecycleEvents = [];
    elements.lifecycleLog.innerHTML = '';
  }
  
  // 设置事件监听器
  function setupEventListeners() {
    // 刷新状态
    elements.refreshStatus.addEventListener('click', refreshLLPageState);
    
    // 创建测试标签页
    elements.createTestTab.addEventListener('click', createTestTab);
    
    // 关闭所有标签页
    elements.closeAllTabs.addEventListener('click', closeAllTabs);
    
    // 清除日志
    elements.clearLogs.addEventListener('click', clearLogs);
    
    // 监听页面生命周期事件
    window.debugAPI.onPageLifecycle(eventData => {
      addLifecycleEvent(eventData);
      
      // 如果涉及状态变化，刷新状态
      if (['create', 'close', 'pin', 'unpin'].includes(eventData.action)) {
        setTimeout(refreshLLPageState, 100);
      }
    });
  }
});
