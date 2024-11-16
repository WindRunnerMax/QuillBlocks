import { Delta } from "block-kit-delta";

import { Editor } from "../../src/editor";
import { Point } from "../../src/selection/modules/point";
import { RawPoint } from "../../src/selection/modules/raw-point";

describe("selection point", () => {
  const delta = new Delta()
    .insert("text")
    .insert("text", { bold: "true" })
    .insert("\n")
    .insert("text2")
    .insert("\n", { align: "center" });
  const editor = new Editor({ delta });

  it("from-raw", () => {
    const rawPoint = new RawPoint(9);
    const point = Point.fromRaw(editor, rawPoint);
    expect(point).toEqual(new Point(1, 0));
  });

  it("from-raw overflow", () => {
    const rawPoint = new RawPoint(20);
    const point = Point.fromRaw(editor, rawPoint);
    expect(point).toEqual(null);
  });

  it("is-equal", () => {
    const point1 = new Point(1, 0);
    const point2 = new Point(1, 0);
    const point3 = new Point(1, 1);
    expect(Point.isEqual(point1, point2)).toBe(true);
    expect(Point.isEqual(point1, point3)).toBe(false);
    expect(Point.isEqual(point3.clone(), point3)).toBe(true);
  });

  it("is-before", () => {
    const point1 = new Point(1, 0);
    const point2 = new Point(1, 1);
    const point3 = new Point(2, 0);
    const point4 = new Point(1, 0);
    expect(Point.isBefore(point1, point2)).toBe(true);
    expect(Point.isBefore(point1, point3)).toBe(true);
    expect(Point.isBefore(point2, point3)).toBe(true);
    expect(Point.isBefore(point1, point4)).toBe(false);
  });

  it("is-after", () => {
    const point1 = new Point(1, 1);
    const point2 = new Point(1, 1);
    const point3 = new Point(2, 0);
    const point4 = new Point(1, 0);
    expect(Point.isAfter(point1, point2)).toBe(false);
    expect(Point.isAfter(point1, point3)).toBe(false);
    expect(Point.isAfter(point2, point3)).toBe(false);
    expect(Point.isAfter(point1, point4)).toBe(true);
  });
});
