import { Delta, MutateDelta } from "block-kit-delta";

import { Editor } from "../../src/editor";
import { Point } from "../../src/selection/modules/point";
import { Range } from "../../src/selection/modules/range";

describe("perform insert-enter", () => {
  it("move whole line", () => {
    const delta = new Delta().insert("text").insertEOL({ heading: "true" });
    const editor = new Editor({ delta });
    const sel = new Range(new Point(0, 0), new Point(0, 0));
    editor.perform.insertBreak(sel);
    const newDelta = editor.state.block.toDelta();
    expect(newDelta).toEqual(
      new MutateDelta().insertEOL().insert("text").insertEOL({ heading: "true" })
    );
  });

  it("move whole line with attrs", () => {
    const delta = new Delta().insert("text").insertEOL({ heading: "true" });
    const editor = new Editor({ delta });
    const sel = new Range(new Point(0, 0), new Point(0, 0));
    editor.perform.insertBreak(sel, { a: "1" });
    const newDelta = editor.state.block.toDelta();
    expect(newDelta).toEqual(
      new MutateDelta().insertEOL().insert("text").insertEOL({ heading: "true", a: "1" })
    );
  });

  it("line section", () => {
    const delta = new Delta().insert("text").insertEOL({ heading: "true" });
    const editor = new Editor({ delta });
    const sel = new Range(new Point(0, 2), new Point(0, 2));
    editor.perform.insertBreak(sel);
    const newDelta = editor.state.block.toDelta();
    expect(newDelta).toEqual(
      new MutateDelta()
        .insert("te")
        .insertEOL({ heading: "true" })
        .insert("xt")
        .insertEOL({ heading: "true" })
    );
  });

  it("line section multi sel", () => {
    const delta = new Delta().insert("text123").insertEOL({ heading: "true" }).insert("456");
    const editor = new Editor({ delta });
    const sel = new Range(new Point(0, 2), new Point(0, 4));
    editor.perform.insertBreak(sel);
    const newDelta = editor.state.block.toDelta();
    expect(newDelta).toEqual(
      new MutateDelta()
        .insert("te")
        .insertEOL({ heading: "true" })
        .insert("123")
        .insertEOL({ heading: "true" })
        .insert("456")
        .insertEOL()
    );
  });

  it("line section with attrs", () => {
    const delta = new Delta().insert("text").insertEOL({ heading: "true" });
    const editor = new Editor({ delta });
    const sel = new Range(new Point(0, 2), new Point(0, 2));
    editor.perform.insertBreak(sel, { a: "1" });
    const newDelta = editor.state.block.toDelta();
    expect(newDelta).toEqual(
      new MutateDelta()
        .insert("te")
        .insertEOL({ heading: "true" })
        .insert("xt")
        .insertEOL({ heading: "true", a: "1" })
    );
  });

  it("line section tail", () => {
    const delta = new Delta().insert("text").insertEOL({ heading: "true" });
    const editor = new Editor({ delta });
    const sel = new Range(new Point(0, 4), new Point(0, 4));
    editor.perform.insertBreak(sel);
    const newDelta = editor.state.block.toDelta();
    expect(newDelta).toEqual(
      new MutateDelta().insert("text").insertEOL({ heading: "true" }).insertEOL()
    );
  });

  it("line section tail with attrs", () => {
    const delta = new Delta().insert("text").insertEOL({ heading: "true" });
    const editor = new Editor({ delta });
    const sel = new Range(new Point(0, 4), new Point(0, 4));
    editor.perform.insertBreak(sel, { a: "1" });
    const newDelta = editor.state.block.toDelta();
    expect(newDelta).toEqual(
      new MutateDelta().insert("text").insertEOL({ heading: "true" }).insertEOL({ a: "1" })
    );
  });

  it("cross line within line section", () => {
    const delta = new Delta()
      .insert("text")
      .insertEOL({ heading: "true" })
      .insert("text")
      .insertEOL();
    const editor = new Editor({ delta });
    const sel = new Range(new Point(0, 1), new Point(1, 2));
    editor.perform.insertBreak(sel, { a: "1" });
    const newDelta = editor.state.block.toDelta();
    expect(newDelta).toEqual(
      new MutateDelta()
        .insert("t")
        .insertEOL({ heading: "true" })
        .insert("xt")
        .insertEOL({ a: "1", heading: "true" })
    );
  });
});
