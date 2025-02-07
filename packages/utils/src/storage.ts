import { decodeJSON, encodeJSON } from "./json";

interface Storage<T> {
  /** 原始值 */
  origin: T;
  /** 过期时间 ttl ms */
  expire: number | null;
}

/** key 前缀 */
let prefix = "";
/** key 后缀 */
let suffix = "__STORAGE__";

/**
 * 补充 key 前后缀
 * @param {string} key
 * @returns {string}
 * */
const convert = (key: string): string => prefix + String(key) + suffix;

/**
 * 序列化
 * @param {T} origin
 * @param {number} ttl
 * @returns {string | null}
 * */
const serialize = <T = string>(origin: T, ttl?: number | null): string | null => {
  try {
    const data: Storage<T> = { origin, expire: null };
    if (ttl) {
      const now = Date.now();
      data.expire = ttl + now;
    }
    return encodeJSON(data);
  } catch (error) {
    console.log("Serialize Storage Error:", error);
    return null;
  }
};

/**
 * 反序列化
 * @param {string} str
 * @returns {null | T}
 * */
const deserialize = <T>(str: string): null | T => {
  try {
    const data = decodeJSON<Storage<T>>(str);
    if (!data) return null;
    if (Number.isNaN(data.expire)) return null;
    if (data.expire && Date.now() > data.expire) return null;
    return data.origin;
  } catch (error) {
    console.log("Deserialize Storage Error:", error);
    return null;
  }
};

const base = {
  /**
   * 读取存储数据
   * @param {globalThis.Storage} scope
   * @param {string} name
   * @returns {null | T}
   */
  get: function <T = unknown>(scope: globalThis.Storage, name: string): null | T {
    const key = convert(name);
    const str = scope.getItem(key);
    if (!str) return null;
    const origin = deserialize<T>(str);
    if (origin === null) this.remove(scope, key);
    return origin;
  },
  /**
   * 设置存储数据
   * @param {globalThis.Storage} scope
   * @param {string} name
   * @param {T} data
   * @param {number} ttl ms
   * @returns {void}
   */
  set: function <T = string>(
    scope: globalThis.Storage,
    name: string,
    data: T,
    ttl: number | null = null
  ): void {
    const key = convert(name);
    const str = serialize<T>(data, ttl);
    if (!str) return void 0;
    return scope.setItem(key, str);
  },
  /**
   * 读取存储数据 原始值
   * @param {globalThis.Storage} scope
   * @param {string} name
   * @returns {string | null}
   */
  getOrigin: function (scope: globalThis.Storage, name: string): string | null {
    const key = convert(name);
    return scope.getItem(key);
  },
  /**
   * 移除存储数据
   * @param {globalThis.Storage} scope
   * @param {string} name
   * @returns {void}
   */
  remove: function (scope: globalThis.Storage, name: string): void {
    const key = convert(name);
    return scope.removeItem(key);
  },
};

export const Storage = {
  /**
   * 设置 key 前缀
   * @param {string} key
   * @returns {void}
   */
  setPrefix: function (key: string): void {
    prefix = key;
  },
  /**
   * 设置 key 后缀
   * @param {string} key
   * @returns {void}
   */
  setSuffix: function (key: string): void {
    suffix = key;
  },
  /** local storage */
  local: {
    /**
     * 读取存储数据
     * @param {string} name
     * @returns {null | T}
     */
    get: function <T = unknown>(name: string): null | T {
      return base.get<T>(localStorage, name);
    },
    /**
     * 设置存储数据
     * @param {string} name
     * @param {T} data
     * @param {number} ttl ms
     * @returns {void}
     */
    set: function <T = string>(name: string, data: T, ttl: number | null = null): void {
      return base.set<T>(localStorage, name, data, ttl);
    },
    /**
     * 读取存储数据 原始值
     * @param {string} name
     * @returns {string | null}
     */
    getOrigin: function (name: string): string | null {
      return base.getOrigin(localStorage, name);
    },
    /**
     * 移除存储数据
     * @param {string} name
     * @returns {void}
     */
    remove: function (name: string): void {
      return base.remove(localStorage, name);
    },
  },
  /** session storage */
  session: {
    /**
     * 读取存储数据
     * @param {string} name
     * @returns {null | T}
     */
    get: function <T = unknown>(name: string): null | T {
      return base.get<T>(sessionStorage, name);
    },
    /**
     * 设置存储数据
     * @param {string} name
     * @param {T} data
     * @param {number} ttl ms
     * @returns {void}
     */
    set: function <T = string>(name: string, data: T, ttl: number | null = null): void {
      return base.set<T>(sessionStorage, name, data, ttl);
    },
    /**
     * 读取存储数据 原始值
     * @param {string} name
     * @returns {string | null}
     */
    getOrigin: function (name: string): string | null {
      return base.getOrigin(sessionStorage, name);
    },
    /**
     * 移除存储数据
     * @param {string} name
     * @returns {void}
     */
    remove: function (name: string): void {
      return base.remove(sessionStorage, name);
    },
  },
};
