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

  /** 当前是否处于淘汰状态 */
  readonly isEliminated: boolean;

  /** 是否曾被淘汰过 */
  readonly hasBeenEliminated: boolean;

  /** 被淘汰过的次数 */
  readonly eliminationCount: number;
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
  onCreate(): Promise<T>;

  /** 在页面对象被激活后，即将开始 running 时执行 */
  onStart(): Promise<T>;

  /** 在页面对象被隐藏后重新激活时执行 */
  onResume(): Promise<T>;

  /** 在页面对象被隐藏时执行 */
  onPause(): Promise<T>;

  /** 在页面对象被销毁前执行 */
  onStop(): Promise<T>;

  /** 在页面对象被销毁时执行 */
  onDestroy(): Promise<T>;

  /** 当页面对象曾经被打开过，并且当前处于 dead 状态中，这个时候被重新激活时执行 */
  onRestart(): Promise<T>;

  /** 当页面处于非淘汰状态，被刷新时触发，接收一个是否为当前运行页面的参数 isRunning */
  onRefresh(isRunning: boolean): Promise<T>;
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
