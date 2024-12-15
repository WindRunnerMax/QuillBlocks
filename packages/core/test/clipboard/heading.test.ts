import { Delta, isEOLOp, MutateDelta } from "block-kit-delta";
import { isHTMLElement, TEXT_HTML } from "block-kit-utils";

import { applyLineMarker } from "../../src/clipboard/utils/deserialize";
import { getFragmentText, serializeHTML } from "../../src/clipboard/utils/serialize";
import { Editor } from "../../src/editor";
import type { CorePlugin } from "../../src/plugin/modules/implement";

describe("clipboard heading", () => {
  const editor = new Editor();
  const getMockedPlugin = (props: Pick<CorePlugin, "deserialize" | "serialize">): CorePlugin => {
    return {
      key: "",
      destroy: () => {},
      match: () => true,
      ...props,
    };
  };

  it("serialize", () => {
    const plugin = getMockedPlugin({
      serialize(context) {
        const { op, html } = context;
        if (isEOLOp(op) && op.attributes?.heading) {
          const element = document.createElement(op.attributes.heading);
          element.appendChild(html);
          context.html = element;
        }
      },
    });
    editor.plugin.register(plugin);
    const delta = new MutateDelta().insert("Hello").insert("\n", { heading: "h1" });
    const root = editor.clipboard.copyModule.serialize(delta);
    const plainText = getFragmentText(root);
    const htmlText = serializeHTML(root);
    expect(plainText).toBe("Hello");
    expect(htmlText).toBe(`<h1>Hello</h1>`);
  });

  it("deserialize", () => {
    const plugin = getMockedPlugin({
      deserialize(context) {
        const { delta, html } = context;
        if (!isHTMLElement(html)) return void 0;
        if (["h1", "h2"].indexOf(html.tagName.toLowerCase()) > -1) {
          applyLineMarker(delta, { heading: html.tagName.toLowerCase() });
        }
      },
    });
    editor.plugin.register(plugin);
    const parser = new DOMParser();
    const transferHTMLText = `<div><h1>Hello</h1><h2>World</h2></div>`;
    const html = parser.parseFromString(transferHTMLText, TEXT_HTML);
    const rootDelta = editor.clipboard.pasteModule.deserialize(html.body);
    const delta = new Delta()
      .insert("Hello")
      .insert("\n", { heading: "h1" })
      .insert("World")
      .insert("\n", { heading: "h2" });
    expect(rootDelta).toEqual(delta);
  });
});
