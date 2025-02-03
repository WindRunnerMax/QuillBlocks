import { Delta } from "block-kit-delta";
import { ROOT_BLOCK } from "block-kit-utils";

import { Editor, LOG_LEVEL, Range } from "../../src";
import {
  createBlockDOM,
  createContainerDOM,
  createEnterDOM,
  createLeafDOM,
  createLineDOM,
  createTextDOM,
} from "../config/dom";

describe("selection event", () => {
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
  const editor = new Editor({ delta, logLevel: LOG_LEVEL.INFO });
  const lines = editor.state.block.getLines();

  const leafDOMs = lines.map(lineState => {
    const leaves = lineState.getLeaves();
    const textLeaves = leaves.slice(0, -1);
    const nodes = textLeaves.map(n => {
      const leafDOM = createLeafDOM(createTextDOM(n.getText()));
      editor.model.setLeafModel(leafDOM, n);
      return leafDOM;
    });
    // 空行则仅存在一个 Leaf, 此时需要渲染空的占位节点
    if (!nodes.length && leaves[0]) {
      const leaf = leaves[0];
      const dom = createEnterDOM();
      editor.model.setLeafModel(dom, leaf);
      nodes.push(dom);
      return nodes;
    }
    // inline-void 在行未时需要预设零宽字符来放置光标
    const eolLeaf = leaves[leaves.length - 1];
    const lastLeaf = textLeaves[textLeaves.length - 1];
    if (lastLeaf && eolLeaf && lastLeaf.void && lastLeaf.inline) {
      const dom = createEnterDOM();
      editor.model.setLeafModel(dom, eolLeaf);
      nodes.push(dom);
    }
    return nodes;
  });

  const lineDOMs = leafDOMs.map((dom, index) => {
    const lineDOM = createLineDOM(dom);
    editor.model.setLineModel(lineDOM, lines[index]);
    return lineDOM;
  });

  const block = createBlockDOM(ROOT_BLOCK, lineDOMs);
  const container = createContainerDOM([block]);
  editor.onMount(container as HTMLDivElement);
  document.body.appendChild(container);

  it("selection change event", () => {
    const sel = document.getSelection();
    sel?.setBaseAndExtent(leafDOMs[0][0], 0, leafDOMs[0][1], 0);
    document.dispatchEvent(new Event("selectionchange"));
    expect(editor.selection.get()).toEqual(Range.fromTuple([0, 0], [0, 4]));
  });

  it("actively set selection", () => {
    editor.selection.set(Range.fromTuple([0, 0], [0, 4]), true);
    const sel = document.getSelection();
    // <span data-leaf="true"><span data-string="true">text</span></span>
    expect(sel?.anchorNode).toBe(leafDOMs[0][0].firstChild?.firstChild);
    expect(sel?.focusNode).toEqual(leafDOMs[0][0].firstChild?.firstChild);
    expect(sel?.anchorOffset).toEqual(0);
    expect(sel?.focusOffset).toEqual(4);
  });

  it("triple click to select line", () => {
    const sel = document.getSelection();
    sel?.setBaseAndExtent(leafDOMs[0][0], 0, lineDOMs[1], 0);
    document.dispatchEvent(new Event("selectionchange"));
    expect(editor.selection.get()).toEqual(Range.fromTuple([0, 0], [1, 0]));
  });
});
