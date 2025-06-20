// 浏览器主界面脚本
document.addEventListener('DOMContentLoaded', () => {
  // 浏览器状态管理
  const browserState = {
    tabs: [],
    activeTabId: null,
    isLoading: false,
    isMaximized: false
  };

  // 浏览器元素引用
  const elements = {
    titleBar: document.getElementById('titlebar'),
    minimizeButton: document.getElementById('min-button'), // 修复：使用正确的ID
    maximizeButton: document.getElementById('max-button'), // 修复：使用正确的ID
    restoreButton: document.getElementById('restore-button'),
    closeButton: document.getElementById('close-button'),
    backButton: document.getElementById('back-button'),
    forwardButton: document.getElementById('forward-button'),
    reloadButton: document.getElementById('reload-button'), // 修复：使用正确的ID和属性名
    urlBar: document.getElementById('url-bar'),
    securityIcon: document.getElementById('security-icon'),
    searchButton: document.getElementById('search-button'),
    debugButton: document.getElementById('debug-button'),
    menuButton: document.getElementById('menu-button'),
    newTabButton: document.getElementById('new-tab-button'),
    tabsContainer: document.getElementById('tabs-container'),
    browserContainer: document.getElementById('browser-container'),
    tabTemplate: document.getElementById('tab-template'),
    webviewTemplate: document.getElementById('webview-template'),
    menuPopup: document.getElementById('menu-popup') // 添加菜单弹出层引用
  };

  // 监听来自调试面板的事件
  // 注册调试面板联动事件监听（在初始化时）
  function registerDebugPanelEventListeners() {
    // 监听调试面板标签创建事件
    window.electronAPI.browser.onTabCreated((data) => {
      console.log('从调试面板创建了新标签页:', data);
      createTabAndWebviewFromData(data);
    });
    
    // 监听调试面板关闭所有标签页事件
    window.electronAPI.browser.onCloseAllTabs(() => {
      console.log('从调试面板关闭所有标签页');
      closeAllTabs();
    });
    
    // 监听标签页关闭事件
    window.electronAPI.browser.onTabClosed((data) => {
      console.log('从调试面板关闭标签页:', data.pageId);
      closeTab(data.pageId);
    });
  }
  
  // 从调试面板创建标签页的处理函数
  function createTabAndWebviewFromData(data) {
    // 添加到本地状态
    const tabData = {
      id: data.pageId,
      url: data.url,
      title: data.title || 'New Tab',
      favicon: data.favicon || ''
    };
    
    browserState.tabs.push(tabData);
    browserState.activeTabId = tabData.id;
    
    // 渲染标签页和webview
    renderTab(tabData);
    createWebview(tabData);
    
    // 激活新标签页
    switchToTab(tabData.id);
  }
  
  // 关闭所有标签页
  async function closeAllTabs() {
    // 复制标签页数组，因为在循环中会修改原数组
    const tabsToClose = [...browserState.tabs];
    
    // 关闭每个标签页
    for (const tab of tabsToClose) {
      await closeTab(tab.id);
    }
  }

  // 浏览器操作函数
  async function initBrowser() {
    console.log('正在初始化浏览器...');
    
    let retryCount = 0;
    const maxRetries = 5;
    const retryDelay = 500; // 500ms
    
    while (retryCount < maxRetries) {
      try {
        // 从主进程获取标签页数据
        console.log(`获取现有标签页数据... (尝试 ${retryCount + 1}/${maxRetries})`);
        const response = await window.electronAPI.browser.getAllTabs();
        console.log('收到的标签页数据:', response);
        
        // 检查是否有标签页
        if (!response || response.error || !response.tabs || response.tabs.length === 0) {
          console.log('没有现有标签页，创建默认标签页');
          createNewTab('https://github.com/qddegtya/llpage');
          return;
        }
        
        // 恢复标签页状态
        console.log('恢复标签页状态...');
        browserState.tabs = response.tabs;
        browserState.activeTabId = response.activePageId;
        
        // 渲染标签页
        response.tabs.forEach(tab => {
          renderTab(tab);
          createWebview(tab);
        });
        
        // 设置活动标签页
        if (response.activePageId) {
          console.log('恢复活动标签页:', response.activePageId);
          updateActiveTab(response.activePageId);
          showWebview(response.activePageId);
        } else if (browserState.tabs.length > 0) {
          console.log('无活动标签页，选择第一个');
          const firstTabId = browserState.tabs[0].id;
          updateActiveTab(firstTabId);
          showWebview(firstTabId);
        }
        
        // 成功加载，退出重试循环
        return;
        
      } catch (error) {
        console.error(`初始化浏览器失败 (尝试 ${retryCount + 1}/${maxRetries}):`, error);
        retryCount++;
        
        if (retryCount < maxRetries) {
          console.log(`等待 ${retryDelay}ms 后重试...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    }
    
    // 所有重试都失败，创建默认标签页
    console.warn('所有重试都失败，创建备用默认标签页');
    createNewTab('https://github.com/qddegtya/llpage');
  }

  async function createNewTab(url = 'https://github.com/qddegtya/llpage') {
    console.log('创建新标签页:', url);
    try {
      // 调用主进程create方法
      const response = await window.electronAPI.browser.newTab({ url, active: true });
      console.log('新标签页创建响应:', response);
      
      if (!response || response.error) {
        throw new Error(response ? response.error : '无响应数据');
      }
      
      const pageId = response.pageId;
      if (!pageId) {
        throw new Error('无效的标签页ID');
      }
      
      // 添加到本地状态 
      const newTab = { id: pageId, url: url, title: response.title || 'New Tab', favicon: response.favicon || '' };
      
      // 检查是否已存在此标签页
      const existingTabIndex = browserState.tabs.findIndex(tab => tab.id === pageId);
      if (existingTabIndex >= 0) {
        // 更新现有标签页
        browserState.tabs[existingTabIndex] = newTab;
      } else {
        // 添加新标签页
        browserState.tabs.push(newTab);
      }
      
      browserState.activeTabId = pageId;
      
      // 渲染标签页和webview
      renderTab(newTab);
      createWebview(newTab);
      
      // 激活新标签页
      switchToTab(pageId);
      return newTab;
    } catch (error) {
      console.error('创建新标签页失败:', error);
      
      // 创建一个本地标签页作为备用
      const fallbackId = `local-tab-${Date.now()}`;
      const fallbackTab = {
        id: fallbackId,
        url: url,
        title: 'New Tab',
        favicon: ''
      };
      
      browserState.tabs.push(fallbackTab);
      browserState.activeTabId = fallbackId;
      
      renderTab(fallbackTab);
      createWebview(fallbackTab);
      
      return fallbackTab;
    }
  }

  async function switchToTab(tabId) {
    console.log('switchToTab调用:', tabId);
    
    // 触发llpage切换
    const { success, pageData } = await window.electronAPI.browser.switchTab(tabId);
    
    console.log('IPC切换结果:', { success, pageData, tabId });
    
    if (success) {
      console.log('IPC成功，更新UI状态');
      // 更新本地状态
      browserState.activeTabId = tabId;
      
      // 更新UI
      updateActiveTab(tabId);
      showWebview(tabId);
      
      // 更新浏览器控制元素
      const tab = browserState.tabs.find(tab => tab.id === tabId);
      if (tab) {
        updateBrowserControls(tab);
      }
    } else {
      console.error('IPC切换失败:', tabId);
    }
  }

  async function closeTab(tabId) {
    const result = await window.electronAPI.browser.closeTab(tabId);
    
    if (result.success) {
      // 从DOM中移除标签页和webview
      removeTabElement(tabId);
      removeWebviewElement(tabId);
      
      // 更新本地状态
      browserState.tabs = browserState.tabs.filter(tab => tab.id !== tabId);
      
      // 如果关闭的是当前活动标签页，则切换到新的活动标签页
      if (result.newActiveId && result.newActiveId !== tabId) {
        browserState.activeTabId = result.newActiveId;
        updateActiveTab(result.newActiveId);
        showWebview(result.newActiveId);
      }
      
      // 如果没有剩余标签页，创建一个新的
      if (browserState.tabs.length === 0) {
        createNewTab();
      }
    }
  }

  async function reloadActiveTab() {
    if (!browserState.activeTabId) return;
    
    await window.electronAPI.browser.refreshTab(browserState.activeTabId);
    // refreshWebview 事件会由主进程通过IPC触发，进而调用webview的reload()方法
  }

  function navigateTo(inputUrl) {
    if (!browserState.activeTabId) return;
    
    // 处理URL格式
    let url = inputUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('file://')) {
      // 检测是否是域名格式或IP地址
      if (url.includes('.') && !url.includes(' ')) {
        url = 'https://' + url;
      } else {
        // 将其视为搜索查询
        url = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
      }
    }
    
    // 更新标签页数据
    window.electronAPI.browser.updateTabData(browserState.activeTabId, { url, loading: true });
    
    // 导航到URL
    const webview = getWebviewById(browserState.activeTabId);
    if (webview) {
      webview.src = url;
    }
  }

  // UI辅助函数
  function renderTab(tab) {
    const tabElement = elements.tabTemplate.content.cloneNode(true).querySelector('.tab');
    tabElement.dataset.tabId = tab.id;
    
    // 设置标题
    const titleElement = tabElement.querySelector('.title');
    titleElement.textContent = tab.title || 'New Tab';
    
    // 设置favicon
    const faviconElement = tabElement.querySelector('.favicon');
    if (tab.favicon) {
      faviconElement.innerHTML = `<img src="${tab.favicon}" class="w-4 h-4" />`;
    }
    
    // 设置活动状态
    if (tab.id === browserState.activeTabId) {
      tabElement.classList.add('active', 'bg-gray-700', 'text-white');
      tabElement.classList.remove('bg-gray-800', 'text-gray-300');
    }
    
    // 只添加关闭按钮的事件监听器
    tabElement.querySelector('.close-tab-btn').addEventListener('click', handleCloseTabClick);
    
    // 添加到标签栏
    elements.tabsContainer.insertBefore(tabElement, elements.newTabButton);
    
    // 设置拖拽功能（包含点击处理）
    setupTabDragging(tabElement);
  }

  function createWebview(tab) {
    const webviewElement = elements.webviewTemplate.content.cloneNode(true).querySelector('webview');
    webviewElement.dataset.webviewId = tab.id;
    
    // 设置webview属性 - 加入更多必要属性以确保正确渲染
    webviewElement.setAttribute('src', tab.url || 'about:blank');
    webviewElement.setAttribute('partition', 'persist:main');
    webviewElement.setAttribute('allowpopups', '');
    webviewElement.setAttribute('webpreferences', 'nodeIntegration=no, contextIsolation=yes, enableRemoteModule=no');
    
    // 确保消除所有webview的隐藏状态，让它先加载
    webviewElement.classList.remove('hidden');
    
    // 添加事件监听器
    webviewElement.addEventListener('did-start-loading', () => {
      // 开始加载
      window.electronAPI.browser.updateTabData(tab.id, { loading: true });
      console.log(`开始加载页面: ${tab.url}`);
    });
    
    webviewElement.addEventListener('did-navigate', handleWebviewNavigation);
    webviewElement.addEventListener('did-navigate-in-page', handleWebviewNavigation);
    webviewElement.addEventListener('page-title-updated', handleWebviewTitleUpdate);
    webviewElement.addEventListener('page-favicon-updated', handleWebviewFaviconUpdate);
    webviewElement.addEventListener('did-finish-load', handleWebviewDidFinishLoad);
    webviewElement.addEventListener('did-fail-load', handleWebviewDidFailLoad);
    webviewElement.addEventListener('dom-ready', () => {
      console.log(`DOM ready for page: ${tab.url}`);
      // DOM准备好后再次检查活动状态
      if (tab.id === browserState.activeTabId) {
        showWebview(tab.id);
      } else {
        webviewElement.classList.add('hidden');
      }
    });
    
    // 添加到浏览器容器
    elements.browserContainer.appendChild(webviewElement);
    
    // 如果是当前活动标签，显示它
    if (tab.id === browserState.activeTabId) {
      showWebview(tab.id);
    }
  }

  function updateActiveTab(tabId) {
    console.log('updateActiveTab调用:', tabId);
    
    // 移除所有标签页的active类
    document.querySelectorAll('.tab').forEach(tab => {
      tab.classList.remove('active', 'bg-gray-700', 'text-white');
      tab.classList.add('bg-gray-800', 'text-gray-300');
    });
    
    // 为活动标签页添加active类
    const activeTabElement = document.querySelector(`.tab[data-tab-id="${tabId}"]`);
    console.log('找到的活动标签页元素:', activeTabElement, 'tabId:', tabId);
    
    if (activeTabElement) {
      activeTabElement.classList.add('active', 'bg-gray-700', 'text-white');
      activeTabElement.classList.remove('bg-gray-800', 'text-gray-300');
      
      // 确保活动标签页可见（滚动到它）
      activeTabElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      console.log('标签页UI状态已更新');
    } else {
      console.error('未找到标签页元素，tabId:', tabId);
    }
  }

  function showWebview(tabId) {
    console.log('showWebview调用:', tabId);
    
    // 隐藏所有webview
    document.querySelectorAll('webview').forEach(webview => {
      webview.classList.add('hidden');
    });
    
    // 显示当前活动webview
    const activeWebview = getWebviewById(tabId);
    console.log('找到的活动webview元素:', activeWebview, 'tabId:', tabId);
    
    if (activeWebview) {
      activeWebview.classList.remove('hidden');
      console.log('webview显示状态已更新');
    } else {
      console.error('未找到webview元素，tabId:', tabId);
    }
  }

  function updateTabTitle(tabId, title) {
    const tabElement = document.querySelector(`.tab[data-tab-id="${tabId}"]`);
    if (tabElement) {
      const titleElement = tabElement.querySelector('.title');
      if (titleElement) {
        titleElement.textContent = title || 'New Tab';
      }
    }
  }

  function updateTabFavicon(tabId, faviconUrl) {
    const tabElement = document.querySelector(`.tab[data-tab-id="${tabId}"]`);
    if (tabElement) {
      const faviconElement = tabElement.querySelector('.favicon');
      if (faviconElement) {
        faviconElement.innerHTML = `<img src="${faviconUrl}" class="w-4 h-4" />`;
      }
    }
  }

  function updateBrowserControls(tabData) {
    // 更新地址栏
    if (tabData.url) {
      elements.urlBar.value = tabData.url;
    }
    
    // 更新安全图标
    if (tabData.url) {
      updateSecurityIcon(tabData.url);
    }
    
    // 更新前进/后退按钮状态
    elements.backButton.disabled = !tabData.canGoBack;
    elements.forwardButton.disabled = !tabData.canGoForward;
    
    // 更新重新加载按钮图标（加载中或已加载完成）
    if (tabData.loading) {
      elements.reloadButton.querySelector('i').classList.remove('mdi-reload');
      elements.reloadButton.querySelector('i').classList.add('mdi-close');
    } else {
      elements.reloadButton.querySelector('i').classList.remove('mdi-close');
      elements.reloadButton.querySelector('i').classList.add('mdi-reload');
    }
  }

  function updateSecurityIcon(url) {
    try {
      const protocol = new URL(url).protocol;
      
      if (protocol === 'https:') {
        elements.securityIcon.classList.remove('mdi-shield-outline', 'mdi-shield-off-outline', 'text-gray-400');
        elements.securityIcon.classList.add('mdi-shield-check-outline', 'text-green-500');
      } else if (protocol === 'http:') {
        elements.securityIcon.classList.remove('mdi-shield-check-outline', 'mdi-shield-off-outline', 'text-green-500');
        elements.securityIcon.classList.add('mdi-shield-outline', 'text-yellow-500');
      } else {
        elements.securityIcon.classList.remove('mdi-shield-check-outline', 'mdi-shield-outline', 'text-green-500', 'text-yellow-500');
        elements.securityIcon.classList.add('mdi-shield-off-outline', 'text-gray-400');
      }
    } catch (e) {
      elements.securityIcon.classList.remove('mdi-shield-check-outline', 'mdi-shield-outline', 'text-green-500', 'text-yellow-500');
      elements.securityIcon.classList.add('mdi-shield-off-outline', 'text-gray-400');
    }
  }

  function updateMaximizeRestoreButtons(isMaximized) {
    browserState.isMaximized = isMaximized;
    
    if (isMaximized) {
      elements.maxButton.classList.add('hidden');
      elements.restoreButton.classList.remove('hidden');
    } else {
      elements.maxButton.classList.remove('hidden');
      elements.restoreButton.classList.add('hidden');
    }
  }

  function removeTabElement(tabId) {
    const tabElement = document.querySelector(`.tab[data-tab-id="${tabId}"]`);
    if (tabElement) {
      tabElement.remove();
    }
  }

  function removeWebviewElement(tabId) {
    const webviewElement = getWebviewById(tabId);
    if (webviewElement) {
      webviewElement.remove();
    }
  }

  function getWebviewById(tabId) {
    return document.querySelector(`webview[data-webview-id="${tabId}"]`);
  }

  function updateTabUI(tabId, tabData) {
    const tabElement = document.querySelector(`.tab[data-tab-id="${tabId}"]`);
    if (!tabElement) return;
    
    // 更新标题
    if (tabData.title !== undefined) {
      updateTabTitle(tabId, tabData.title);
    }
    
    // 更新favicon
    if (tabData.favicon !== undefined) {
      updateTabFavicon(tabId, tabData.favicon);
    }
    
    // 更新加载状态
    if (tabData.loading !== undefined) {
      if (tabData.loading) {
        tabElement.classList.add('loading');
      } else {
        tabElement.classList.remove('loading');
      }
    }
  }

  // 标签拖拽排序功能
  function setupTabDragging(tabElement) {
    let startX = 0;
    let startY = 0;
    let startTime = 0;
    let isDragging = false;
    
    // 鼠标按下事件
    tabElement.addEventListener('mousedown', (e) => {
      // 如果点击的是关闭按钮，不处理
      if (e.target.closest('.close-tab-btn')) {
        return;
      }
      
      startX = e.clientX;
      startY = e.clientY;
      startTime = Date.now();
      isDragging = false;
      
      // 阻止默认行为但不阻止事件冒泡
      e.preventDefault();
    });
    
    // 简单的点击事件处理
    tabElement.addEventListener('click', (e) => {
      // 如果点击的是关闭按钮，不处理
      if (e.target.closest('.close-tab-btn')) {
        return;
      }
      
      const tabId = tabElement.dataset.tabId;
      console.log('直接点击事件:', tabId);
      switchToTab(tabId);
    });
    
    // 禁用原生拖拽
    tabElement.draggable = false;
  }

  // 设置事件监听器
  function setupEventListeners() {
    console.log('设置事件监听器...');
    
    // 页面控制事件 - 确保元素存在才绑定事件
    if (elements.urlBar) {
      elements.urlBar.addEventListener('keydown', handleUrlSubmit);
    }
    
    if (elements.backButton) {
      elements.backButton.addEventListener('click', handleBackClick);
    }
    
    if (elements.forwardButton) {
      elements.forwardButton.addEventListener('click', handleForwardClick);
    }
    
    if (elements.reloadButton) {
      elements.reloadButton.addEventListener('click', handleReloadClick);
    }
    
    if (elements.newTabButton) {
      elements.newTabButton.addEventListener('click', handleNewTabClick);
    }
    
    // 窗口控制事件
    if (elements.minimizeButton) {
      elements.minimizeButton.addEventListener('click', handleWindowMinimize);
    }
    
    if (elements.maximizeButton) {
      elements.maximizeButton.addEventListener('click', handleWindowMaximizeRestore);
    }
    
    if (elements.restoreButton) {
      elements.restoreButton.addEventListener('click', handleWindowMaximizeRestore);
    }
    
    if (elements.closeButton) {
      elements.closeButton.addEventListener('click', handleWindowClose);
    }
    
    // 菜单事件
    if (elements.menuButton) {
      elements.menuButton.addEventListener('click', handleMenuClick);
    }
    
    if (elements.debugButton) {
      elements.debugButton.addEventListener('click', handleDebugClick);
    }
    
    // 标签页事件 - 使用事件委托
    if (elements.tabsContainer) {
      // 标签点击
      elements.tabsContainer.addEventListener('click', handleTabClick);
      
      // 关闭按钮点击
      elements.tabsContainer.addEventListener('click', function(event) {
        if (event.target.closest('.close-tab-btn')) { // 修复：使用正确的类名
          handleCloseTabClick(event);
        }
      });
    }
    
    // 注册IPC事件监听器
    if (window.electronAPI && window.electronAPI.browser) {
      console.log('注册 IPC 事件监听器...');
      
      if (window.electronAPI.browser.onTabActivated) {
        window.electronAPI.browser.onTabActivated(handleTabActivated);
      }
      
      if (window.electronAPI.browser.onTabDataUpdated) {
        window.electronAPI.browser.onTabDataUpdated(handleTabDataUpdated);
      }
      
      if (window.electronAPI.browser.onRefreshWebview) {
        window.electronAPI.browser.onRefreshWebview(handleRefreshWebview);
      }
      
      // 注册浏览器动作监听器
      if (window.electronAPI.browser.onAction) {
        window.electronAPI.browser.onAction((action) => {
          switch (action) {
            case 'new-tab':
              createNewTab();
              break;
            case 'close-tab':
              if (browserState.activeTabId) {
                closeTab(browserState.activeTabId);
              }
              break;
            case 'reload':
              reloadActiveTab();
              break;
            case 'toggle-debug':
              handleDebugClick();
              break;
          }
        });
      }
    } else {
      console.error('electronAPI 或 browser API 不可用');
    }
  }

  // 事件处理器
  function handleUrlSubmit(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      navigateTo(elements.urlBar.value);
    }
  }

  function handleTabClick(event) {
    const tabElement = event.target.closest('.tab');
    if (!tabElement) return;
    
    const tabId = tabElement.dataset.tabId;
    switchToTab(tabId);
  }

  function handleCloseTabClick(event) {
    event.stopPropagation();
    const tabElement = event.target.closest('.tab');
    if (!tabElement) return;
    
    const tabId = tabElement.dataset.tabId;
    closeTab(tabId);
  }

  function handleNewTabClick() {
    createNewTab();
  }

  function handleReloadClick() {
    reloadActiveTab();
  }

  function handleBackClick() {
    if (!browserState.activeTabId) return;
    
    const webview = getWebviewById(browserState.activeTabId);
    if (webview && webview.canGoBack()) {
      webview.goBack();
    }
  }

  function handleForwardClick() {
    if (!browserState.activeTabId) return;
    
    const webview = getWebviewById(browserState.activeTabId);
    if (webview && webview.canGoForward()) {
      webview.goForward();
    }
  }

  function handleDebugClick() {
    window.electronAPI.browser.toggleDebugWindow();
  }

  function handleMenuClick() {
    elements.menuPopup.classList.toggle('hidden');
  }

  function handleWebviewNavigation(event) {
    const webview = event.target;
    const tabId = webview.dataset.webviewId;
    const url = event.url;
    
    // 更新标签页数据
    window.electronAPI.browser.updateTabData(tabId, {
      url,
      loading: true
    });
    
    // 更新地址栏
    if (tabId === browserState.activeTabId) {
      elements.urlBar.value = url;
    }
  }

  function handleWebviewTitleUpdate(event) {
    const webview = event.target;
    const tabId = webview.dataset.webviewId;
    const title = event.title;
    
    window.electronAPI.browser.updateTabData(tabId, { title });
    updateTabTitle(tabId, title);
  }

  function handleWebviewFaviconUpdate(event) {
    const webview = event.target;
    const tabId = webview.dataset.webviewId;
    const favicons = event.favicons;
    
    if (favicons && favicons.length > 0) {
      window.electronAPI.browser.updateTabData(tabId, { favicon: favicons[0] });
      updateTabFavicon(tabId, favicons[0]);
    }
  }

  function handleWebviewDidFinishLoad(event) {
    const webview = event.target;
    const tabId = webview.dataset.webviewId;
    
    window.electronAPI.browser.updateTabData(tabId, { 
      loading: false,
      canGoBack: webview.canGoBack(),
      canGoForward: webview.canGoForward()
    });
    
    if (tabId === browserState.activeTabId) {
      elements.backButton.disabled = !webview.canGoBack();
      elements.forwardButton.disabled = !webview.canGoForward();
      updateSecurityIcon(webview.getURL());
    }
  }

  function handleWebviewDidFailLoad(event) {
    const webview = event.target;
    const tabId = webview.dataset.webviewId;
    
    window.electronAPI.browser.updateTabData(tabId, { 
      loading: false,
      error: { 
        code: event.errorCode,
        description: event.errorDescription
      }
    });
  }

  function handleTabActivated(data) {
    switchToTab(data.id);
  }

  function handleTabDataUpdated(data) {
    const { pageId, data: tabData } = data;
    
    // 更新标签页UI
    updateTabUI(pageId, tabData);
    
    // 如果是当前活动标签页，更新浏览器控制元素
    if (pageId === browserState.activeTabId) {
      updateBrowserControls(tabData);
    }
  }

  function handleRefreshWebview(pageId) {
    const webview = getWebviewById(pageId);
    if (webview) {
      webview.reload();
    }
  }

  function handleWindowClose() {
    window.electronAPI.window.close();
  }

  function handleWindowMinimize() {
    window.electronAPI.window.minimize();
  }

  function handleWindowMaximizeRestore() {
    window.electronAPI.window.maximize();
  }

  // 初始化浏览器
  initBrowser();

  // 注册所有事件监听器
  setupEventListeners();
  
  // 注册调试面板事件监听器
  registerDebugPanelEventListeners();
});
