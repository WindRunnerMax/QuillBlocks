import { Delta } from "block-kit-delta";
import { isHTMLElement, TEXT_HTML } from "block-kit-utils";

import { isMatchHTMLTag } from "../../src/clipboard/utils/deserialize";
import { getFragmentText, serializeHTML } from "../../src/clipboard/utils/serialize";
import { Editor } from "../../src/editor";
import type { CorePlugin } from "../../src/plugin/modules/implement";

describe("clipboard image", () => {
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
        const { op } = context;
        if (op.attributes?.image && op.attributes.src) {
          const element = document.createElement("img");
          element.src = op.attributes.src;
          context.html = element;
        }
      },
    });
    editor.plugin.register(plugin);
    const delta = new Delta().insert(" ", {
      image: "true",
      src: "https://example.com/image.png",
    });
    const root = editor.clipboard.copyModule.serialize(delta);
    const plainText = getFragmentText(root);
    const htmlText = serializeHTML(root);
    expect(plainText).toBe("");
    expect(htmlText).toBe(`<div data-node="true"><img src="https://example.com/image.png"></div>`);
  });

  it("deserialize", () => {
    const plugin = getMockedPlugin({
      deserialize(context) {
        const { html } = context;
        if (!isHTMLElement(html)) return void 0;
        if (isMatchHTMLTag(html, "img")) {
          const src = html.getAttribute("src") || "";
          const delta = new Delta();
          delta.insert(" ", { image: "true", src: src });
          context.delta = delta;
        }
      },
    });
    editor.plugin.register(plugin);
    const parser = new DOMParser();
    const transferHTMLText = `<img src="https://example.com/image.png"></img>`;
    const html = parser.parseFromString(transferHTMLText, TEXT_HTML);
    const rootDelta = editor.clipboard.pasteModule.deserialize(html.body);
    const delta = new Delta().insert(" ", { image: "true", src: "https://example.com/image.png" });
    expect(rootDelta).toEqual(delta);
  });
});
