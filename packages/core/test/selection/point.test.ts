import { Delta } from "block-kit-delta";

import { Editor } from "../../src/editor";
import { Point } from "../../src/selection/modules/point";
import { RawPoint } from "../../src/selection/modules/raw-point";

describe("point", () => {
  const delta = new Delta()
    .insert("text")
    .insert("text", { bold: "true" })
    .insert("\n")
    .insert("text2")
    .insert("\n", { align: "center" });
  const editor = new Editor({ delta });

  it("point from-raw", () => {
    const rawPoint = new RawPoint(9);
    const point = Point.fromRaw(editor, rawPoint);
    expect(point).toEqual(new Point(1, 0));
  });

  it("point from-raw overflow", () => {
    const rawPoint = new RawPoint(20);
    const point = Point.fromRaw(editor, rawPoint);
    expect(point).toEqual(null);
  });

  it("point is-equal", () => {
    const point1 = new Point(1, 0);
    const point2 = new Point(1, 0);
    const point3 = new Point(1, 1);
    expect(Point.isEqual(point1, point2)).toBe(true);
    expect(Point.isEqual(point1, point3)).toBe(false);
    expect(Point.isEqual(point3.clone(), point3)).toBe(true);
  });

  it("point is-before", () => {
    const point1 = new Point(1, 0);
    const point2 = new Point(1, 1);
    const point3 = new Point(2, 0);
    const point4 = new Point(1, 0);
    expect(Point.isBefore(point1, point2)).toBe(true);
    expect(Point.isBefore(point1, point3)).toBe(true);
    expect(Point.isBefore(point2, point3)).toBe(true);
    expect(Point.isBefore(point1, point4)).toBe(false);
  });

  it("raw-point from-point", () => {
    const point = new Point(1, 1);
    const rawPoint = RawPoint.fromPoint(editor, point);
    expect(rawPoint).toEqual(new RawPoint(10));
  });

  it("raw-point from-point overflow", () => {
    const point = new Point(10, 1);
    const rawPoint = RawPoint.fromPoint(editor, point);
    expect(rawPoint).toEqual(null);
  });

  it("raw-point is-equal", () => {
    const point1 = new RawPoint(1);
    const point2 = new RawPoint(1);
    const point3 = new RawPoint(11);
    expect(RawPoint.isEqual(point1, point2)).toBe(true);
    expect(RawPoint.isEqual(point1, point3)).toBe(false);
    expect(RawPoint.isEqual(point3.clone(), point3)).toBe(true);
  });

  it("raw-point is-before", () => {
    const point1 = new RawPoint(9);
    const point2 = new RawPoint(9);
    const point3 = new RawPoint(11);
    const point4 = new RawPoint(9);
    expect(RawPoint.isBefore(point1, point2)).toBe(false);
    expect(RawPoint.isBefore(point1, point3)).toBe(true);
    expect(RawPoint.isBefore(point2, point3)).toBe(true);
    expect(RawPoint.isBefore(point1, point4)).toBe(false);
  });
});
