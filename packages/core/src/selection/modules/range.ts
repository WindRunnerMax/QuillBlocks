import { isNil } from "block-kit-utils";

import type { Editor } from "../../editor";
import { Point } from "./point";
import { RawPoint } from "./raw-point";
import type { RawRange } from "./raw-range";

/**
 * ModalRange
 */
export class Range {
  /** 选区起始点 */
  public readonly start: Point;
  /** 选区结束点 */
  public readonly end: Point;
  /** 选区方向反选 */
  public isBackward: boolean;
  /** 选区折叠状态 */
  public isCollapsed: boolean;

  constructor(
    /** 选区起始点 */
    start: Point,
    /** 选区结束点 */
    end: Point,
    /** 选区方向反选 */
    backward?: boolean,
    /** 选区折叠状态 */
    collapsed?: boolean
  ) {
    const isEndBeforeStart = Point.isBefore(end, start);
    [this.start, this.end] = isEndBeforeStart ? [end, start] : [start, end];
    this.isBackward = isNil(backward) ? isEndBeforeStart : backward;
    this.isCollapsed = isNil(collapsed) ? Point.isEqual(start, end) : collapsed;
    if (this.isCollapsed) {
      this.isBackward = false;
    }
  }

  /**
   * 克隆 Range
   */
  public clone() {
    return new Range(this.start.clone(), this.end.clone(), this.isBackward, this.isCollapsed);
  }

  /**
   * 构建 Range
   * @param start
   * @param end
   * @param isBackward
   * @param isCollapsed
   */
  public static from(start: Point, end: Point, backward?: boolean, collapsed?: boolean) {
    return new Range(start, end, backward, collapsed);
  }

  /**
   * 将 RawRange 转换为 Range
   * @param editor
   * @param raw
   */
  public static fromRaw(editor: Editor, raw: RawRange): Range | null {
    const start = Point.fromRaw(editor, new RawPoint(raw.start));
    if (!start) return null;
    const end = !raw.len ? start.clone() : Point.fromRaw(editor, new RawPoint(raw.start + raw.len));
    if (!end) return null;
    return new Range(start, end, false, raw.len === 0);
  }

  /**
   * 判断 Range 是否相等
   */
  public static isEqual(origin: Range | null, target: Range | null): boolean {
    if (origin === target) return true;
    if (!origin || !target) return false;
    return Point.isEqual(origin.start, target.start) && Point.isEqual(origin.end, target.end);
  }
}
