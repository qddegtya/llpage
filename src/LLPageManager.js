import { MAX_SIZE } from './constants'
import Page from './Page'
import { CircularDoublyLinkedList } from '@humanwhocodes/circular-doubly-linked-list'
import { LRUMap } from 'lru_map'
import { functional } from 'xajs'

// 对于动态伸缩的容器，用 size 属性可能更好一些
const defaultOpts = {
  size: MAX_SIZE
}

class LLPageManager {
  constructor({ size = MAX_SIZE } = defaultOpts) {
    this.size = size
    this.pageList = new CircularDoublyLinkedList()
    this.runningPage = null
    this.lruMap = new LRUMap(size)
  }

  // 是否已满
  get isFull() {
    return this.size === this.pageList.size
  }

  // 是否为空
  get isEmpty() {
    return this.pageList.size === 0
  }

  _checkPageIns(page) {
    if (!(page instanceof Page)) {
      throw new Error(
        'page must be instanceof `Page`, use `createPage` first.'
      )
    }
  }

  _genLruCacheKeyName(page) {
    return `llpage-${page.id}`
  }

  _rsr(page) {
    const _invoke = functional.helper
      .intercepter(page.hooks.onResume)
      .before(page.hooks.onRestart)
      .before(page.hooks.onStart).$asyncRunner

    // RSR
    _invoke()
  }

  _csr(page) {
    const _invoke = functional.helper
      .intercepter(page.hooks.onResume)
      .before(page.hooks.onCreate)
      .before(page.hooks.onStart).$asyncRunner

    // CSR
    _invoke()
  }

  _openPage(page) {
    // 被打开过且当前状态是销毁状态
    if (page.hasBeenOpened && page.isDead) {
      this._rsr(page)
    } else {
      this._csr(page)
    }

    page._resurgence()
    page._addCount()
  }

  _closePage(page) {
    const _invoke = functional.helper
      .intercepter(page.hooks.onDestroy)
      .before(page.hooks.onStop).$asyncRunner

    _invoke()
    page._kill()
  }

  switchToPage(page) {
    // 如果当前切换的页面就是正在运行中的页面
    if (page.isRunning) return

    const _invoke = functional.helper
      .intercepter(page.hooks.onResume)
      .before(this.runningPage.hooks.onPause).$asyncRunner

    _invoke()
  }

  open(page) {
    this._checkPageIns(page)
    page.bindContext(this)

    // 查找是否存在这个 page
    // 并且触发一次 lru 访问
    const existingPage = this.lruMap.get(this._genLruCacheKeyName(page))

    // 如果链表已达到保活最大长度值
    if (this.isFull) {
      if (existingPage) {
        // A B C! D E
        // open C
        // 如果存在该页面，并且也在运行中，则不做任何处理
        if (existingPage.isRunning) return

        // 对目前在运行中的页面触发 onPause
        // A B C! D E
        // open A ->
        // A! B C D E
        // 对这个存在的页面重新激活，触发 onResume
        this.switchToPage(existingPage)
        this.runningPage = existingPage
      } else {
        let _lastDeletedindex

        // 如果不存在该 page
        // 则启用 LRU 策略进行淘汰
        const oldestPage = this.lruMap.oldest.value

        // 淘汰掉一个老页面
        this._closePage(oldestPage)
        // 并且将当前页面 pause
        this.runningPage.hooks.onPause()

        // 将旧页面从缓存中删除
        this.lruMap.delete(this._genLruCacheKeyName(oldestPage))
        _lastDeletedindex = this.pageList.indexOf(oldestPage)

        // 变更 runningPage
        this.runningPage = page

        // 唤起新页面
        this._openPage(page)

        // 先将新页面插入到链表
        this.pageList.insertBefore(page, _lastDeletedindex)

        // 将旧页面从链表中删除
        this.pageList.remove(_lastDeletedindex + 1)

        // 缓存更新
        this.lruMap.set(this._genLruCacheKeyName(page), page)
      }
    } else {
      this.lruMap.set(this._genLruCacheKeyName(page), page)

      // 没有满的时候应该是依次插入到链表中去的
      if (this.isEmpty) {
        // open A ->
        // A
        // 初始化空的时候
        this.runningPage = page

        this._openPage(page)

        // 插入到链表尾部
        this.pageList.add(page)
      } else {
        // 如果此前存在这个 page
        if (existingPage) {
          this.switchToPage(existingPage)
          this.runningPage = existingPage
        } else {
          // A B C!
          // open D ->
          // A B C D!
          this.runningPage.hooks.onPause()

          // 依次触发 onCreate && onStart
          this.runningPage = page
          this._openPage(page)

          // 插入到链表尾部
          this.pageList.add(page)
        }
      }
    }
  }

  findPage(page) {
    return this.pageList.indexOf(page) >= 0 ? page : undefined
  }

  close(page) {
    if (this.isEmpty) return

    this._checkPageIns(page)
    page.bindContext(this)

    // 查找是否存在这个 page
    const existingPage = this.findPage(page)

    if (!existingPage) throw new Error('can not close nonexistent page.')

    // 如果只有一个节点
    if (this.pageList.size === 1) {
      // 直接关闭即可
      this._closePage(existingPage)

      this.runningPage = null
    } else {
      // 获取链表位置
      const _idx = this.pageList.indexOf(existingPage)

      // 如果此时在尾部
      if (_idx === this.pageList.size - 1) {
        // 取前链表节点
        const _preNode = this.pageList.get(_idx - 1)
        this.runningPage = _preNode
        _preNode.hooks.onResume()
      } else {
        // 默认移除后，后续节点前移
        // 取后链表节点
        const _nextNode = this.pageList.get(_idx + 1)
        this.runningPage = _nextNode
        _nextNode.hooks.onResume()
      }

      // 关闭
      this._closePage(existingPage)
    }

    // 从链表里将这个 page 删除
    this.pageList.remove(this.pageList.indexOf(page))
    // 从缓存里删除
    this.lruMap.delete(this._genLruCacheKeyName(page))
  }

  closeAll() {
    if (this.isEmpty) return

    this.runningPage = null

    // 依次直接关闭，过程中已不需要再触发 onResume 等 hook
    this._closeRemainingPages()

    // 清空缓存
    this.lruMap.clear()

    // 清空链表
    this.pageList.clear()
  }

  _clearRemainingStatus() {
    const remainingPages = [...this.pageList.reverse()]
    remainingPages.forEach(pageNode => {
      this.pageList.remove(this.pageList.indexOf(pageNode))
      this.lruMap.delete(this._genLruCacheKeyName(pageNode))
    })
  }

  _closeRemainingPages() {
    // 从尾部开始执行
    const remainingPages = [...this.pageList.reverse()]
    remainingPages.forEach(pageNode => {
      this._closePage(pageNode)
    })
  }

  closeOthers(page) {
    if (this.isEmpty) return

    this._checkPageIns(page)
    page.bindContext(this)

    // 查找是否存在这个 page
    const existingPage = this.findPage(page)

    if (!existingPage) throw new Error('can not leave nonexistent page.')

    // 如果 page 在 running
    // 并且此时只有一个节点
    if (page.isRunning && this.pageList.size === 1) return

    this.runningPage = page

    // 只有命中非 running 目标，才触发 onResume
    if (!page.isRunning) page.hooks.onResume()

    // 先将自己从链表移除
    this.pageList.remove(this.pageList.indexOf(page))

    // 随后依次触发剩余节点的 onStop onDestroy
    this._closeRemainingPages()

    // 将余下的节点全部从链表和 lru 中清除
    this._clearRemainingStatus()

    // 再将自己添加回到链表中
    this.pageList.add(page)
  }

  refresh(page) {
    // 查找是否存在这个 page
    const existingPage = this.findPage(page)

    if (!existingPage) throw new Error('can not refresh nonexistent page.')

    // 刷新页面不更新链表状态
    // 不更新 runningPage
    // 直接头尾 hook 执行
    const _invoke = functional.helper
      .intercepter(page.hooks.onCreate)
      .before(page.hooks.onDestroy).$asyncRunner

    _invoke()

    // 更新缓存
    this.lruMap.set(this._genLruCacheKeyName(page), page)
  }
}

export default LLPageManager
