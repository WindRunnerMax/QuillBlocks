import type { Editor } from "../../editor";
import { RawPoint } from "./raw";

export class Point {
  constructor(public line: number, public offset: number, public zoneId: string) {}

  clone() {
    return new Point(this.line, this.offset, this.zoneId);
  }

  static isEqual(origin: Point | null, target: Point | null): boolean {
    if (origin === target) return true;
    if (!origin || !target) return false;
    return (
      origin.line === target.line &&
      origin.offset === target.offset &&
      origin.zoneId === target.zoneId
    );
  }

  static toRaw(editor: Editor, point: Point | null): RawPoint | null {
    if (!point) return null;
    const zone = editor.state.getBlockState(point.zoneId);
    if (!zone) {
      editor.logger.warning("Zone Not Found", point.zoneId);
      return null;
    }
    const line = zone.getLine(point.line);
    if (!line) {
      editor.logger.warning("Line Not Found", point.line);
      return null;
    }
    return new RawPoint(line.start + point.offset, point.zoneId);
  }
}
