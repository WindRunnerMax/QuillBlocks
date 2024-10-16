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

  it("range constructor", () => {
    const start = new Point(0, 0);
    const end = new Point(1, 0);
    const range = new Range(start, end);
    expect(range.isBackward).toBe(false);
    expect(range.isCollapsed).toBe(false);
    expect(range.start).toBe(start);
    expect(range.end).toBe(end);
  });

  it("range constructor backward", () => {
    const start = new Point(1, 0);
    const end = new Point(0, 0);
    const range = new Range(start, end);
    expect(range.isBackward).toBe(true);
    expect(range.isCollapsed).toBe(false);
    expect(range.start).toBe(end);
    expect(range.end).toBe(start);
  });

  it("range constructor collapsed", () => {
    const start = new Point(0, 0);
    const end = new Point(0, 0);
    const range = new Range(start, end, true);
    expect(range.isBackward).toBe(false);
    expect(range.isCollapsed).toBe(true);
  });

  it("range from-raw", () => {
    const rawRange = new RawRange(0, 9);
    const range = Range.fromRaw(editor, rawRange);
    const target = new Range(new Point(0, 0), new Point(1, 0));
    expect(range).toEqual(target);
  });

  it("range from-raw overflow", () => {
    const rawRange = new RawRange(0, 20);
    const range = Range.fromRaw(editor, rawRange);
    expect(range).toEqual(null);
  });

  it("range is-equal", () => {
    const range1 = new Range(new Point(0, 0), new Point(1, 0));
    const range2 = new Range(new Point(0, 0), new Point(1, 0));
    const range3 = new Range(new Point(0, 0), new Point(1, 1));
    expect(Range.isEqual(range1, range2)).toBe(true);
    expect(Range.isEqual(range1, range3)).toBe(false);
    expect(Range.isEqual(range3.clone(), range3)).toBe(true);
  });

  it("raw-range from-range", () => {
    const range = new Range(new Point(0, 0), new Point(1, 0));
    const rawRange = RawRange.fromRange(editor, range);
    expect(rawRange).toEqual(new RawRange(0, 9));
  });

  it("raw-range from-range overflow", () => {
    const range = new Range(new Point(0, 0), new Point(1, 10));
    const rawRange = RawRange.fromRange(editor, range);
    expect(rawRange).toEqual(null);
  });

  it("raw-range is-equal", () => {
    const range1 = new RawRange(0, 9);
    const range2 = new RawRange(0, 9);
    const range3 = new RawRange(0, 10);
    expect(RawRange.isEqual(range1, range2)).toBe(true);
    expect(RawRange.isEqual(range1, range3)).toBe(false);
    expect(RawRange.isEqual(range3.clone(), range3)).toBe(true);
  });
});
