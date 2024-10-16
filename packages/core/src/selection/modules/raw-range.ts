import type { Editor } from "../../editor";
import type { Range } from "./range";
import { RawPoint } from "./raw-point";

/**
 * ModalRawRange
 */
export class RawRange {
  constructor(
    /** 起始点 */
    public start: number,
    /** 长度 */
    public len: number
  ) {}

  /**
   * 克隆 RawRange
   */
  public clone() {
    return new RawRange(this.start, this.len);
  }

  /**
   * 构建 RawRange
   * @param start
   * @param len
   */
  public static from(start: number, len: number) {
    return new RawRange(start, len);
  }

  /**
   * 将 Range 转换为 RawRange
   * @param editor
   * @param range
   */
  public static fromRange(editor: Editor, range: Range | null): RawRange | null {
    if (!range) return null;
    const start = RawPoint.fromPoint(editor, range.start);
    const end = RawPoint.fromPoint(editor, range.end);
    if (start && end) {
      // start -> end
      return new RawRange(start.offset, Math.max(end.offset - start.offset, 0));
    }
    return null;
  }

  /**
   * 判断 RawRange 是否相等
   * @param origin
   * @param target
   */
  public static isEqual(origin: RawRange | null, target: RawRange | null): boolean {
    if (origin === target) return true;
    if (!origin || !target) return false;
    return origin.start === target.start && origin.len === target.len;
  }
}
