import { Delta } from "block-kit-delta";

import { Editor } from "../../src/editor";
import { EditorState } from "../../src/state";
import { EDITOR_STATE } from "../../src/state/types";

describe("state", () => {
  const delta = new Delta();
  const editor = new Editor();

  it("base", () => {
    const state = new EditorState(editor, delta);
    state.set(EDITOR_STATE.COMPOSING, true);
    expect(state.get(EDITOR_STATE.COMPOSING)).toEqual(true);
    state.set(EDITOR_STATE.COMPOSING, false);
    expect(state.get(EDITOR_STATE.COMPOSING)).toEqual(false);
  });
});
