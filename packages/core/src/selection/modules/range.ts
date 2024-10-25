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
    this.isBackward = this.isCollapsed ? false : this.isBackward;
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
   * @param origin
   * @param target
   */
  public static isEqual(origin: Range | null, target: Range | null): boolean {
    if (origin === target) return true;
    if (!origin || !target) return false;
    return Point.isEqual(origin.start, target.start) && Point.isEqual(origin.end, target.end);
  }

  /**
   * 判断 Range1 是否包含 Range2
   * @param range1
   * @param range2
   */
  public static includes(range1: Range | null, range2: Range | null): boolean {
    if (!range1 || !range2) return false;
    const { start: start1, end: end1 } = range1;
    const { start: start2, end: end2 } = range2;
    // --start1--end1--start2--end2--
    // --start1--start2--end2--end1-- ✅
    const start1BeforeStart2 = !Point.isAfter(start1, start2);
    const end1AfterEnd2 = !Point.isBefore(end1, end2);
    return start1BeforeStart2 && end1AfterEnd2;
  }

  /**
   * 判断 range1 是否与 range2 交叉
   * @param range1
   * @param range2
   */
  public static intersection(range1: Range | null, range2: Range | null): boolean {
    if (!range1 || !range2) return false;
    const { start: start1, end: end1 } = range1;
    const { start: start2, end: end2 } = range2;
    // --start1--end1--start2--end2--
    // => --end1--start2--
    // --start1--start2--end1--end2--  ✅
    // => --start2--end1--
    const start = Point.isBefore(start1, start2) ? start2 : start1;
    const end = Point.isBefore(end1, end2) ? end1 : end2;
    return !Point.isAfter(start, end);
  }
}
