import type { DeltaSetLike } from "../../src";
import { cloneDeltaSetLike } from "../../src";

describe("clone", () => {
  const deltaSet: DeltaSetLike = {
    a: { ops: [{ insert: "123", attributes: { a: "1" } }], zoneId: "a", parentId: null },
    b: { ops: [{ insert: "456" }], zoneId: "b", parentId: null },
  };
  const newDeltaSet = cloneDeltaSetLike(deltaSet);

  it("equal object content", () => {
    expect(deltaSet).toEqual(newDeltaSet);
  });

  it("diff object", () => {
    expect(deltaSet === newDeltaSet).toEqual(false);
  });

  it("diff zone delta", () => {
    expect(deltaSet.a === newDeltaSet.a).toEqual(false);
    expect(deltaSet.b === newDeltaSet.b).toEqual(false);
  });

  it("diff zone delta ops", () => {
    expect(deltaSet.a.ops === newDeltaSet.a.ops).toEqual(false);
    expect(deltaSet.b.ops === newDeltaSet.b.ops).toEqual(false);
  });
});
