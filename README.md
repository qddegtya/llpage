# llpage

> 🚀 page operation model (in memory) with LRU & lifecycle strategy.

![model](https://user-images.githubusercontent.com/773248/52936637-b8803900-3397-11e9-834f-f5bb76776663.png) 

### Quick Start

```javascript
import { createLLPageManager, createPage } from 'llpage'

const testPage = createPage({
  data: {},

  onCreate() {
    // do something
  }

  onStart() {
    // do something
  }
})

const ll = createLLPageManager({
  size: 10
})

// open page
ll.open(testPage)

// close page
ll.close(testPage)

// close others
ll.closeOthers(testPage)

// close all
ll.closeAll()
```

### API

### top api

#### createLLPageManager

> 创建一个 llpage 管理容器

#### createPage

> 创建一个页面对象

### manager instance api

#### open

> 打开一个页面

#### close

> 关闭某个页面

#### closeAll

> 关闭所有页面

#### closeOthers

> 关闭其他页面

#### refresh

> 刷新页面

### page lifecycle

#### onCreate

> 在页面对象被激活时执行

#### onStart

> 在页面对象被激活后，即将开始 running 时执行

#### onResume

> 在页面对象被隐藏后重新激活时执行

#### onPause

> 在页面对象被隐藏时执行

#### onStop

> 在页面对象被销毁前执行

#### onDestroy

> 在页面对象被销毁时执行

#### onRestart

> 当页面对象曾经被打开过，并且当前处于 dead 状态中，这个时候被重新激活时执行

### Run Example

![preview](https://user-images.githubusercontent.com/773248/52936756-1f055700-3398-11e9-843a-1899dba7c36a.gif)

* [How to run](./examples/README.md)
