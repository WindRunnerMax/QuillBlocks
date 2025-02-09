import { Delta } from "block-kit-delta";
import { sleep } from "block-kit-utils";

import { APPLY_SOURCE, Editor } from "../../src";

describe("history remote", () => {
  it("image upload", async () => {
    const editor = new Editor();
    // @ts-expect-error protected readonly property
    editor.history.DELAY = 10;
    editor.state.apply(new Delta().insert(" ", { src: "blob" }));
    await sleep(20);
    editor.state.apply(new Delta().retain(1, { src: "http" }), { source: APPLY_SOURCE.REMOTE });
    // @ts-expect-error protected readonly property
    const undoStack = editor.history.undoStack.map(it => it.delta);
    expect(undoStack[0]).toEqual(new Delta().delete(1));
  });
});
