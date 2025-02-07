import { DEFAULT_PRIORITY } from "./constant";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface EventBusType {}

export type Handler<T extends EventKeys> = {
  once: boolean;
  priority: number;
  listener: Listener<T>;
};

export type EventContext = {
  key: string;
  stopped: boolean;
  prevented: boolean;
  /** 停止顺序执行 */
  stop: () => void;
  /** 阻止编辑器默认行为 */
  prevent: () => void;
};

export type EventFn<T extends EventKeys> = (
  payload: EventBusType[T],
  context: EventContext
) => unknown;

export type EventKeys = keyof EventBusType;
export type Listener<T extends EventKeys> = EventFn<T>;
export type Listeners = { [T in EventKeys]?: Handler<T>[] };

export class EventBus {
  /**
   * 事件监听器
   */
  private listeners: Listeners = {};

  /**
   * 监听事件
   * @param {T} key
   * @param {Listener<T>} listener
   * @param {number} priority
   */
  public on<T extends EventKeys>(key: T, listener: Listener<T>, priority = DEFAULT_PRIORITY) {
    this.addEventListener(key, listener, priority, false);
  }

  /**
   * 一次性事件监听
   * @param {T} key
   * @param {Listener<T>} listener
   * @param {number} priority
   */
  public once<T extends EventKeys>(key: T, listener: Listener<T>, priority = DEFAULT_PRIORITY) {
    this.addEventListener(key, listener, priority, true);
  }

  /**
   * 添加事件监听
   * @param {T} key
   * @param {Listener<T>} listener
   * @param {number} priority
   * @param {boolean} once
   */
  private addEventListener<T extends EventKeys>(
    key: T,
    listener: Listener<T>,
    priority: number,
    once: boolean
  ) {
    const handler: Handler<T>[] = this.listeners[key] || [];
    !handler.some(item => item.listener === listener) && handler.push({ listener, priority, once });
    handler.sort((a, b) => a.priority - b.priority);
    this.listeners[key] = <Listeners[T]>handler;
  }

  /**
   * 移除事件监听
   * @param {T} key
   * @param {Listener<T>} listener
   */
  public off<T extends EventKeys>(key: T, listener: Listener<T>) {
    const handler = this.listeners[key];
    if (!handler) return void 0;
    // COMPAT: 不能直接`splice` 可能会导致`trigger`时打断`forEach`
    const next = handler.filter(item => item.listener !== listener);
    this.listeners[key] = <Listeners[T]>next;
  }

  /**
   * 触发事件
   * @param {T} key
   * @param {Listener<T>} listener
   * @returns {boolean} prevented
   */
  public emit<T extends EventKeys>(key: T, payload: EventBusType[T]) {
    const handler = this.listeners[key];
    if (!handler) return false;
    const context: EventContext = {
      key: key,
      stopped: false,
      prevented: false,
      stop: () => {
        context.stopped = true;
      },
      prevent: () => {
        context.prevented = true;
      },
    };
    for (const item of handler) {
      item.listener(payload, context);
      item.once && this.off(key, item.listener);
      if (context.stopped) break;
    }
    return context.prevented;
  }

  /**
   * 清理事件
   */
  public clear() {
    this.listeners = {};
  }
}
