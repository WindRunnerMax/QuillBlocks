import { Delta } from "block-kit-delta";
import { MutateDelta } from "block-kit-delta";

import { Editor, Point, Range } from "../../src";

describe("perform delete", () => {
  it("delete backward text", () => {
    const delta = new Delta().insert("text").insertEOL();
    const editor = new Editor({ delta });
    const sel = new Range(new Point(0, 4), new Point(0, 4));
    editor.perform.deleteBackward(sel);
    expect(editor.state.toBlockSet()).toEqual(new MutateDelta().insert("tex").insertEOL());
  });

  it("delete backward emoji", () => {
    const delta = new Delta().insert("text🧑‍🎨🧑‍🎨123").insertEOL();
    const editor = new Editor({ delta });
    const sel = new Range(new Point(0, 9), new Point(0, 9));
    editor.perform.deleteBackward(sel);
    expect(editor.state.toBlockSet()).toEqual(new MutateDelta().insert("text🧑‍🎨123").insertEOL());
  });

  it("delete forward emoji", () => {
    const delta = new Delta().insert("text🧑‍🎨🧑‍🎨123").insertEOL();
    const editor = new Editor({ delta });
    const sel = new Range(new Point(0, 4), new Point(0, 4));
    editor.perform.deleteForward(sel);
    expect(editor.state.toBlockSet()).toEqual(new MutateDelta().insert("text🧑‍🎨123").insertEOL());
  });
});
