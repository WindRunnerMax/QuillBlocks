import { Delta, MutateDelta } from "block-kit-delta";

import { Editor } from "../../src/editor";
import { Point } from "../../src/selection/modules/point";
import { Range } from "../../src/selection/modules/range";

describe("perform line-marks", () => {
  it("signal line", () => {
    const delta = new Delta()
      .insert("text")
      .insert("\n", { a: "true" })
      .insert("text2")
      .insert("\n");
    const editor = new Editor({ delta });
    const sel = new Range(new Point(0, 1), new Point(0, 3));
    editor.perform.applyLineMarks(sel, { b: "true" });
    const newDelta = editor.state.block.toDelta();
    expect(newDelta).toEqual(
      new MutateDelta()
        .insert("text")
        .insert("\n", { a: "true", b: "true" })
        .insert("text2")
        .insert("\n")
    );
  });

  it("next to line", () => {
    const delta = new Delta()
      .insert("text")
      .insert("\n", { a: "true" })
      .insert("text2")
      .insert("\n");
    const editor = new Editor({ delta });
    const sel = new Range(new Point(0, 1), new Point(1, 3));
    editor.perform.applyLineMarks(sel, { b: "true", a: "" });
    const newDelta = editor.state.block.toDelta();
    expect(newDelta).toEqual(
      new MutateDelta()
        .insert("text")
        .insert("\n", { b: "true" })
        .insert("text2")
        .insert("\n", { b: "true" })
    );
  });

  it("across line", () => {
    const delta = new Delta()
      .insert("text")
      .insert("\n", { a: "true" })
      .insert("text2")
      .insert("\n")
      .insert("text3")
      .insert("\n");
    const editor = new Editor({ delta });
    const sel = new Range(new Point(0, 1), new Point(2, 3));
    editor.perform.applyLineMarks(sel, { b: "true", a: "" });
    const newDelta = editor.state.block.toDelta();
    expect(newDelta).toEqual(
      new MutateDelta()
        .insert("text")
        .insert("\n", { b: "true" })
        .insert("text2")
        .insert("\n", { b: "true" })
        .insert("text3")
        .insert("\n", { b: "true" })
    );
  });
});
