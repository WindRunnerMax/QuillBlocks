import type { BlockSetLike } from "../../src";
import { cloneBlockSetLike } from "../../src";

describe("clone", () => {
  const blockSet: BlockSetLike = {
    a: { ops: [{ insert: "123", attributes: { a: "1" } }], blockId: "a", blockType: "Z" },
    b: { ops: [{ insert: "456" }], blockId: "b", blockType: "Z" },
  };
  const newBlockSet = cloneBlockSetLike(blockSet);

  it("equal object content", () => {
    expect(blockSet).toEqual(newBlockSet);
  });

  it("diff object", () => {
    expect(blockSet === newBlockSet).toEqual(false);
  });

  it("diff block delta", () => {
    expect(blockSet.a === newBlockSet.a).toEqual(false);
    expect(blockSet.b === newBlockSet.b).toEqual(false);
  });

  it("diff block delta ops", () => {
    expect(blockSet.a.ops === newBlockSet.a.ops).toEqual(false);
    expect(blockSet.b.ops === newBlockSet.b.ops).toEqual(false);
  });
});
