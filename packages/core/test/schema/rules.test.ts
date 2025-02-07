import { Editor } from "../../src";

describe("schema rules", () => {
  const editor = new Editor({
    schema: {
      a: { block: true },
      b: { mark: true },
      c: { inline: true },
      d: { void: true },
      e: { void: true, inline: true },
      f: { mark: true, inline: true },
    },
  });

  it("inline", () => {
    expect(editor.schema.isInline({ insert: " ", attributes: { c: "" } })).toBe(false);
    expect(editor.schema.isInline({ insert: " ", attributes: { c: "1" } })).toBe(true);
    expect(editor.schema.isInline({ insert: " ", attributes: { e: "1" } })).toBe(false);
    expect(editor.schema.hasInlineKey({ insert: " ", attributes: { e: "1" } })).toBe(true);
  });

  it("void", () => {
    expect(editor.schema.isVoid({ insert: " ", attributes: { d: "1" } })).toBe(true);
    expect(editor.schema.isVoid({ insert: " ", attributes: { e: "1" } })).toBe(false);
    expect(editor.schema.hasVoidKey({ insert: " ", attributes: { e: "1" } })).toBe(true);
  });

  it("embed", () => {
    expect(editor.schema.isEmbed({ insert: " ", attributes: { d: "1" } })).toBe(false);
    expect(editor.schema.isEmbed({ insert: " ", attributes: { e: "1" } })).toBe(true);
    expect(editor.schema.hasVoidKey({ insert: " ", attributes: { f: "1" } })).toBe(false);
  });
});
