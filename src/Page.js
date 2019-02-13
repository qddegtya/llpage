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
  constructor(id, opts = defaultOpts) {
    this.id = id
    this.hooks = {}
    this.ctx = null
    this._init(opts)
  }

  _init(opts) {
    for (let k in opts) {
      if (LIFE_CYCLE_HOOKS.indexOf(k) >= 0) {
        this.hooks[k] = opts[k]
      } else {
        this[k] = opts[k]
      }
    }
  }

  get isRunning() {
    if (!this.ctx) return false
    return this.ctx.runningPage.id === this.id
  }
}

export default Page
