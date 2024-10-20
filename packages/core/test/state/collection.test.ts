import { Point } from "../../src/selection/modules/point";
import { Range } from "../../src/selection/modules/range";
import type { LeafState } from "../../src/state/modules/leaf-state";
import { isLeafRangeIntersect } from "../../src/state/utils/collection";

describe("collection", () => {
  const buildLeaf = (lineIndex: number, offset: number, length: number) => {
    return {
      parent: {
        getIndex: () => lineIndex,
      },
      offset: offset,
      length: length,
    } as unknown as LeafState;
  };

  it("leaf-range-intersect same-line", () => {
    const leafState = buildLeaf(1, 2, 4);
    const start = new Point(1, 2);
    const end = new Point(1, 6);
    const range = new Range(start, end);
    expect(isLeafRangeIntersect(leafState, range)).toBe(true);
  });

  it("leaf-range-intersect middle-line", () => {
    const leafState = buildLeaf(2, 0, 4);
    const start = new Point(1, 3);
    const end = new Point(3, 2);
    const range = new Range(start, end);
    expect(isLeafRangeIntersect(leafState, range)).toBe(true);
  });

  it("leaf-range-intersect start-line", () => {
    const leafState = buildLeaf(1, 2, 2);
    const start = new Point(1, 3);
    const end = new Point(2, 0);
    const range = new Range(start, end);
    expect(isLeafRangeIntersect(leafState, range)).toBe(true);
    const start2 = new Point(1, 4);
    const range2 = new Range(start2, end);
    expect(isLeafRangeIntersect(leafState, range2)).toBe(true);
    const start3 = new Point(1, 5);
    const range3 = new Range(start3, end);
    expect(isLeafRangeIntersect(leafState, range3)).toBe(false);
  });

  it("leaf-range-intersect end-line", () => {
    const leafState = buildLeaf(2, 2, 3);
    const start = new Point(1, 3);
    const end = new Point(2, 3);
    const range = new Range(start, end);
    expect(isLeafRangeIntersect(leafState, range)).toBe(true);
    const end2 = new Point(2, 2);
    const range2 = new Range(start, end2);
    expect(isLeafRangeIntersect(leafState, range2)).toBe(true);
    const end3 = new Point(2, 1);
    const range3 = new Range(start, end3);
    expect(isLeafRangeIntersect(leafState, range3)).toBe(false);
  });
});
