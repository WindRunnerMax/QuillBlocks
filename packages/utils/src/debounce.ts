/* eslint-disable @typescript-eslint/no-this-alias */

import { isNumber } from "./is";
import type { Array, Func, Primitive } from "./types";

type DebouncedFn<T extends Func.Any> = T & {
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
  leading: false,
  trailing: true,
};

/**
 * 防抖函数
 * @param {Func.Any} fn
 * @param {Options | number} options
 * @returns {DebouncedFn<T>}
 */
export const debounce = <T extends Func.Any>(fn: T, options: Options | number): DebouncedFn<T> => {
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
    fn.apply(lastThis, lastArgs);
    clear();
  };

  /**
   * 立即执行
   */
  const flush = () => {
    invoke();
    timer = setTimeout(clear, wait);
  };

  /**
   * 防抖
   * @param {unknown} this
   * @param {Array.Any} args
   */
  function debounced(this: unknown, ...args: Array.Any) {
    lastThis = this;
    lastArgs = args;
    if (!leading && trailing) {
      clear();
      timer = setTimeout(invoke, wait);
      return void 0;
    }
    if (leading && !trailing) {
      timer === null && invoke();
      clear();
      timer = setTimeout(clear, wait);
      return void 0;
    }
    if (leading && trailing) {
      timer === null && invoke();
      clear();
      timer = setTimeout(invoke, wait);
      return void 0;
    }
  }

  /** 立即执行 */
  debounced.flush = flush;
  /** 清除定时器 */
  debounced.cancel = clear;
  return debounced as DebouncedFn<T>;
};
