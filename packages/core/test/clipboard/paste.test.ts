import { MutateDelta } from "block-kit-delta";
import { isHTMLElement, TEXT_HTML } from "block-kit-utils";

import { applyLineMarker, isMatchBlockTag } from "../../src/clipboard/utils/deserialize";
import { Editor } from "../../src/editor";

describe("clipboard paste", () => {
  const editor = new Editor();

  it("deserialize", () => {
    editor.plugin.register({
      key: "",
      destroy: () => {},
      match: () => true,
      deserialize(context) {
        if (
          isHTMLElement(context.html) &&
          isMatchBlockTag(context.html) &&
          context.html.hasAttribute("data-heading")
        ) {
          applyLineMarker(context.delta, { heading: "true" });
        }
      },
    });
    const parser = new DOMParser();
    const transferHTMLText = `<div><div data-heading>Hello</div><div data-heading>World</div></div>`;
    const html = parser.parseFromString(transferHTMLText, TEXT_HTML);
    const rootDelta = editor.clipboard.pasteModule.deserialize(html.body);
    const delta = new MutateDelta()
      .insert("Hello")
      .insert("\n", { heading: "true" })
      .insert("World")
      .insert("\n", { heading: "true" });
    expect(rootDelta).toEqual(delta);
  });
});
