import { isNil, isObject, isPlainNumber, isString } from "./is";
import type { Primitive } from "./types";

export class Styles {
  /**
   * 转换为像素值
   * @param {string | number | Primitive.Nil} value
   * @returns {string | null}
   */
  public static pixelate(value: Primitive.Nil): null;
  public static pixelate(value: string | number): string;
  public static pixelate(value: string | number | Primitive.Nil): string | null {
    if (isNil(value) || value === "") return null;
    if (isString(value) && value.endsWith("px")) return value;
    return isPlainNumber(value) ? value + "px" : null;
  }

  /**
   * 转换为数字值
   * @param {string | number | Primitive.Nil} value
   * @returns {number | null}
   */
  public static digitize(value: string | number | Primitive.Nil): number | null {
    if (!value) return null;
    if (isPlainNumber(value)) {
      const num = Number(value);
      return Number.isNaN(num) ? null : num;
    }
    if (value.endsWith("px")) {
      const num = Number(value.replace("px", ""));
      return Number.isNaN(num) ? null : num;
    }
    if (value.endsWith("%")) {
      const num = Number(value.replace("%", "")) / 100;
      return Number.isNaN(num) ? null : num;
    }
    return null;
  }

  /**
   * 设置样式到 DOM
   * @param {HTMLElement} dom
   * @param {Record<T, CSSStyleDeclaration[T]>} styles
   * @returns {void}
   */
  public static setToDOM<T extends keyof CSSStyleDeclaration>(
    dom: HTMLElement,
    styles: Record<T, CSSStyleDeclaration[T]>
  ): void {
    Object.entries(styles).forEach(([key, value]) => {
      dom.style[<T>key] = <CSSStyleDeclaration[T]>value;
    });
  }

  /**
   * 组合计算 class-name plain
   * @param {Array<unknown>} values
   * @returns {string}
   */
  public static classes(...values: Array<unknown>): string {
    return values.filter(r => isString(r)).join(" ");
  }

  /**
   * 组合计算 class-name complex
   * @param {Array<unknown>} values
   * @returns {string}
   */
  public static cx(...values: Array<unknown>): string {
    const res: string[] = [];
    for (const item of values) {
      if (!item) {
        continue;
      }
      if (isString(item)) {
        res.push(item);
        continue;
      }
      if (isObject(item)) {
        const keys = Object.keys(item).filter(key => item[key]);
        res.push(...keys);
        continue;
      }
    }
    return res.join(" ");
  }

  /**
   * 为 DOM 创建动画效果
   * @param {Element | Primitive.Nil} dom
   * @param {Keyframe[] | PropertyIndexedKeyframes} keyframes
   * @param {number | KeyframeAnimationOptions} options
   * @returns {Primitive.Nil | Animation}
   */
  public static animation(
    dom: Element | Primitive.Nil,
    keyframes: Keyframe[] | PropertyIndexedKeyframes,
    options?: number | KeyframeAnimationOptions
  ) {
    return dom && dom.animate(keyframes, options);
  }
}

/**
 * 组合计算 class-name plain
 * @param {Array<unknown>} values
 * @returns {string}
 */
export const cs = Styles.classes;

/**
 * 组合计算 class-name complex
 * @param {Array<unknown>} values
 * @returns {string}
 */
export const cx = Styles.cx;
