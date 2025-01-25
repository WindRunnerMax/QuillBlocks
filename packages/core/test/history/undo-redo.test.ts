import { Delta } from "block-kit-delta";
import { MutateDelta } from "block-kit-delta";
import { sleep } from "block-kit-utils";

import { Editor } from "../../src/editor";

describe("history undo-redo", () => {
  it("undo & redo", async () => {
    const editor = new Editor();
    // @ts-expect-error protected readonly property
    editor.history.DELAY = 10;
    editor.state.apply(new Delta().insert("1")); // 1
    await sleep(20);
    editor.state.apply(new Delta().retain(1).insert("2", { src: "blob" })); // 12
    await sleep(20);
    editor.state.apply(new Delta().retain(1).insert("3")); // 132
    await sleep(20);
    editor.state.apply(new Delta().retain(2).retain(1, { src: "http" })); // 132
    expect(editor.state.toBlockSet()).toEqual(
      new MutateDelta().insert("13").insert("2", { src: "http" }).insertEOL()
    );
    expect(editor.history.undoable()).toBe(true);
    expect(editor.history.redoable()).toBe(false);
    editor.history.undo();
    expect(editor.state.toBlockSet()).toEqual(
      new MutateDelta().insert("13").insert("2", { src: "blob" }).insertEOL()
    );
    editor.history.undo();
    expect(editor.state.toBlockSet()).toEqual(
      new MutateDelta().insert("1").insert("2", { src: "blob" }).insertEOL()
    );
    editor.history.undo();
    expect(editor.state.toBlockSet()).toEqual(new MutateDelta().insert("1").insertEOL());
    editor.history.undo();
    expect(editor.state.toBlockSet()).toEqual(new MutateDelta().insertEOL());
    expect(editor.history.undoable()).toBe(false);
    editor.history.redo();
    expect(editor.state.toBlockSet()).toEqual(new MutateDelta().insert("1").insertEOL());
    editor.history.redo();
    expect(editor.state.toBlockSet()).toEqual(
      new MutateDelta().insert("1").insert("2", { src: "blob" }).insertEOL()
    );
    editor.history.redo();
    expect(editor.state.toBlockSet()).toEqual(
      new MutateDelta().insert("13").insert("2", { src: "blob" }).insertEOL()
    );
    editor.history.redo();
    expect(editor.state.toBlockSet()).toEqual(
      new MutateDelta().insert("13").insert("2", { src: "http" }).insertEOL()
    );
    expect(editor.history.undoable()).toBe(true);
    expect(editor.history.redoable()).toBe(false);
  });
});
