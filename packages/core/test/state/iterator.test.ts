import { Delta } from "block-kit-delta";

import { Editor } from "../../src/editor";
import type { LineState } from "../../src/state/modules/line-state";
import { Iterator } from "../../src/state/mutate/iterator";

describe("mutate state", () => {
  const text1 = { insert: "text" };
  const text2 = { insert: "text", attributes: { bold: "true" } };
  const eol1 = { insert: "\n" };
  const text3 = { insert: "text2" };
  const eol2 = { insert: "\n", attributes: { align: "center" } };
  const delta = new Delta({ ops: [text1, text2, eol1, text3, eol2] });
  const editor = new Editor({ delta });
  const state = editor.state.block;
  const lineState1 = state.getLine(0);
  const lineState2 = state.getLine(1);
  const leafStateText1 = lineState1 && lineState1.getLeaf(0);
  const leafStateText2 = lineState1 && lineState1.getLeaf(1);
  const leafStateEOL1 = lineState1 && lineState1.getLeaf(2);
  const leafStateText3 = lineState2 && lineState2.getLeaf(0);
  const leafStateEOL2 = lineState2 && lineState2.getLeaf(1);
  const leaves = [leafStateText1, leafStateText2, leafStateEOL1, leafStateText3, leafStateEOL2];

  it("first retain", () => {
    const iter = new Iterator(state.getLines());
    const newLines: LineState[] = [];
    const firstRetain = iter.firstRetain(8, newLines);
    expect(firstRetain).toBe(8);
    expect(newLines.length).toBe(0);
    expect(iter.next()).toBe(leafStateText1);
  });

  it("first retain lf", () => {
    const iter = new Iterator(state.getLines());
    const newLines: LineState[] = [];
    const firstRetain = iter.firstRetain(9, newLines);
    expect(firstRetain).toBe(0);
    expect(newLines.length).toBe(1);
    expect(iter.next()).toBe(leafStateText3);
  });

  it("first retain over", () => {
    const iter = new Iterator(state.getLines());
    const newLines: LineState[] = [];
    const firstRetain = iter.firstRetain(10, newLines);
    expect(firstRetain).toBe(1);
    expect(newLines.length).toBe(1);
    expect(iter.next()).toBe(leafStateText3);
  });

  it("next", () => {
    const iter = new Iterator(state.getLines());
    for (let i = 0; i < leaves.length; i += 1) {
      expect(iter.next()).toBe(leaves[i]);
    }
    expect(iter.next()).toEqual(null);
  });

  it("next length", () => {
    const iter = new Iterator(state.getLines());
    expect(iter.next(2)?.op).toEqual({ insert: "te" });
    expect(iter.next(10)?.op).toEqual({ insert: "xt" });
    expect(iter.next(3)?.op).toEqual({ insert: "tex", attributes: { bold: "true" } });
    expect(iter.next(1)?.op).toEqual({ insert: "t", attributes: { bold: "true" } });
    expect(iter.next(1)?.op).toEqual({ insert: "\n" });
    expect(iter.next(1)?.op).toEqual({ insert: "t" });
  });

  it("rest", () => {
    const iter = new Iterator(state.getLines());
    iter.next(2);
    const rest = iter.rest();
    expect(rest.leaf[0]?.op).toEqual({ insert: "xt" });
    expect(rest.leaf[1]).toBe(leafStateText2);
    expect(rest.leaf[2]).toBe(leafStateEOL1);
    expect(rest.line[0]).toBe(lineState2);
  });
});
