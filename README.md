# llpage

> 🚀 page operation model (in memory) with LRU & lifecycle strategy.

![屏幕快照 2019-02-13 下午5.25.56.png](https://intranetproxy.alipay.com/skylark/lark/0/2019/png/1429/1550050126197-a6728f55-56a7-46f7-9427-ae0f56095c7b.png) 

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

#### open

#### close

#### closeAll

#### closeOthers

### lifecycle

#### onCreate

#### onStart

#### onResume

#### onPause

#### onStop

#### onDestroy

#### onRestart

### TODO

* 合并成一个链表模型
