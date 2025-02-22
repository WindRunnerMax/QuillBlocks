import type { CorePlugin, Editor } from "block-kit-core";
import type { O, P } from "block-kit-utils/dist/es/types";

import type { EditorPlugin } from "../index";
import { WRAP_TYPE } from "../types";
import { getPluginPriority } from "./priority";

export const EDITOR_TO_WRAP_LINE_KEYS = new WeakMap<Editor, string[]>();
export const EDITOR_TO_WRAP_LEAF_KEYS = new WeakMap<Editor, string[]>();
export const EDITOR_TO_WRAP_LINE_PLUGINS = new WeakMap<Editor, EditorPlugin[]>();
export const EDITOR_TO_WRAP_LEAF_PLUGINS = new WeakMap<Editor, EditorPlugin[]>();

/**
 * 为 WrapNode 定义 Key
 * @param ...keys
 */
export function InjectWrapKeys<T>(...keys: string[]) {
  return function (
    target: T,
    key: O.Values<typeof WRAP_TYPE>,
    descriptor: PropertyDescriptor
  ): PropertyDescriptor {
    const wrapPluginKey = `${key}Keys`;
    const plugin = target as O.Mixed;
    plugin[wrapPluginKey] = keys;
    return descriptor;
  };
}

/**
 * 获取插件的 WrapKeys
 * @param key
 * @param plugin
 */
export const getWrapKeys = (key: string, plugin: CorePlugin): string[] | P.Undef => {
  const wrapPluginKey = `${key}Keys`;
  const wrapPlugin = plugin as O.Any;
  const keys = wrapPlugin[wrapPluginKey];
  return keys;
};

/**
 * 初始化 Wrap 模式的插件
 * - Wrap 模式的插件化在 React 层面渲染时实现
 * - 其是渲染时调度且不存在 WrapState 的概念
 * @param editor
 */
export const initWrapPlugins = (editor: Editor) => {
  const plugins = editor.plugin.current as EditorPlugin[];
  const wrapLineKeys: string[] = [];
  const wrapLeafKeys: string[] = [];
  const wrapLinePlugins: EditorPlugin[] = [];
  const wrapLeafPlugins: EditorPlugin[] = [];
  for (const plugin of plugins) {
    const lineKeys = getWrapKeys(WRAP_TYPE.LINE, plugin);
    if (lineKeys) {
      wrapLineKeys.push(...lineKeys);
    }
    const leafKeys = getWrapKeys(WRAP_TYPE.LEAF, plugin);
    if (leafKeys) {
      wrapLeafKeys.push(...leafKeys);
    }
    if (plugin.wrapLine) {
      wrapLinePlugins.push(plugin);
    }
    if (plugin.wrapLeaf) {
      wrapLeafPlugins.push(plugin);
    }
  }
  wrapLinePlugins.sort((a, b) => {
    const priorityA = getPluginPriority(WRAP_TYPE.LINE, a);
    const priorityB = getPluginPriority(WRAP_TYPE.LINE, b);
    return priorityA - priorityB;
  });
  wrapLeafPlugins.sort((a, b) => {
    const priorityA = getPluginPriority(WRAP_TYPE.LEAF, a);
    const priorityB = getPluginPriority(WRAP_TYPE.LEAF, b);
    return priorityA - priorityB;
  });
  wrapLineKeys.length && EDITOR_TO_WRAP_LINE_KEYS.set(editor, wrapLineKeys);
  wrapLeafKeys.length && EDITOR_TO_WRAP_LEAF_KEYS.set(editor, wrapLeafKeys);
  wrapLinePlugins.length && EDITOR_TO_WRAP_LINE_PLUGINS.set(editor, wrapLinePlugins);
  wrapLeafPlugins.length && EDITOR_TO_WRAP_LEAF_PLUGINS.set(editor, wrapLeafPlugins);
};
