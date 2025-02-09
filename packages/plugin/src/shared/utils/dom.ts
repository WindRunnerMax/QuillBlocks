import type { Editor } from "block-kit-core";

const EDITOR_TO_DOM = new WeakMap<Editor, HTMLElement | null>();

export const setMountDOM = (editor: Editor, dom: HTMLElement | null) => {
  EDITOR_TO_DOM.set(editor, dom);
};

export const getMountDOM = (editor: Editor) => {
  return EDITOR_TO_DOM.get(editor) || document.body;
};
