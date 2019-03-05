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
  onRestart: NOOP
}

const LIFE_CYCLE_HOOKS = Object.keys(defaultOpts).filter(k => k !== DATA_KEY)

const Page = core.base.Class(function() {
  // private
  let _ctx = null,
    _count = 0,
    _isDead = false

  return {
    $ctor: function(id, opts) {
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

    get isDead() {
      return _isDead
    },

    _resurgence() {
      _isDead = false
    },

    _kill() {
      _isDead = true
    },

    _addCount() {
      _count = _count + 1
    },

    bindContext(ctx) {
      this.ctx = ctx
    },

    set ctx(val) {
      _ctx = val
    },

    get ctx() {
      return _ctx
    },

    get hasBeenOpened() {
      return _count > 0
    },

    get isRunning() {
      if (!this.ctx) return false
      return this.ctx.runningPage.id === this.id
    }
  }
})

export default Page
