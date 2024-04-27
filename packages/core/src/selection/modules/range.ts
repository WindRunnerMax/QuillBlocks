import { Point } from "./point";

export class Range {
  constructor(
    public readonly start: Point,
    public readonly end: Point,
    public readonly isBackward: boolean,
    public readonly isCollapsed: boolean
  ) {}

  clone() {
    return new Range(this.start.clone(), this.end.clone(), this.isBackward, this.isCollapsed);
  }

  public static from(start: Point, end: Point, isBackward = false) {
    return new Range(start, end, isBackward, Point.isEqual(start, end));
  }

  public static isEqual(origin: Range | null, target: Range | null): boolean {
    if (origin === target) return true;
    if (!origin || !target) return false;
    return Point.isEqual(origin.start, target.start) && Point.isEqual(origin.end, target.end);
  }
}
