import { Delta } from "block-kit-delta";
import { MutateDelta } from "block-kit-delta";

import { Editor, Point, Range } from "../../src";

describe("perform block", () => {
  it("delete backward block", () => {
    const delta = new Delta()
      .insert("text")
      .insertEOL()
      .insert(" ", { image: "blob" })
      .insertEOL()
      .insertEOL();
    const editor = new Editor({
      delta,
      schema: {
        image: { block: true, void: true },
      },
    });
    const sel = new Range(new Point(1, 1), new Point(1, 1));
    editor.perform.deleteBackward(sel);
    expect(editor.state.toBlockSet()).toEqual(
      new MutateDelta().insert("text").insertEOL().insertEOL().insertEOL()
    );
  });

  it("delete forward block", () => {
    const delta = new Delta()
      .insert("text")
      .insertEOL()
      .insert(" ", { image: "blob" })
      .insertEOL()
      .insertEOL();
    const editor = new Editor({
      delta,
      schema: {
        image: { block: true, void: true },
      },
    });
    const sel = new Range(new Point(1, 1), new Point(1, 1));
    editor.perform.deleteForward(sel);
    expect(editor.state.toBlockSet()).toEqual(
      new MutateDelta().insert("text").insertEOL().insertEOL().insertEOL()
    );
  });

  it("delete backward block line", () => {
    const delta = new Delta()
      .insert("text")
      .insertEOL()
      .insert(" ", { image: "blob" })
      .insertEOL()
      .insertEOL();
    const editor = new Editor({
      delta,
      schema: {
        image: { block: true, void: true },
      },
    });
    const sel = new Range(new Point(2, 0), new Point(2, 0));
    editor.perform.deleteBackward(sel);
    const sel2 = editor.selection.get();
    expect(sel2).toEqual(Range.fromTuple([1, 0], [1, 1]));
    editor.perform.deleteBackward(sel2!);
    expect(editor.state.toBlockSet()).toEqual(
      new MutateDelta().insert("text").insertEOL().insertEOL().insertEOL()
    );
  });

  it("delete forward block line", () => {
    const delta = new Delta()
      .insert("text")
      .insertEOL()
      .insert(" ", { image: "blob" })
      .insertEOL()
      .insertEOL();
    const editor = new Editor({
      delta,
      schema: {
        image: { block: true, void: true },
      },
    });
    const sel = new Range(new Point(0, 4), new Point(0, 4));
    editor.perform.deleteForward(sel);
    const sel2 = editor.selection.get();
    expect(sel2).toEqual(Range.fromTuple([1, 0], [1, 1]));
    editor.perform.deleteForward(sel2!);
    expect(editor.state.toBlockSet()).toEqual(
      new MutateDelta().insert("text").insertEOL().insertEOL().insertEOL()
    );
  });
});
