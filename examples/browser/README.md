# LLPage Electron Browser

A high-performance, feature-rich Electron browser built on top of the LLPage library for efficient tab lifecycle management.

## Features

- **Custom UI**: Sleek, modern interface with frameless window design and custom title bar
- **Intelligent Tab Management**: Leverages LLPage for efficient tab lifecycle management with LRU caching
- **Drag-and-Drop Tab Sorting**: Reorder tabs with drag-and-drop functionality
- **Debug Panel**: Advanced debug panel for visualizing LLPage internal state and tab lifecycle events
- **Resource Optimization**: Utilizes LLPage's page elimination mechanism to minimize memory usage
- **Full Screen Mode**: Immersive browsing experience with maximized screen real estate
- **Custom URL Bar**: Feature-rich address bar with security indicators

## Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn

### Installation

1. Clone the repository
```
git clone https://github.com/qddegtya/llpage.git
cd llpage
```

2. Install dependencies
```
# Install llpage dependencies
npm install

# Install browser example dependencies
cd examples/browser
npm install
```

3. Run the application
```
# In development mode
npm run dev

# With debug panel
npm run dev -- --debug
```

### Building

```
npm run build
```

## Architecture

### Main Process

The main process is responsible for:
- Window management (main browser window & debug window)
- LLPage manager initialization and lifecycle management
- IPC communication with renderer processes
- Protocol registration

### Renderer Process

The renderer process handles:
- Browser UI rendering and interaction
- Tab management and synchronization with LLPage
- Webview control and event handling
- Debug panel visualization

### Preload Scripts

Security-focused preload scripts expose only necessary APIs to the renderer:
- `preload.js`: Browser tab management and window controls
- `debug-preload.js`: Debug panel APIs and lifecycle event listeners

## LLPage Integration

This browser example demonstrates how to leverage LLPage's powerful page lifecycle management:

- Each tab is represented as a LLPage "page" with full lifecycle hooks
- Tab states (active, inactive, eliminated) are synchronized with LLPage states
- LRU caching ensures efficient resource management by eliminating least recently used tabs
- Pinned tabs remain in memory regardless of LRU position

## Debug Panel

The debug panel provides visibility into LLPage's internal workings:
- Real-time LLPage manager state
- Page list with detailed properties
- Lifecycle event log with timestamps
- Testing tools for creating and closing tabs

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with [LLPage](https://github.com/qddegtya/llpage)
- Powered by [Electron](https://www.electronjs.org/)
- UI styled with [TailwindCSS](https://tailwindcss.com/)
