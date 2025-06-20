const { Menu, app } = require('electron');

function setup() {
  // 定义菜单模板，但在实际UI中通过自定义界面替代菜单栏
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Tab',
          accelerator: 'CmdOrCtrl+T',
          click: (_, browserWindow) => {
            if (browserWindow) {
              browserWindow.webContents.send('browser:action', 'new-tab');
            }
          }
        },
        {
          label: 'New Window',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            // 创建新窗口
          }
        },
        { type: 'separator' },
        {
          label: 'Close Tab',
          accelerator: 'CmdOrCtrl+W',
          click: (_, browserWindow) => {
            if (browserWindow) {
              browserWindow.webContents.send('browser:action', 'close-tab');
            }
          }
        },
        { 
          role: 'quit',
          accelerator: 'CmdOrCtrl+Q' 
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'delete' },
        { type: 'separator' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: (_, browserWindow) => {
            if (browserWindow) {
              browserWindow.webContents.send('browser:action', 'reload');
            }
          }
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
          click: (_, browserWindow) => {
            if (browserWindow) {
              browserWindow.webContents.toggleDevTools();
            }
          }
        },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Debug',
      submenu: [
        {
          label: 'Toggle LLPage Debug Panel',
          accelerator: 'CmdOrCtrl+Shift+D',
          click: (_, browserWindow) => {
            if (browserWindow) {
              browserWindow.webContents.send('browser:action', 'toggle-debug');
            }
          }
        }
      ]
    }
  ];

  // macOS特有菜单项
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    });
  }

  // 创建菜单
  const menu = Menu.buildFromTemplate(template);
  
  // 设置应用菜单
  Menu.setApplicationMenu(menu);
}

module.exports = { setup };
