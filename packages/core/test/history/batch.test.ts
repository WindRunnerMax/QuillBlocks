import { Delta, MutateDelta } from "block-kit-delta";
import { sleep } from "block-kit-utils";

import { Editor } from "../../src/editor";

describe("history batch", () => {
  it("signal record", async () => {
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
    // @ts-expect-error protected property
    const undoStack = editor.history.undoStack.map(it => it.delta);
    expect(undoStack[3]).toEqual(new Delta().retain(2).retain(1, { src: "blob" })); // 132
    expect(undoStack[2]).toEqual(new Delta().retain(1).delete(1)); // 12
    expect(undoStack[1]).toEqual(new Delta().retain(1).delete(1)); // 1
    expect(undoStack[0]).toEqual(new Delta().delete(1)); // <empty>
  });

  it("auto compose", async () => {
    const editor = new Editor();
    // @ts-expect-error protected readonly property
    editor.history.DELAY = 10;
    editor.state.apply(new Delta().insert("1")); // 1
    await sleep(20);
    editor.state.apply(new Delta().retain(1).insert("2", { src: "blob" })); // 12
    editor.state.apply(new Delta().retain(1).insert("3")); // 132
    await sleep(20);
    editor.state.apply(new Delta().retain(2).retain(1, { src: "http" })); // 132
    // @ts-expect-error protected property
    const undoStack = editor.history.undoStack.map(it => it.delta);
    expect(undoStack[2]).toEqual(new Delta().retain(2).retain(1, { src: "blob" })); // 132
    expect(undoStack[1]).toEqual(new Delta().retain(1).delete(2)); // 1
    expect(undoStack[0]).toEqual(new Delta().delete(1)); // <empty>
  });

  it("batching", async () => {
    const editor = new Editor();
    // @ts-expect-error protected readonly property
    editor.history.DELAY = 10;
    editor.history.beginBatch();
    editor.state.apply(new Delta().insert("1")); // 1
    await sleep(20);
    editor.state.apply(new Delta().retain(1).insert("2", { src: "blob" })); // 12
    await sleep(20);
    editor.state.apply(new Delta().retain(1).insert("3")); // 132
    await sleep(20);
    editor.state.apply(new Delta().retain(2).retain(1, { src: "http" })); // 132
    expect(editor.history.isBatching()).toBe(true);
    editor.history.closeBatch();
    // @ts-expect-error protected property
    const undoStack = editor.history.undoStack.map(it => it.delta);
    expect(undoStack.length).toBe(1);
    expect(undoStack[0]).toEqual(new MutateDelta().delete(3));
  });

  it("batching state", () => {
    const editor = new Editor();
    editor.history.batch(() => {
      expect(editor.history.isBatching()).toBe(true);
      editor.history.batch(() => {
        expect(editor.history.isBatching()).toBe(true);
      });
    });
    expect(editor.history.isBatching()).toBe(false);
  });
});
