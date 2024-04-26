import type { Editor } from "../../editor";
import { binarySearch } from "../utils/iteration";
import { Point } from "./point";
import { Range } from "./range";

export class RawPoint {
  constructor(public offset: number, public zoneId: string) {}

  clone() {
    return new RawPoint(this.offset, this.zoneId);
  }

  toPoint(editor: Editor): Point | null {
    const zone = editor.state.getBlockState(this.zoneId);
    if (!zone) {
      editor.logger.warning("Zone Not Found", this.zoneId);
      return null;
    }
    const lines = zone.getLines();
    const line = binarySearch(lines, this.offset);
    if (line) {
      return new Point(line.index, this.offset - line.start, this.zoneId);
    } else {
      return null;
    }
  }

  static isEqual(origin: RawPoint | null, target: RawPoint | null): boolean {
    if (origin === target) return true;
    if (!origin || !target) return false;
    return origin.offset === target.offset && origin.zoneId === target.zoneId;
  }
}

export class Raw {
  constructor(public start: number, public len: number, public zoneId: string) {}

  clone() {
    return new Raw(this.start, this.len, this.zoneId);
  }

  toRange = (editor: Editor): Range | null => {
    const start = new RawPoint(this.start, this.zoneId).toPoint(editor);
    if (!start) return null;
    const end =
      this.len === 0
        ? start.clone()
        : new RawPoint(this.start + this.len, this.zoneId).toPoint(editor);
    if (!end) return null;
    return new Range(start, end, false, this.len === 0);
  };

  static isEqual(origin: Raw | null, target: Raw | null): boolean {
    if (origin === target) return true;
    if (!origin || !target) return false;
    return (
      origin.start === target.start && origin.len === target.len && origin.zoneId === target.zoneId
    );
  }
}
