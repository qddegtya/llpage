import { NOOP, DATA_KEY } from './constants'
import { core } from 'xajs'

const defaultOpts = {
  [DATA_KEY]: {},
  onCreate: NOOP,
  onStart: NOOP,
  onResume: NOOP,
  onPause: NOOP,
  onStop: NOOP,
  onDestroy: NOOP,
  onRestart: NOOP,
  onRefresh: NOOP
}

const LIFE_CYCLE_HOOKS = Object.keys(defaultOpts).filter(k => k !== DATA_KEY)

const Page = core.base.Class(function() {
  return {
    $ctor: function(id, opts) {
      // private
      (this._ctx = null),
      (this._count = 0),
      (this._isDead = false),
      (this._isEliminated = false),
      (this._eliminationCount = 0)

      this.id = id
      this.hooks = {}
      this.$_init(Object.assign({}, defaultOpts, opts))
    },

    $_init: function(opts) {
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
    },

    eliminate() {
      (this._isEliminated = true),
      (this._eliminationCount = this._eliminationCount + 1)
    },

    unEliminate() {
      this._isEliminated = false
    },

    get isEliminated() {
      return this._isEliminated
    },

    get hasBeenEliminated() {
      return this._eliminationCount > 0
    },

    get eliminationCount() {
      return this._eliminationCount
    },

    get isDead() {
      return this._isDead
    },

    _resurgence() {
      this._isDead = false
    },

    _kill() {
      this._isDead = true
    },

    _addCount() {
      this._count = this._count + 1
    },

    bindContext(ctx) {
      this.ctx = ctx
    },

    set ctx(val) {
      this._ctx = val
    },

    get ctx() {
      return this._ctx
    },

    get hasBeenOpened() {
      return this._count > 0
    },

    get isRunning() {
      if (!this.ctx) return false
      return this.ctx.runningPage.id === this.id
    }
  }
})

export default Page
