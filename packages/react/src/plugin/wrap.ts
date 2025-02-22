import type { Editor } from "block-kit-core";
import { DEFAULT_PRIORITY, isNil } from "block-kit-utils";

import type { EditorPlugin } from "./index";

export const EDITOR_TO_WRAP_LINE_KEYS = new WeakMap<Editor, string[]>();
export const EDITOR_TO_WRAP_LEAF_KEYS = new WeakMap<Editor, string[]>();
export const EDITOR_TO_WRAP_LINE_PLUGINS = new WeakMap<Editor, EditorPlugin[]>();
export const EDITOR_TO_WRAP_LEAF_PLUGINS = new WeakMap<Editor, EditorPlugin[]>();

/**
 * 初始化 Wrap 模式的插件
 * - Wrap 模式的插件化在 React 层面渲染时实现
 * - 其是渲染时调度且不存在 WrapState 的概念
 */
export const initWrapPlugins = (editor: Editor) => {
  const plugins = editor.plugin.current as EditorPlugin[];
  const wrapLineKeys: string[] = [];
  const wrapLeafKeys: string[] = [];
  const wrapLinePlugins: EditorPlugin[] = [];
  const wrapLeafPlugins: EditorPlugin[] = [];
  for (const plugin of plugins) {
    if (plugin.wrapLineKeys) {
      wrapLineKeys.push(...plugin.wrapLineKeys);
    }
    if (plugin.wrapLeafKeys) {
      wrapLeafKeys.push(...plugin.wrapLeafKeys);
    }
    if (plugin.wrapLine) {
      wrapLinePlugins.push(plugin);
    }
    if (plugin.wrapLeaf) {
      wrapLeafPlugins.push(plugin);
    }
  }
  wrapLinePlugins.sort((a, b) => {
    const priorityA = isNil(a.__PRIORITY__wrapLine) ? DEFAULT_PRIORITY : a.__PRIORITY__wrapLine;
    const priorityB = isNil(b.__PRIORITY__wrapLine) ? DEFAULT_PRIORITY : b.__PRIORITY__wrapLine;
    return priorityA - priorityB;
  });
  wrapLeafPlugins.sort((a, b) => {
    const priorityA = isNil(a.__PRIORITY__wrapLeaf) ? DEFAULT_PRIORITY : a.__PRIORITY__wrapLeaf;
    const priorityB = isNil(b.__PRIORITY__wrapLeaf) ? DEFAULT_PRIORITY : b.__PRIORITY__wrapLeaf;
    return priorityA - priorityB;
  });
  wrapLineKeys.length && EDITOR_TO_WRAP_LINE_KEYS.set(editor, wrapLineKeys);
  wrapLeafKeys.length && EDITOR_TO_WRAP_LEAF_KEYS.set(editor, wrapLeafKeys);
  wrapLinePlugins.length && EDITOR_TO_WRAP_LINE_PLUGINS.set(editor, wrapLinePlugins);
  wrapLeafPlugins.length && EDITOR_TO_WRAP_LEAF_PLUGINS.set(editor, wrapLeafPlugins);
};
