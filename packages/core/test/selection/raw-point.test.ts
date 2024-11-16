import { Delta } from "block-kit-delta";

import { Editor } from "../../src/editor";
import { Point } from "../../src/selection/modules/point";
import { RawPoint } from "../../src/selection/modules/raw-point";

describe("selection raw-point", () => {
  const delta = new Delta()
    .insert("text")
    .insert("text", { bold: "true" })
    .insert("\n")
    .insert("text2")
    .insert("\n", { align: "center" });
  const editor = new Editor({ delta });

  it("from-point", () => {
    const point = new Point(1, 1);
    const rawPoint = RawPoint.fromPoint(editor, point);
    expect(rawPoint).toEqual(new RawPoint(10));
  });

  it("from-point overflow", () => {
    const point = new Point(10, 1);
    const rawPoint = RawPoint.fromPoint(editor, point);
    expect(rawPoint).toEqual(null);
  });

  it("is-equal", () => {
    const point1 = new RawPoint(1);
    const point2 = new RawPoint(1);
    const point3 = new RawPoint(11);
    expect(RawPoint.isEqual(point1, point2)).toBe(true);
    expect(RawPoint.isEqual(point1, point3)).toBe(false);
    expect(RawPoint.isEqual(point3.clone(), point3)).toBe(true);
  });

  it("is-before", () => {
    const point1 = new RawPoint(9);
    const point2 = new RawPoint(9);
    const point3 = new RawPoint(11);
    const point4 = new RawPoint(9);
    expect(RawPoint.isBefore(point1, point2)).toBe(false);
    expect(RawPoint.isBefore(point1, point3)).toBe(true);
    expect(RawPoint.isBefore(point2, point3)).toBe(true);
    expect(RawPoint.isBefore(point1, point4)).toBe(false);
  });

  it("is-after", () => {
    const point1 = new RawPoint(9);
    const point2 = new RawPoint(9);
    const point3 = new RawPoint(8);
    const point4 = new RawPoint(11);
    expect(RawPoint.isAfter(point1, point2)).toBe(false);
    expect(RawPoint.isAfter(point1, point3)).toBe(true);
    expect(RawPoint.isAfter(point2, point3)).toBe(true);
    expect(RawPoint.isAfter(point1, point4)).toBe(false);
  });
});
