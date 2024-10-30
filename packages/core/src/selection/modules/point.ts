import type { Editor } from "../../editor";
import { binarySearch } from "../../state/utils/normalize";
import type { RawPoint } from "./raw-point";

/**
 * ModelPoint
 */
export class Point {
  constructor(
    /** 行索引 */
    public line: number,
    /** 行内偏移 */
    public offset: number
  ) {}

  /**
   * 克隆 Point
   */
  public clone() {
    return new Point(this.line, this.offset);
  }

  /**
   * 构建 Point
   * @param line
   * @param offset
   */
  public static from(line: number, offset: number) {
    return new Point(line, offset);
  }

  /**
   * 从 RawPoint 转换为 Point
   * @param editor
   * @param rawPoint
   */
  public static fromRaw(editor: Editor, rawPoint: RawPoint): Point | null {
    const block = editor.state.block;
    const lines = block.getLines();
    const line = binarySearch(lines, rawPoint.offset);
    if (!line) return null;
    return new Point(line.index, rawPoint.offset - line.start);
  }

  /**
   * 判断 Point 是否相等
   * @param origin
   * @param target
   */
  public static isEqual(origin: Point | null, target: Point | null): boolean {
    if (origin === target) return true;
    if (!origin || !target) return false;
    return origin.line === target.line && origin.offset === target.offset;
  }

  /**
   * 判断 Point1 是否在 Point2 之前
   * @param point1
   * @param point2
   * @note 即 < (p1 p2), 反之则 >= (p2 p1)
   */
  public static isBefore(point1: Point | null, point2: Point | null): boolean {
    if (!point1 || !point2) return false;
    if (point1.line < point2.line) return true;
    if (point1.line > point2.line) return false;
    if (point1.offset < point2.offset) return true;
    return false;
  }

  /**
   * 判断 Point1 是否在 Point2 之后
   * @param point1
   * @param point2
   * @note 即 > (p2 p1), 反之则 <= (p1 p2)
   */
  public static isAfter(point1: Point | null, point2: Point | null): boolean {
    if (!point1 || !point2) return false;
    if (point1.line > point2.line) return true;
    if (point1.line < point2.line) return false;
    if (point1.offset > point2.offset) return true;
    return false;
  }
}
