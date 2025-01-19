import { Delta } from "block-kit-delta";

import { Editor } from "../../src/editor";
import { Mutate } from "../../src/state/mutate";

describe("state mutate", () => {
  const text1 = { insert: "text" };
  const text2 = { insert: "text", attributes: { bold: "true" } };
  const eol1 = { insert: "\n" };
  const text3 = { insert: "text2" };
  const eol2 = { insert: "\n", attributes: { align: "center" } };
  const delta = new Delta({ ops: [text1, text2, eol1, text3, eol2] });
  const editor = new Editor({ delta });
  const state = editor.state.block;

  it("compose retain", () => {
    const changes = new Delta().retain(10);
    const mutate = new Mutate(state);
    mutate.compose(changes);
    expect(mutate.inserts).toEqual([]);
    expect(mutate.revises).toEqual([]);
    expect(mutate.deletes).toEqual([]);
  });

  it("compose entity retain", () => {
    const changes = new Delta().retain(8);
    const mutate = new Mutate(state);
    mutate.compose(changes);
    expect(mutate.inserts).toEqual([]);
    expect(mutate.revises).toEqual([]);
    expect(mutate.deletes).toEqual([]);
  });

  it("compose insert", () => {
    const changes = new Delta().retain(7).insert("123\n456");
    const mutate = new Mutate(state);
    mutate.compose(changes);
    expect(mutate.inserts).toEqual([{ insert: "123" }, { insert: "\n" }, { insert: "456" }]);
    expect(mutate.revises).toEqual([]);
    expect(mutate.deletes).toEqual([]);
  });

  it("compose delete", () => {
    const changes = new Delta().retain(4).delete(2);
    const mutate = new Mutate(state);
    mutate.compose(changes);
    expect(mutate.inserts).toEqual([]);
    expect(mutate.revises).toEqual([]);
    expect(mutate.deletes).toEqual([{ insert: "te", attributes: { bold: "true" } }]);
  });

  it("reduce line length", () => {
    const changes = new Delta().retain(4).delete(4);
    const mutate = new Mutate(state);
    mutate.compose(changes);
    expect(mutate.inserts).toEqual([]);
    expect(mutate.revises).toEqual([]);
    expect(mutate.deletes).toEqual([{ insert: "text", attributes: { bold: "true" } }]);
  });

  it("retain whole attrs", () => {
    const changes = new Delta().retain(4).retain(4, { bold: "false" });
    const mutate = new Mutate(state);
    mutate.compose(changes);
    expect(mutate.inserts).toEqual([]);
    expect(mutate.revises).toEqual([{ insert: "text", attributes: { bold: "false" } }]);
    expect(mutate.deletes).toEqual([]);
  });
});
