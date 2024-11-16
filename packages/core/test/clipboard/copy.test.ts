import { Delta } from "block-kit-delta";

import { getFragmentText, serializeHTML } from "../../src/clipboard/utils/serialize";
import { Editor } from "../../src/editor";

describe("clipboard copy", () => {
  const editor = new Editor();

  it("serialize", () => {
    const delta = new Delta().insert("Hello").insert("\n").insert("World");
    const root = editor.clipboard.copyModule.serialize(delta);
    const plainText = getFragmentText(root);
    const htmlText = serializeHTML(root);
    expect(plainText).toBe("Hello\nWorld");
    expect(htmlText).toBe(`<div data-node="true">Hello</div><div data-node="true">World</div>`);
  });
});
