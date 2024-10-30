import { Delta } from "block-kit-delta";

import { Editor } from "../../src/editor";
import { Point } from "../../src/selection/modules/point";
import { Range } from "../../src/selection/modules/range";
import { RawRange } from "../../src/selection/modules/raw-range";

describe("range", () => {
  const delta = new Delta()
    .insert("text")
    .insert("text", { bold: "true" })
    .insert("\n")
    .insert("text2")
    .insert("\n", { align: "center" });
  const editor = new Editor({ delta });

  it("constructor", () => {
    const start = new Point(0, 0, 0);
    const end = new Point(1, 0, 0);
    const range = new Range(start, end);
    expect(range.isBackward).toBe(false);
    expect(range.isCollapsed).toBe(false);
    expect(range.start).toBe(start);
    expect(range.end).toBe(end);
  });

  it("constructor backward", () => {
    const start = new Point(1, 0, 0);
    const end = new Point(0, 0, 0);
    const range = new Range(start, end);
    expect(range.isBackward).toBe(true);
    expect(range.isCollapsed).toBe(false);
    expect(range.start).toBe(end);
    expect(range.end).toBe(start);
  });

  it("constructor collapsed", () => {
    const start = new Point(0, 0, 0);
    const end = new Point(0, 0, 0);
    const range = new Range(start, end, true);
    expect(range.isBackward).toBe(false);
    expect(range.isCollapsed).toBe(true);
  });

  it("from-raw", () => {
    const rawRange = new RawRange(0, 9);
    const range = Range.fromRaw(editor, rawRange);
    const target = new Range(new Point(0, 0, 0), new Point(1, 0, 0));
    expect(range).toEqual(target);
  });

  it("from-raw overflow", () => {
    const rawRange = new RawRange(0, 20);
    const range = Range.fromRaw(editor, rawRange);
    expect(range).toEqual(null);
  });

  it("is-equal", () => {
    const range1 = new Range(new Point(0, 0, 0), new Point(1, 0, 0));
    const range2 = new Range(new Point(0, 0, 0), new Point(1, 0, 0));
    const range3 = new Range(new Point(0, 0, 0), new Point(1, 0, 1));
    expect(Range.isEqual(range1, range2)).toBe(true);
    expect(Range.isEqual(range1, range3)).toBe(false);
    expect(Range.isEqual(range3.clone(), range3)).toBe(true);
  });

  it("intersect-same-line", () => {
    const base = new Range(new Point(1, 0, 2), new Point(1, 0, 6));
    const start = new Point(1, 0, 2);
    const end = new Point(1, 0, 6);
    const range = new Range(start, end);
    expect(Range.intersection(base, range)).toBe(true);
  });

  it("intersect-middle-line", () => {
    const base = new Range(new Point(2, 0, 0), new Point(2, 0, 4));
    const start = new Point(1, 0, 3);
    const end = new Point(3, 0, 2);
    const range = new Range(start, end);
    expect(Range.intersection(base, range)).toBe(true);
  });

  it("intersect-start-line", () => {
    const base = new Range(new Point(1, 0, 2), new Point(1, 0, 4));
    const start = new Point(1, 0, 3);
    const end = new Point(2, 0, 0);
    const range = new Range(start, end);
    expect(Range.intersection(base, range)).toBe(true);
    const start2 = new Point(1, 0, 4);
    const range2 = new Range(start2, end);
    expect(Range.intersection(base, range2)).toBe(true);
    const start3 = new Point(1, 0, 5);
    const range3 = new Range(start3, end);
    expect(Range.intersection(base, range3)).toBe(false);
  });

  it("intersect-end-line", () => {
    const base = new Range(new Point(2, 0, 2), new Point(2, 0, 5));
    const start = new Point(1, 0, 3);
    const end = new Point(2, 0, 3);
    const range = new Range(start, end);
    expect(Range.intersection(base, range)).toBe(true);
    const end2 = new Point(2, 0, 2);
    const range2 = new Range(start, end2);
    expect(Range.intersection(base, range2)).toBe(true);
    const end3 = new Point(2, 0, 1);
    const range3 = new Range(start, end3);
    expect(Range.intersection(base, range3)).toBe(false);
  });

  it("includes", () => {
    const base = new Range(new Point(1, 0, 2), new Point(2, 0, 5));
    const start = new Point(1, 0, 3);
    expect(Range.includes(base, new Range(start, new Point(2, 0, 3)))).toBe(true);
    expect(Range.includes(base, new Range(start, new Point(2, 0, 2)))).toBe(true);
    expect(Range.includes(base, new Range(start, new Point(2, 0, 6)))).toBe(false);
  });
});
