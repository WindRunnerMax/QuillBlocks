import { Delta } from "block-kit-delta";
import { isDOMText, ROOT_BLOCK } from "block-kit-utils";

import { Editor } from "../../src/editor";
import { ZERO_SYMBOL } from "../../src/model/types";
import { Point } from "../../src/selection/modules/point";
import { Range } from "../../src/selection/modules/range";
import { toDOMRange } from "../../src/selection/utils/native";
import {
  createBlockDOM,
  createContainerDOM,
  createEditorModel,
  createEnterDOM,
  createLeafDOM,
  createLineDOM,
  createStringDOM,
} from "../config/dom";

describe("getSelectedText", () => {
  const delta = new Delta({
    ops: [
      { insert: "text" },
      { insert: "bold", attributes: { bold: "true" } },
      { insert: "\n" },
      { insert: "text2" },
      { insert: "bold2", attributes: { bold: "true" } },
      { insert: "\n" },
    ],
  });
  const editor = new Editor({ delta, logLevel: 0 });

  beforeAll(() => {
    const line1 = createLineDOM([
      createLeafDOM(createStringDOM("text")),
      createLeafDOM(createStringDOM("bold")),
      createLeafDOM(createEnterDOM()),
    ]);
    const line2 = createLineDOM([
      createLeafDOM(createStringDOM("text2")),
      createLeafDOM(createStringDOM("bold2")),
      createLeafDOM(createEnterDOM()),
    ]);
    const block = createBlockDOM(ROOT_BLOCK, [line1, line2]);
    const container = createContainerDOM([block]);
    editor.onMount(container as HTMLDivElement);
    createEditorModel(editor, container as HTMLDivElement);
  });

  it("range to dom", () => {
    const range = new Range(new Point(0, 5), new Point(1, 2));
    const sel = toDOMRange(editor, range) as StaticRange;
    expect(sel).not.toBe(null);
    const { startContainer, startOffset, endContainer, endOffset } = sel;
    expect(sel.toString()).toBe(`old${ZERO_SYMBOL}te`);
    expect(isDOMText(startContainer) && isDOMText(endContainer)).toBe(true);
    expect(startContainer.textContent).toBe("bold");
    expect(startOffset).toBe(1);
    expect(endContainer.textContent).toBe("text2");
    expect(endOffset).toBe(2);
  });
});
