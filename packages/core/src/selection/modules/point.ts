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
    if (line) {
      return new Point(line.index, rawPoint.offset - line.start);
    }
    return null;
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
   * 判断 Origin 是否在 Target 之前
   * @param origin
   * @param target
   */
  public static isBefore(origin: Point, target: Point): boolean {
    if (origin.line < target.line) return true;
    if (origin.line === target.line && origin.offset < target.offset) {
      return true;
    }
    return false;
  }
}
