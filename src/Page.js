import { NOOP, DATA_KEY } from './constants'

const defaultOpts = {
  [DATA_KEY]: {},
  onCreate: NOOP,
  onStart: NOOP,
  onResume: NOOP,
  onPause: NOOP,
  onStop: NOOP,
  onDestroy: NOOP,
  onRestart: NOOP
}

const LIFE_CYCLE_HOOKS = Object.keys(defaultOpts).filter(k => k !== DATA_KEY)

class Page {
  // TODO: pool (内部池化)
  constructor(id, opts = {}) {
    this._id = id
    this.hooks = {}
    this._ctx = null
    this._count = 0
    this._isDead = false
    this._init(Object.assign({}, defaultOpts, opts))
  }

  _init(opts) {
    for (let k in opts) {
      if (LIFE_CYCLE_HOOKS.indexOf(k) >= 0) {
        const hookFunction = opts[k]
        if (typeof hookFunction === 'function') {
          this.hooks[k] = hookFunction.bind(this)
        } else {
          throw new Error('lifecycle must be a function.')
        }
      } else {
        this[k] = opts[k]
      }
    }
  }

  get isDead () {
    return this._isDead
  }

  _resurgence () {
    this._isDead = false
  }

  _kill () {
    this._isDead = true
  }

  _addCount () {
    this._count = this._count + 1
  }

  bindContext (ctx) {
    this.ctx = ctx
  }

  set ctx (val) {
    this._ctx = val
  }

  get ctx () {
    return this._ctx
  }

  get id () {
    return this._id
  }

  get hasBeenOpened () {
    return this._count > 0
  }

  get isRunning() {
    if (!this.ctx) return false
    return this.ctx.runningPage.id === this.id
  }
}

export default Page
