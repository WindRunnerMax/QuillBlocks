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

  it("pick slice op backward", () => {
    const delta = new Delta().insert("text").insert("text", { bold: "true" }).insert("\n");
    const editor = new Editor({ delta });
    const op0 = editor.collect.getBackwardOpAtPoint(new Point(0, 0));
    expect(op0).toEqual({ insert: "" });
    const op1 = editor.collect.getBackwardOpAtPoint(new Point(0, 3));
    expect(op1).toEqual({ insert: "tex" });
    const op2 = editor.collect.getBackwardOpAtPoint(new Point(0, 4));
    expect(op2).toEqual({ insert: "text" });
    const op3 = editor.collect.getBackwardOpAtPoint(new Point(0, 100));
    expect(op3).toEqual(null);
  });

  it("pick slice op forward", () => {
    const delta = new Delta().insert("text").insert("text", { bold: "true" }).insert("\n");
    const editor = new Editor({ delta });
    const op0 = editor.collect.getForwardOpAtPoint(new Point(0, 0));
    expect(op0).toEqual({ insert: "text" });
    const op1 = editor.collect.getForwardOpAtPoint(new Point(0, 3));
    expect(op1).toEqual({ insert: "t" });
    const op2 = editor.collect.getForwardOpAtPoint(new Point(0, 4));
    expect(op2).toEqual({ insert: "text", attributes: { bold: "true" } });
    const op3 = editor.collect.getForwardOpAtPoint(new Point(0, 100));
    expect(op3).toEqual(null);
  });
});
