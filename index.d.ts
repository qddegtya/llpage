interface Page {
  /**
   * 绑定 llpage 管理容器
   * @param ctx 管理容器上下文
   */
  bindContext(ctx: PageManager): void;

  /** 是否已被销毁 */
  readonly isDead: boolean;

  /** 当前管理容器上下文 */
  ctx?: PageManager;

  /** 页面 id */
  readonly id: number;

  /** 是否曾经被打开过 */
  readonly hasBeenOpened: boolean;

  /** 是否在运行中 */
  readonly isRunning: boolean;

  /** 是否被淘汰过 */
  readonly isEliminated: boolean;
}

interface PageManager {  
  /**
   * 打开一个页面
   * @param page 页面
   */
  open(page: Page): void;

  /**
   * 关闭某个页面
   * @param page 页面
   */
  close(page: Page): void;

  /**
   * 关闭所有页面
   */
  closeAll(): void;

  /**
   * 关闭其他页面
   * @param page 页面
   */
  closeOthers(page: Page): void;

  /**
   * 刷新页面
   * @param page 页面
   */
  refresh(page: Page): void;
}

interface ManagerOption {
  /** 最大保活数量 */
  size: number
}

interface PageOption<T> {
  /** 页面数据 */
  data: T;
  
  /** 在页面对象被激活时执行 */
  onCreate(): Promise;

  /** 在页面对象被激活后，即将开始 running 时执行 */
  onStart(): Promise;

  /** 在页面对象被隐藏后重新激活时执行 */
  onResume(): Promise;

  /** 在页面对象被隐藏时执行 */
  onPause(): Promise;

  /** 在页面对象被销毁前执行 */
  onStop(): Promise;

  /** 在页面对象被销毁时执行 */
  onDestroy(): Promise;

  /** 当页面对象曾经被打开过，并且当前处于 dead 状态中，这个时候被重新激活时执行 */
  onRestart(): Promise;
}

/**
 * 创建一个 llpage 管理容器
 * @param opt 配置选项
 */
export function createLLPageManager(opt: ManagerOption): PageManager;

/**
 * 创建一个 llpage
 * @param opt 配置选项
 */
export function createPage<T>(opt: PageOption<T>): Page;
