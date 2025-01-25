import { Delta } from "block-kit-delta";
import { sleep } from "block-kit-utils";

import { Editor } from "../../src/editor";

describe("history merge", () => {
  const editor = new Editor();
  // @ts-expect-error protected readonly property
  editor.history.DELAY = 10;

  it("merge record", async () => {
    editor.state.apply(new Delta().insert("1")); // 1
    await sleep(20);
    const { id: id1 } = editor.state.apply(new Delta().retain(1).insert("2", { src: "blob" })); // 12
    await sleep(20);
    editor.state.apply(new Delta().retain(1).insert("3")); // 132
    await sleep(20);
    const { id: id2 } = editor.state.apply(new Delta().retain(2).retain(1, { src: "http" })); // 132
    editor.history.mergeRecord(id1, id2);
    // @ts-expect-error protected property
    const undoStack = editor.history.undoStack.map(it => it.delta);
    expect(undoStack[2]).toEqual(new Delta().retain(1).delete(1)); // 12
    expect(undoStack[1]).toEqual(new Delta().retain(1).delete(1)); // 1
    expect(undoStack[0]).toEqual(new Delta().delete(1)); // <empty>
  });
});
