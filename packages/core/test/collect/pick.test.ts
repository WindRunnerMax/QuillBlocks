import { Delta } from "block-kit-delta";

import { Editor } from "../../src/editor";
import { Point } from "../../src/selection/modules/point";

describe("collect pick", () => {
  it("pick op", () => {
    const delta = new Delta().insert("text").insert("text", { bold: "true" }).insert("\n");
    const editor = new Editor({ delta });
    const op = editor.collect.getOpAtPoint(new Point(0, 1));
    expect(op).toEqual({ insert: "text" });
  });

  it("pick op attributes", () => {
    const delta = new Delta().insert("text").insert("text", { bold: "true" }).insert("\n");
    const editor = new Editor({ delta });
    const op = editor.collect.getOpAtPoint(new Point(0, 5));
    expect(op).toEqual({ insert: "text", attributes: { bold: "true" } });
  });

  it("pick op end", () => {
    const delta = new Delta().insert("text").insert("text", { bold: "true" }).insert("\n");
    const editor = new Editor({ delta });
    const op = editor.collect.getOpAtPoint(new Point(0, 4));
    expect(op).toEqual({ insert: "text" });
  });

  it("pick op overflow", () => {
    const delta = new Delta().insert("text").insert("text", { bold: "true" }).insert("\n");
    const editor = new Editor({ delta });
    const op = editor.collect.getOpAtPoint(new Point(0, 10));
    expect(op).toEqual(null);
  });
});
