import { Delta } from "block-kit-delta";
import { MutateDelta } from "block-kit-delta";

import { Editor, Point, Range } from "../../src";

describe("perform insert-text", () => {
  it("insert mark text", () => {
    const delta = new Delta().insert("text", { bold: "true" });
    const editor = new Editor({
      delta,
      schema: {
        bold: { mark: true },
        italic: { mark: true },
      },
    });
    editor.selection.set(new Range(new Point(0, 1), new Point(0, 1)));
    editor.perform.insertText(editor.selection.get()!, "1");
    expect(editor.state.toBlockSet()).toEqual(
      new MutateDelta().insert("t1ext", { bold: "true" }).insertEOL()
    );
  });

  it("insert inline mark text", () => {
    const delta = new Delta().insert("text2", { italic: "true" }).insert("text", { bold: "true" });
    const editor = new Editor({
      delta,
      schema: {
        bold: { mark: true },
        italic: { mark: true, inline: true },
      },
    });
    editor.selection.set(new Range(new Point(0, 5), new Point(0, 5)));
    editor.perform.insertText(editor.selection.get()!, "1");
    expect(editor.state.toBlockSet()).toEqual(
      new MutateDelta()
        .insert("text2", { italic: "true" })
        .insert("1")
        .insert("text", { bold: "true" })
        .insertEOL()
    );
  });

  it("insert not collapsed inline mark text", () => {
    const delta = new Delta().insert("text2", { italic: "true" }).insert("text", { bold: "true" });
    const editor = new Editor({
      delta,
      schema: {
        bold: { mark: true },
        italic: { mark: true, inline: true },
      },
    });
    editor.selection.set(new Range(new Point(0, 5), new Point(0, 8)));
    editor.perform.insertText(editor.selection.get()!, "1");
    expect(editor.state.toBlockSet()).toEqual(
      new MutateDelta()
        .insert("text2", { italic: "true" })
        .insert("1")
        .insert("t", { bold: "true" })
        .insertEOL()
    );
  });
});
