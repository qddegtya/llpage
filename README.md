# llpage

> 🚀 page operation model (in memory) with LRU & lifecycle strategy.

![屏幕快照 2019-02-13 下午5.25.56.png](https://intranetproxy.alipay.com/skylark/lark/0/2019/png/1429/1550050126197-a6728f55-56a7-46f7-9427-ae0f56095c7b.png) 

# Quick Start

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

# API

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

# Run Example

* [How to run](./examples/README.md)
