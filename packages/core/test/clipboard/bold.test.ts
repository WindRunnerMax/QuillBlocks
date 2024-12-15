import { Delta } from "block-kit-delta";
import { isHTMLElement, TEXT_HTML } from "block-kit-utils";

import { applyMarker, isMatchHTMLTag } from "../../src/clipboard/utils/deserialize";
import { getFragmentText, serializeHTML } from "../../src/clipboard/utils/serialize";
import { Editor } from "../../src/editor";
import type { CorePlugin } from "../../src/plugin/modules/implement";

describe("clipboard bold", () => {
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
        if (context.op.attributes?.bold) {
          const strong = document.createElement("strong");
          strong.appendChild(context.html);
          context.html = strong;
        }
      },
    });
    editor.plugin.register(plugin);
    const delta = new Delta().insert("Hello", { bold: "true" }).insert("World");
    const root = editor.clipboard.copyModule.serialize(delta);
    const plainText = getFragmentText(root);
    const htmlText = serializeHTML(root);
    expect(plainText).toBe("HelloWorld");
    expect(htmlText).toBe(`<div data-node="true"><strong>Hello</strong>World</div>`);
  });

  it("deserialize", () => {
    const plugin = getMockedPlugin({
      deserialize(context) {
        const { delta, html } = context;
        if (!isHTMLElement(html)) return void 0;
        if (
          isMatchHTMLTag(html, "strong") ||
          isMatchHTMLTag(html, "b") ||
          html.style.fontWeight === "bold"
        ) {
          applyMarker(delta, { bold: "true" });
        }
      },
    });
    editor.plugin.register(plugin);
    const parser = new DOMParser();
    const transferHTMLText = `<div><strong>Hello</strong>World</div>`;
    const html = parser.parseFromString(transferHTMLText, TEXT_HTML);
    const rootDelta = editor.clipboard.pasteModule.deserialize(html.body);
    const delta = new Delta().insert("Hello", { bold: "true" }).insert("World");
    expect(rootDelta).toEqual(delta);
  });
});
