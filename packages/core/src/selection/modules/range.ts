import type { Editor } from "../../editor";
import { Point } from "./point";
import { Raw } from "./raw";

export type LaserRange = Range;

export class Range {
  constructor(
    public start: Point,
    public end: Point,
    public isBackward: boolean,
    public isCollapsed: boolean
  ) {}

  clone() {
    return new Range(this.start.clone(), this.end.clone(), this.isBackward, this.isCollapsed);
  }

  static toRaw(editor: Editor, range: Range | null): Raw | null {
    if (!range) return null;
    const start = Point.toRaw(editor, range.start);
    const end = Point.toRaw(editor, range.end);
    // TODO: 多`zone`选区
    if (start && end && start.zoneId === end.zoneId) {
      return new Raw(start.offset, Math.max(end.offset - start.offset, 0), start.zoneId);
    }
    return null;
  }

  static isEqual(origin: Range | null, target: Range | null): boolean {
    if (origin === target) return true;
    if (!origin || !target) return false;
    return Point.isEqual(origin.start, target.start) && Point.isEqual(origin.end, target.end);
  }
}
