import React, { Component, PureComponent } from 'react'
import ReactDOM from 'react-dom'
import { createPage, createLLPageManager } from 'llpage'

const sleep = (ms) => {
  return new Promise((a, b) => {
    setTimeout(a, ms)
  })
}

const ll = createLLPageManager({
  size: 5
})

const options = {
  data: {},
  
  onCreate () {
    console.log(`page: ${this.id} 将被创建`)
  },

  onStart () {
    console.log(`page: ${this.id} 将被启动`)
  },

  onPause() {
    console.log(`page ${this.id} 被暂停`)
  },

  onResume () {
    console.log(`page ${this.id} 重新激活`)
  },

  onStop () {
    console.log(`page ${this.id} 停止`)
  },

  onDestroy () {
    console.log(`page ${this.id} 将被销毁`)
  },

  onRestart () {
    console.log(`page ${this.id} 重启`)
  }
}

const page1 = createPage(options)
const page2 = createPage(options)
const page3 = createPage(options)

console.dir(ll)

class MultiTabExample extends Component {
  render () {
    return <span>{`欢迎`}</span>
  }

  async componentDidMount() {
    console.log('<====== 新建三个窗口 ======>')

    ll.open(page1)

    await sleep(1000)
    ll.open(page2)

    await sleep(1000)
    ll.open(page3)

    console.log('<====== 激活窗口 1 ======>')

    await sleep(1000)
    ll.open(page1)

    console.log('<====== 关闭窗口 3 ======>')

    await sleep(2000)
    ll.close(page3)

    console.log('<====== 关闭窗口 2 之外的窗口 ======>')

    await sleep(2000)
    ll.closeOthers(page2)

    console.log('<====== 全部关闭 ======>')

    await sleep(2000)
    ll.closeAll()
  }
}

ReactDOM.render(<MultiTabExample />, document.getElementById('example'))
