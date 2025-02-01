import { Delta } from "block-kit-delta";
import { MutateDelta } from "block-kit-delta";

import { Editor, Point, Range } from "../../src";

describe("collect marks", () => {
  it("collapsed selection", () => {
    const delta = new Delta().insert("text", { bold: "true" });
    const editor = new Editor({
      delta,
      schema: {
        bold: { mark: true },
      },
    });
    editor.selection.set(new Range(new Point(0, 0), new Point(0, 0)));
    expect(editor.collect.marks).toEqual({ bold: "true" });
  });

  it("not collapsed selection", () => {
    const delta = new Delta().insert("text", { bold: "true" });
    const editor = new Editor({
      delta,
      schema: {
        bold: { mark: true },
      },
    });
    editor.selection.set(new Range(new Point(0, 0), new Point(0, 1)));
    expect(editor.collect.marks).toEqual({});
  });

  it("insert text", () => {
    const delta = new Delta().insert("text", { bold: "true" });
    const editor = new Editor({
      delta,
      schema: {
        bold: { mark: true },
        italic: { mark: true },
      },
    });
    editor.selection.set(new Range(new Point(0, 1), new Point(0, 1)));
    expect(editor.collect.marks).toEqual({ bold: "true" });
    editor.collect.marks["italic"] = "true";
    editor.perform.insertText(editor.selection.get()!, "1");
    expect(editor.collect.marks).toEqual({ bold: "true", italic: "true" });
    expect(editor.state.toBlockSet()).toEqual(
      new MutateDelta()
        .insert("t", { bold: "true" })
        .insert("1", { bold: "true", italic: "true" })
        .insert("ext", { bold: "true" })
        .insertEOL()
    );
  });
});
