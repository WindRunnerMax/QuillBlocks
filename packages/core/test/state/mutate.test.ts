import type { Ops } from "block-kit-delta";
import { Delta } from "block-kit-delta";

import { Editor } from "../../src/editor";
import { Mutate } from "../../src/state/mutate";

describe("mutate iterator", () => {
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

  it("compose retain", () => {
    const changes = new Delta().retain(10);
    const mutate = new Mutate(state);
    const newLines = mutate.compose(changes);
    expect(newLines.length).toBe(2);
    const newLineState1 = newLines[0];
    const newLineState2 = newLines[1];
    expect(lineState1).toBe(newLineState1);
    expect(newLineState1.getLeaf(0)).toBe(leafStateText1);
    expect(newLineState1.getLeaf(1)).toBe(leafStateText2);
    expect(newLineState1.getLeaf(2)).toBe(leafStateEOL1);
    expect(lineState2).not.toBe(newLineState2);
    expect(newLineState2.getLeaf(0)).not.toBe(leafStateText3);
    expect(newLineState2.getLeaf(1)).toBe(leafStateEOL2);
  });

  it("compose entity retain", () => {
    const changes = new Delta().retain(8);
    const mutate = new Mutate(state);
    const newLines = mutate.compose(changes);
    const newLineState1 = newLines[0];
    const newLineState2 = newLines[1];
    expect(lineState1?.key).toBe(newLineState1.key);
    expect(newLineState1.getLeaf(0)).toBe(leafStateText1);
    expect(newLineState1.getLeaf(1)).toBe(leafStateText2);
    expect(newLineState1.getLeaf(2)).toBe(leafStateEOL1);
    expect(lineState2).toBe(newLineState2);
    expect(newLineState2.getLeaf(0)).toBe(leafStateText3);
    expect(newLineState2.getLeaf(1)).toBe(leafStateEOL2);
  });

  it("compose insert", () => {
    const changes = new Delta().retain(7).insert("123\n456");
    const mutate = new Mutate(state);
    const newLines = mutate.compose(changes);
    const ops: Ops = [];
    newLines.forEach(line => ops.push(...line.getOps()));
    expect(ops.length).toBe(9);
    const newLineState1 = newLines[0];
    const newLineState2 = newLines[1];
    const newLineState3 = newLines[2];
    expect(lineState1).not.toBe(newLineState1);
    expect(newLineState1.getLeaf(0)).toBe(leafStateText1);
    expect(newLineState2.getLeaf(2)).toBe(leafStateEOL1);
    expect(lineState2).toBe(newLineState3);
    expect(newLineState3.getLeaf(0)).toBe(leafStateText3);
    expect(newLineState3.getLeaf(1)).toBe(leafStateEOL2);
  });

  it("compose delete", () => {
    const changes = new Delta().retain(4).delete(2);
    const mutate = new Mutate(state);
    const newLines = mutate.compose(changes);
    const ops: Ops = [];
    newLines.forEach(line => ops.push(...line.getOps()));
    expect(ops.length).toBe(5);
    const newLineState1 = newLines[0];
    const newLineState2 = newLines[1];
    expect(lineState1).not.toBe(newLineState1);
    expect(newLineState1.getLeaf(0)).toBe(leafStateText1);
    expect(newLineState1.getLeaf(2)).toBe(leafStateEOL1);
    expect(lineState2).toBe(newLineState2);
    expect(newLineState2.getLeaf(0)).toBe(leafStateText3);
    expect(newLineState2.getLeaf(1)).toBe(leafStateEOL2);
  });

  it("reduce line length", () => {
    const changes = new Delta().retain(4).delete(4);
    const mutate = new Mutate(state);
    const newLines = mutate.compose(changes);
    expect(newLines.length).toBe(2);
    const newLineState1 = newLines[0];
    const newLineState2 = newLines[1];
    expect(lineState1).not.toBe(newLineState1);
    expect(newLineState1.getLeaf(0)).toBe(leafStateText1);
    expect(newLineState1.getLeaf(1)).toBe(leafStateEOL1);
    expect(lineState2).toBe(newLineState2);
    expect(newLineState2.getLeaf(0)).toBe(leafStateText3);
    expect(newLineState2.getLeaf(1)).toBe(leafStateEOL2);
  });

  it("retain whole attrs", () => {
    const changes = new Delta().retain(4).retain(4, { bold: "false" });
    const mutate = new Mutate(state);
    const newLines = mutate.compose(changes);
    const newLeaf1 = newLines[0]?.getLeaf(1);
    expect(newLeaf1).toBeTruthy();
    expect(newLeaf1).not.toEqual(leafStateText2);
  });
});
