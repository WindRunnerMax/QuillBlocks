import { Format } from "./format";
import { isObject, isString } from "./is";
import type { O, P } from "./types";
import { Object } from "./types";

export const INTL_SYMBOL = "__INTL_SYMBOL__";
export const hasOwnProperty = Object.prototype.hasOwnProperty;
export type IntlPreset = Object.Nested;
export type IntlTypes<T extends IntlPreset> = Record<Object.Flatten<T>, string>;

export class Intl<T extends IntlPreset> {
  /** 当前语言 */
  private _language: string;
  /** 已加载的语言配置 */
  private _config: Record<string, T>;
  /** 读过的缓存 */
  private _cache: Partial<IntlTypes<T>>;
  /** 覆盖的配置 */
  private _override: Partial<IntlTypes<T>>;

  /**
   * 构造函数
   * @param language
   */
  constructor(language: string) {
    this._cache = {};
    this._config = {};
    this._override = {};
    this._language = language;
  }

  /**
   * Set language
   * @param {string} language
   * @returns {void}
   */
  public setLanguage(language: string): void {
    this._cache = {};
    this._language = language;
  }

  /**
   * Load i18n config
   * @param {T} config
   * @returns {void}
   */
  public load(language: string, config: T): void {
    this._cache = {};
    this._config[language] = config;
  }

  /**
   * Get current language
   * @returns {string}
   */
  public getLanguage(): string {
    return this._language;
  }

  /**
   * Check if language is loaded
   * @param {string} language
   * @returns {boolean}
   */
  public isLoaded(language: string): boolean {
    return !!this._config[language];
  }

  /**
   * Get language payload
   * @param {string} language
   * @returns {T | null}
   */
  public getPayload(language?: string): T | null {
    return this._config[language || this._language] || null;
  }

  /**
   * Get locale
   * @returns {T | null}
   */
  public get locale(): T | null {
    return this._config[this._language]!;
  }

  /**
   * Set override
   * @param {IntlTypes<T>} override
   * @returns {void}
   */
  public override(override: Partial<IntlTypes<T>>): void {
    this._override = override;
  }

  /**
   * Format i18n value
   * @param {string} value
   * @param {Record<string, string>} variables
   * @returns {string}
   */
  private format(value: string, variables: Record<string, string>): string {
    if (Object.keys(variables).length) {
      return Format.string(value, variables);
    }
    return value;
  }

  /**
   * Compose i18n value
   * @param {keyof IntlTypes<T>} key
   * @param {T} config
   * @returns {string | null}
   */
  private getValue(key: keyof IntlTypes<T>, config: T): string | null {
    const keys = key.split(".");
    let current = config as Object.Nested;
    for (const item of keys) {
      if (!current || !current[item]) break;
      current = current[item] as Object.Nested;
    }
    if (current && isString(current)) {
      this._cache[key] = current;
      return current;
    }
    return null;
  }

  /**
   * Translate i18n value
   * @param {keyof IntlTypes<T>} key
   * @param {Record<string, string>} variable
   * @returns {string}
   */
  public t(
    key: keyof IntlTypes<T>,
    variable?: Record<string, string>,
    defaultValue?: string
  ): string {
    const variables = variable || {};
    const preset = this._override[key] || this._cache[key];
    if (preset) {
      return this.format(preset, variables);
    }
    const config = this._config[this._language];
    if (!config) {
      console.warn(`[I18n] Language "${this._language}" is not loaded.`);
      return defaultValue || key;
    }
    const value = this.getValue(key, config);
    if (value) {
      return this.format(value, variables);
    }
    return defaultValue || key;
  }

  /**
   * Seal i18n entity
   * @param {keyof IntlTypes<T>} key
   * @param {Record<string, string>} variable
   * @param {string} defaultValue
   * @returns {string}
   */
  public seal(
    key: keyof IntlTypes<T>,
    variable?: Record<string, string>,
    defaultValue?: string
  ): string {
    const transform = () => this.t(key, variable, defaultValue);
    const prototype = {
      toJSON: transform,
      valueOf: transform,
      toString: transform,
      [INTL_SYMBOL]: true,
    };
    // 在原型中置于 INTL_SYMBOL 属性
    // 且将返回值强行转换为 string 类型
    return Object.assign(Object.create(prototype), {
      k: key,
      v: variable,
      d: defaultValue,
    }) as unknown as string;
  }

  /**
   * Proxy i18n entity
   * @param {R} target
   * @returns {R}
   */
  public proxy<R extends Object.Mixed>(target: R): R {
    const copied: Object.Mixed = {};
    for (const key of Object.keys(target)) {
      const value = target[key];
      const prototype = isObject(value) && Object.getPrototypeOf(value);
      // 判断原型的 INTL_SYMBOL 直属属性
      if (!prototype || !hasOwnProperty.call(prototype, INTL_SYMBOL)) {
        copied[key] = value;
        continue;
      }
      const entity = value as { k: P.Any; v: O.Any; d: string };
      const getter = () => {
        return this.t(entity.k, entity.v, entity.d);
      };
      Object.defineProperty(copied, key, {
        get: getter,
        enumerable: true,
        configurable: true,
      });
    }
    return copied as R;
  }
}
