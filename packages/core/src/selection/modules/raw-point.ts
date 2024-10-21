import type { Editor } from "../../editor";
import type { Point } from "./point";

/**
 * ModalRawPoint
 */
export class RawPoint {
  constructor(
    /** 起始偏移 */
    public offset: number
  ) {}

  /**
   * 克隆 RawPoint
   */
  public clone() {
    return new RawPoint(this.offset);
  }

  /**
   * 构建 RawPoint
   * @param offset
   */
  public static from(offset: number) {
    return new RawPoint(offset);
  }

  /**
   * 将 Point 转换为 RawPoint
   * @param editor
   * @param point
   */
  public static fromPoint(editor: Editor, point: Point | null): RawPoint | null {
    if (!point) {
      return null;
    }
    const block = editor.state.block;
    const line = block.getLine(point.line);
    if (!line || point.offset > line.length) {
      editor.logger.warning("Line Not Found", point.line);
      return null;
    }
    return new RawPoint(line.start + point.offset);
  }

  /**
   * 判断 RawPoint 是否相等
   * @param origin
   * @param target
   */
  public static isEqual(origin: RawPoint | null, target: RawPoint | null): boolean {
    if (origin === target) return true;
    if (!origin || !target) return false;
    return origin.offset === target.offset;
  }

  /**
   * 判断 Point1 是否在 Point2 之前
   * @param point1
   * @param point2
   * @note 即 < (p1 p2), 反之则 >= (p2 p1)
   */
  public static isBefore(point1: RawPoint | null, point2: RawPoint | null): boolean {
    if (!point1 || !point2) return false;
    return point1.offset < point2.offset;
  }

  /**
   * 判断 Point1 是否在 Point2 之后
   * @param point1
   * @param point2
   * @note 即 > (p2 p1), 反之则 <= (p1 p2)
   */
  public static isAfter(point1: RawPoint | null, point2: RawPoint | null): boolean {
    if (!point1 || !point2) return false;
    return point1.offset > point2.offset;
  }
}
