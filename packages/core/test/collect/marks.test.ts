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

  it("insert temp marks", () => {
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

  it("collect inline mark", () => {
    const delta = new Delta()
      .insert("text", { inline: "true" })
      .insert("text2", { bold: "true", inline: "true" })
      .insert("text3", { bold: "true" });
    const editor = new Editor({
      delta,
      schema: {
        bold: { mark: true },
        inline: { mark: true, inline: true },
      },
    });
    const point = new Point(0, 5);
    const leaf = editor.collect.getLeafAtPoint(point);
    const isLeafTail = leaf && point.offset - leaf.offset - leaf.length >= 0;
    const attributes = editor.collect.getLeafMarks(leaf, isLeafTail);
    expect(attributes).toEqual({ bold: "true", inline: "true" });
  });

  it("collect inline mark tail", () => {
    const delta = new Delta()
      .insert("text", { inline: "true" })
      .insert("text2", { bold: "true", inline: "true" })
      .insert("text3", { bold: "true" });
    const editor = new Editor({
      delta,
      schema: {
        bold: { mark: true },
        inline: { mark: true, inline: true },
      },
    });
    const point = new Point(0, 9);
    const leaf = editor.collect.getLeafAtPoint(point);
    const isLeafTail = leaf && point.offset - leaf.offset - leaf.length >= 0;
    const attributes = editor.collect.getLeafMarks(leaf, isLeafTail);
    expect(attributes).toEqual({ bold: "true" });
  });

  it("collect inline mark tail inside", () => {
    const delta = new Delta()
      .insert("text", { inline: "true" })
      .insert("text2", { bold: "true", inline: "true" })
      .insert("text3", { bold: "true" });
    const editor = new Editor({
      delta,
      schema: {
        bold: { mark: true },
        inline: { mark: true, inline: true },
      },
    });
    const point = new Point(0, 4);
    const leaf = editor.collect.getLeafAtPoint(point);
    const isLeafTail = leaf && point.offset - leaf.offset - leaf.length >= 0;
    const attributes = editor.collect.getLeafMarks(leaf, isLeafTail);
    expect(attributes).toEqual({ inline: "true" });
  });
});
