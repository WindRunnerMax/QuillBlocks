import type { Editor } from "block-kit-core";
import type { EventContext } from "block-kit-utils";

const EDITOR_TO_DOM = new WeakMap<Editor, HTMLElement | null>();

/**
 * 设置挂载 DOM
 * @param editor
 * @param dom
 */
export const setMountDOM = (editor: Editor, dom: HTMLElement | null) => {
  EDITOR_TO_DOM.set(editor, dom);
};

/**
 * 获取挂载 DOM
 * @param editor
 * @param dom
 */
export const getMountDOM = (editor: Editor) => {
  return EDITOR_TO_DOM.get(editor) || document.body;
};

/**
 * 阻止所有编辑器分发的事件
 * @param event
 * @param context
 */
export const preventContextEvent = (event: Event, context: EventContext) => {
  context.stop();
  context.prevent();
  event.preventDefault();
  event.stopPropagation();
};
