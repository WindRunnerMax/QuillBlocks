import { Delta, isEOLOp, MutateDelta } from "block-kit-delta";
import { isHTMLElement, TEXT_HTML } from "block-kit-utils";

import { applyLineMarker, isMatchHTMLTag } from "../../src/clipboard/utils/deserialize";
import { getFragmentText, serializeHTML } from "../../src/clipboard/utils/serialize";
import { Editor } from "../../src/editor";
import type { CorePlugin } from "../../src/plugin/modules/implement";

describe("clipboard quote", () => {
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
        if (isEOLOp(op) && op.attributes?.quote) {
          const element = document.createElement("blockquote");
          element.appendChild(html);
          context.html = element;
        }
        return context;
      },
    });
    editor.plugin.register(plugin);
    const delta = new MutateDelta().insert("Hello").insert("\n", { quote: "true" });
    const root = editor.clipboard.copyModule.serialize(delta);
    const plainText = getFragmentText(root);
    const htmlText = serializeHTML(root);
    expect(plainText).toBe("Hello");
    expect(htmlText).toBe(`<blockquote>Hello</blockquote>`);
  });

  it("deserialize", () => {
    const plugin = getMockedPlugin({
      deserialize(context) {
        const { delta, html } = context;
        if (!isHTMLElement(html)) return context;
        if (isMatchHTMLTag(html, "p")) {
          applyLineMarker(delta, {});
        }
        if (isMatchHTMLTag(html, "blockquote")) {
          applyLineMarker(delta, { quote: "true" });
        }
        return context;
      },
    });
    editor.plugin.register(plugin);
    const parser = new DOMParser();
    const transferHTMLText = `<div><blockquote><p>Hello</p><p>World</p></blockquote></div>`;
    const html = parser.parseFromString(transferHTMLText, TEXT_HTML);
    const rootDelta = editor.clipboard.pasteModule.deserialize(html.body);
    const delta = new Delta()
      .insert("Hello")
      .insert("\n", { quote: "true" })
      .insert("World")
      .insert("\n", { quote: "true" });
    expect(rootDelta).toEqual(delta);
  });
});
