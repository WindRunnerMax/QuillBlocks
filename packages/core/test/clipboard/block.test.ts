import { Delta } from "block-kit-delta";
import { isHTMLElement, ROOT_BLOCK, TEXT_HTML } from "block-kit-utils";

import { isMatchHTMLTag } from "../../src/clipboard/utils/deserialize";
import { getFragmentText, serializeHTML } from "../../src/clipboard/utils/serialize";
import { Editor } from "../../src/editor";
import type { CorePlugin } from "../../src/plugin/modules/implement";

describe("clipboard block", () => {
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
    const block = new Delta().insert("inside");
    const inside = editor.clipboard.copyModule.serialize(block);
    const plugin = getMockedPlugin({
      serialize(context) {
        const { op } = context;
        if (op.attributes?._ref) {
          const element = document.createElement("div");
          element.setAttribute("data-block", op.attributes._ref);
          element.appendChild(inside);
          context.html = element;
        }
      },
    });
    editor.plugin.register(plugin);
    const delta = new Delta().insert(" ", { _ref: "id" });
    const root = editor.clipboard.copyModule.serialize(delta);
    const plainText = getFragmentText(root);
    const htmlText = serializeHTML(root);
    expect(plainText).toBe("inside\n");
    expect(htmlText).toBe(
      `<div data-node="true"><div data-block="id"><div data-node="true">inside</div></div></div>`
    );
  });

  it("deserialize", () => {
    const deltas: Record<string, Delta> = {};
    const plugin = getMockedPlugin({
      deserialize(context) {
        const { html } = context;
        if (!isHTMLElement(html)) return void 0;
        if (isMatchHTMLTag(html, "div") && html.hasAttribute("data-block")) {
          const id = html.getAttribute("data-block")!;
          deltas[id] = context.delta;
          context.delta = new Delta().insert(" ", { _ref: id });
        }
      },
    });
    editor.plugin.register(plugin);
    const parser = new DOMParser();
    const transferHTMLText = `<div data-node="true"><div data-block="id"><div data-node="true">inside</div></div></div>`;
    const html = parser.parseFromString(transferHTMLText, TEXT_HTML);
    const rootDelta = editor.clipboard.pasteModule.deserialize(html.body);
    deltas[ROOT_BLOCK] = rootDelta;
    expect(deltas).toEqual({
      [ROOT_BLOCK]: new Delta().insert(" ", { _ref: "id" }),
      id: new Delta().insert("inside"),
    });
  });
});
