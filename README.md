# llpage

> 🚀 page operation model (in memory) with LRU & lifecycle strategy.

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
