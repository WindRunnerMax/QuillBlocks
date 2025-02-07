/* eslint-disable @typescript-eslint/no-this-alias */

import { isNil, isNumber } from "./is";
import type { Array, Func, Primitive } from "./types";

type ThrottledFn<T extends Func.Any> = T & {
  /** 立即执行 */
  flush: () => void;
  /** 清除定时器 */
  cancel: () => void;
};

type Options = {
  /** 等待时间 */
  wait: number;
  /** 立即执行 */
  leading?: boolean;
  /** 延迟执行 */
  trailing?: boolean;
};

const DEFAULT_OPTIONS: Required<Options> = {
  wait: 100,
  leading: true,
  trailing: true,
};

/**
 * 节流函数
 * @param {Func.Any} fn
 * @param {Options | number} options
 * @returns {ThrottledFn<Func.Any>}
 */
export const throttle = <T extends Func.Any>(fn: T, options: Options | number): ThrottledFn<T> => {
  let lastInvokeTime = 0;
  let lastThis: Primitive.Any;
  let lastArgs: Array.Any = [];
  let timer: ReturnType<typeof setTimeout> | null = null;

  const config = Object.assign(
    { ...DEFAULT_OPTIONS },
    isNumber(options) ? { wait: options } : options
  );
  const wait = config.wait;
  const leading = config.leading;
  const trailing = config.trailing;

  /**
   * 清除定时器
   */
  const clear = () => {
    timer && clearTimeout(timer);
    timer = null;
  };

  /**
   * 执行函数
   */
  const invoke = () => {
    lastInvokeTime = Date.now();
    fn.apply(lastThis, lastArgs);
    clear();
  };

  /**
   * 立即执行
   */
  const flush = () => {
    invoke();
    if (leading && !trailing) {
      timer = setTimeout(clear, wait);
    }
  };

  /**
   * 节流
   * @param {unknown} this
   * @param {Array.Any} args
   */
  function throttled(this: unknown, ...args: Array.Any) {
    lastThis = this;
    lastArgs = args;
    const now = Date.now();
    if (leading && trailing && isNil(timer)) {
      // 此处没有处理多次调用才会触发 trailing 的情况
      // 即单次调用也会同时触发 leading 和 trailing 调度
      // 如果必须要处理的话就将后续的 timer 赋值写入 else 分支
      now - lastInvokeTime > wait && invoke();
      timer = setTimeout(invoke, wait);
      return void 0;
    }
    if (!leading && trailing && isNil(timer)) {
      timer = setTimeout(invoke, wait);
      return void 0;
    }
    if (leading && !trailing && isNil(timer)) {
      invoke();
      timer = setTimeout(clear, wait);
      return void 0;
    }
  }

  /** 立即执行 */
  throttled.flush = flush;
  /** 清除定时器 */
  throttled.cancel = clear;
  return throttled as ThrottledFn<T>;
};
