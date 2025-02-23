import { isArray, isNil, isObject } from "./is";
import type { Array, O, P } from "./types";

export class Collection {
  /**
   * Pick
   * @param {Object.Any} target
   * @param {string} keys
   */
  public static pick<T extends O.Any, K extends keyof T>(target: T, keys: K | K[]): Pick<T, K> {
    const set: Set<unknown> = new Set(isArray(keys) ? keys : [keys]);
    const next = {} as O.Map<unknown>;
    for (const key of Object.keys(target)) {
      if (!set.has(key)) continue;
      next[key] = target[key];
    }
    return next as T;
  }

  /**
   * Omit
   * @param {Array.Any | Object.Any} target
   * @param {Array.Any} keys
   */
  public static omit<T extends Array.Any>(target: T, keys: T): T;
  public static omit<T extends O.Any, K extends keyof T>(target: T, keys: K | K[]): Omit<T, K>;
  public static omit<T extends Array.Any | O.Any>(target: T, keys: Array.Any): T | O.Any {
    const set = new Set(isArray(keys) ? keys : [keys]);
    if (isObject(target)) {
      const next = {} as O.Unknown;
      for (const key of Object.keys(target)) {
        if (set.has(key)) continue;
        next[key] = target[key];
      }
      return next;
    }
    return target.filter(item => !set.has(item));
  }

  /**
   * Patch 差异
   * @param {Set<T> | T[]} a
   * @param {Set<T> | T[]} b
   */
  public static patch<T>(a: Set<T> | T[], b: Set<T> | T[]) {
    const prev = a instanceof Set ? a : new Set(a);
    const next = b instanceof Set ? b : new Set(b);
    const effects = new Set<T>();
    const added = new Set<T>();
    const removed = new Set<T>();
    for (const id of next) {
      if (!prev.has(id)) {
        added.add(id);
        effects.add(id);
      }
    }
    for (const id of prev) {
      if (!next.has(id)) {
        removed.add(id);
        effects.add(id);
      }
    }
    return { effects, added, removed };
  }

  /**
   * Union 并集
   * @param {Set<T> | T[]} a
   * @param {Set<T> | T[]} b
   */
  public static union<T>(a: Set<T> | T[], b: Set<T> | T[]) {
    return new Set([...a, ...b]);
  }

  /**
   * Intersection 交集
   * @param {Set<T> | T[]} a
   * @param {Set<T> | T[]} b
   */
  public static intersection<T>(a: Set<T> | T[], b: Set<T> | T[]) {
    const prev = [...a];
    const next = b instanceof Set ? b : new Set(b);
    return new Set([...prev].filter(id => next.has(id)));
  }

  /**
   * IsSubset 判断子集
   * @param {Set<T> | T[]} a
   * @param {Set<T> | T[]} b
   */
  public static isSubset<T>(a: Set<T> | T[], b: Set<T> | T[]) {
    const prev = [...a];
    const next = b instanceof Set ? b : new Set(b);
    return prev.every(id => next.has(id));
  }

  /**
   * IsSuperset 判断超集
   * @param {Set<T> | T[]} a
   * @param {Set<T> | T[]} b
   */
  public static isSuperset<T>(a: Set<T> | T[], b: Set<T> | T[]) {
    const prev = a instanceof Set ? a : new Set(a);
    const next = [...b];
    return next.every(id => prev.has(id));
  }

  /**
   * Symmetric 对等差集
   * @param {Set<T> | T[]} a
   * @param {Set<T> | T[]} b
   */
  public static symmetric<T>(a: Set<T> | T[], b: Set<T> | T[]) {
    const prev = a instanceof Set ? a : new Set(a);
    const next = [...b];
    return new Set(next.filter(id => !prev.has(id)));
  }

  /**
   * 取数组索引值
   * @param {T[] | P.Nil} target
   * @param {number} index 支持负数
   */
  public static at<T>(target: T[] | P.Nil, index: number): T | null {
    if (!target) return null;
    const i = index < 0 ? target.length + index : index;
    const value = target[i];
    return isNil(value) ? null : value;
  }
}
