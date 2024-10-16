import type { Editor } from "../../src/editor";
import {
  BLOCK_KEY,
  EDITABLE,
  EDITOR_KEY,
  ENTER_KEY,
  LEAF_KEY,
  LEAF_STRING,
  NODE_KEY,
  ZERO_SPACE_KEY,
  ZERO_SYMBOL,
} from "../../src/model/types";

export const createContainerDOM = (children: HTMLElement[]) => {
  const dom = document.createElement("div");
  dom.id = "block-kit-editor";
  dom.className = "block-kit-editor";
  dom.setAttribute(EDITOR_KEY, "true");
  dom.setAttribute(EDITABLE, "true");
  children.forEach(child => dom.appendChild(child));
  return dom;
};

export const createBlockDOM = (blockId: string, children: HTMLElement[]) => {
  const dom = document.createElement("div");
  dom.className = "block-kit-block notranslate";
  dom.setAttribute(BLOCK_KEY, blockId);
  children.forEach(child => dom.appendChild(child));
  return dom;
};

export const createLineDOM = (children: HTMLElement[]) => {
  const dom = document.createElement("div");
  dom.className = "block-kit-line";
  dom.setAttribute(NODE_KEY, "true");
  children.forEach(child => dom.appendChild(child));
  return dom;
};

export const createLeafDOM = (child: HTMLElement) => {
  const dom = document.createElement("span");
  dom.className = "block-kit-leaf";
  dom.setAttribute(LEAF_KEY, "true");
  dom.appendChild(child);
  return dom;
};

export const createStringDOM = (text: string) => {
  const dom = document.createElement("span");
  dom.setAttribute(LEAF_STRING, "true");
  dom.textContent = text;
  return dom;
};

export const createZeroSpaceDOM = () => {
  const dom = document.createElement("span");
  dom.setAttribute(ZERO_SPACE_KEY, "true");
  dom.textContent = ZERO_SYMBOL;
  return dom;
};

export const createEnterDOM = () => {
  const dom = createZeroSpaceDOM();
  dom.setAttribute(ENTER_KEY, "true");
  return dom;
};

export const createEditorModel = (editor: Editor, root: HTMLElement) => {
  Array.from(root.children).forEach(block => {
    const blockState = editor.state.block;
    editor.model.setBlockModel(block as HTMLDivElement, blockState!);
    block.childNodes.forEach((line, lineIndex) => {
      const lineState = blockState!.getLine(lineIndex);
      editor.model.setLineModel(line as HTMLDivElement, lineState!);
      line.childNodes.forEach((leaf, leafIndex) => {
        const leafState = lineState!.getLeaf(leafIndex);
        editor.model.setLeafModel(leaf as HTMLElement, leafState!);
      });
    });
  });
};
