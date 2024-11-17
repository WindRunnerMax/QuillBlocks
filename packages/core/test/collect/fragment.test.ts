import { Delta, MutateDelta } from "block-kit-delta";

import { Editor } from "../../src/editor";
import { Point } from "../../src/selection/modules/point";
import { Range } from "../../src/selection/modules/range";

describe("collect fragment", () => {
  it("base", () => {
    const delta = new Delta()
      .insert("text")
      .insert("text", { bold: "true" })
      .insert("\n")
      .insert("text2")
      .insert("\n");
    const editor = new Editor({ delta });
    const sel = new Range(new Point(0, 1), new Point(0, 3));
    const ops = editor.collect.getFragment(sel);
    expect(ops).toEqual(new Delta().insert("ex").ops);
  });

  it("next to line", () => {
    const delta = new Delta()
      .insert("text")
      .insert("text", { bold: "true" })
      .insert("\n")
      .insert("text2")
      .insert("\n");
    const editor = new Editor({ delta });
    const sel = new Range(new Point(0, 1), new Point(1, 3));
    const ops = editor.collect.getFragment(sel);
    const t = new MutateDelta()
      .insert("ext")
      .insert("text", { bold: "true" })
      .insert("\n")
      .insert("tex");
    expect(ops).toEqual(t.ops);
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
    const ops = editor.collect.getFragment(sel);
    const t = new MutateDelta()
      .insert("ext")
      .insert("text", { bold: "true", a: "true" })
      .insert("\n")
      .insert("text2", { b: "true" })
      .insert("\n")
      .insert("tex", { b: "true" });
    expect(ops).toEqual(t.ops);
  });
});
