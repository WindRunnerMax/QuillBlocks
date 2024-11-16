import { Delta } from "block-kit-delta";

import { Editor } from "../../src/editor";
import { Point } from "../../src/selection/modules/point";
import { Range } from "../../src/selection/modules/range";

describe("perform marks", () => {
  it("signal line", () => {
    const delta = new Delta()
      .insert("text")
      .insert("text", { bold: "true" })
      .insert("\n")
      .insert("text2")
      .insert("\n");
    const editor = new Editor({ delta });
    const sel = new Range(new Point(0, 1), new Point(0, 3));
    editor.perform.applyMarks(sel, { bold: "true" });
    const line = editor.state.block.getLine(0)?.getOps();
    expect(line).toEqual(
      new Delta()
        .insert("t")
        .insert("ex", { bold: "true" })
        .insert("t")
        .insert("text", { bold: "true" })
        .insert("\n").ops
    );
  });

  it("next to line", () => {
    const delta = new Delta()
      .insert("text")
      .insert("text", { bold: "true", a: "true" })
      .insert("\n")
      .insert("text2", { b: "true" })
      .insert("\n");
    const editor = new Editor({ delta });
    const sel = new Range(new Point(0, 1), new Point(1, 3));
    editor.perform.applyMarks(sel, { bold: "true", a: "" });
    const newDelta = editor.state.block.toDelta();
    expect(newDelta).toEqual(
      new Delta()
        .insert("t")
        .insert("exttext", { bold: "true" })
        .insert("\n")
        .insert("tex", { b: "true", bold: "true" })
        .insert("t2", { b: "true" })
        .insert("\n")
    );
  });

  it("across line", () => {
    const delta = new Delta()
      .insert("text")
      .insert("text", { bold: "true", a: "true" })
      .insert("\n")
      .insert("text2", { b: "true" })
      .insert("\n")
      .insert("text3", { b: "true" })
      .insert("\n");
    const editor = new Editor({ delta });
    const sel = new Range(new Point(0, 1), new Point(2, 3));
    editor.perform.applyMarks(sel, { bold: "true", a: "" });
    const newDelta = editor.state.block.toDelta();
    expect(newDelta).toEqual(
      new Delta()
        .insert("t")
        .insert("exttext", { bold: "true" })
        .insert("\n")
        .insert("text2", { b: "true", bold: "true" })
        .insert("\n")
        .insert("tex", { b: "true", bold: "true" })
        .insert("t3", { b: "true" })
        .insert("\n")
    );
  });
});
