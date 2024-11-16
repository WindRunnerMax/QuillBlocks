import { Delta } from "block-kit-delta";

import { Editor } from "../../src/editor";
import { Point } from "../../src/selection/modules/point";
import { Range } from "../../src/selection/modules/range";
import { RawRange } from "../../src/selection/modules/raw-range";

describe("selection raw-range", () => {
  const delta = new Delta()
    .insert("text")
    .insert("text", { bold: "true" })
    .insert("\n")
    .insert("text2")
    .insert("\n", { align: "center" });
  const editor = new Editor({ delta });

  it("from-range", () => {
    const range = new Range(new Point(0, 0), new Point(1, 0));
    const rawRange = RawRange.fromRange(editor, range);
    expect(rawRange).toEqual(new RawRange(0, 9));
  });

  it("from-range overflow", () => {
    const range = new Range(new Point(0, 0), new Point(1, 10));
    const rawRange = RawRange.fromRange(editor, range);
    expect(rawRange).toEqual(null);
  });

  it("is-equal", () => {
    const range1 = new RawRange(0, 9);
    const range2 = new RawRange(0, 9);
    const range3 = new RawRange(0, 10);
    expect(RawRange.isEqual(range1, range2)).toBe(true);
    expect(RawRange.isEqual(range1, range3)).toBe(false);
    expect(RawRange.isEqual(range3.clone(), range3)).toBe(true);
  });

  it("includes", () => {
    const base = RawRange.fromEdge(5, 10);
    expect(RawRange.includes(base, RawRange.fromEdge(5, 10))).toBe(true);
    expect(RawRange.includes(base, RawRange.fromEdge(6, 10))).toBe(true);
    expect(RawRange.includes(base, RawRange.fromEdge(6, 9))).toBe(true);
    expect(RawRange.includes(base, RawRange.fromEdge(1, 6))).toBe(false);
    expect(RawRange.includes(base, RawRange.fromEdge(10, 11))).toBe(false);
  });

  it("intersection", () => {
    const base = RawRange.fromEdge(5, 10);
    expect(RawRange.intersection(base, RawRange.fromEdge(5, 10))).toBe(true);
    expect(RawRange.intersection(base, RawRange.fromEdge(6, 10))).toBe(true);
    expect(RawRange.intersection(base, RawRange.fromEdge(6, 9))).toBe(true);
    expect(RawRange.intersection(base, RawRange.fromEdge(1, 6))).toBe(true);
    expect(RawRange.intersection(base, RawRange.fromEdge(10, 11))).toBe(true);
    expect(RawRange.intersection(base, RawRange.fromEdge(11, 11))).toBe(false);
  });
});
