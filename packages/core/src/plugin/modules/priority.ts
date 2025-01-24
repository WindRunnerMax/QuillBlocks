import { DEFAULT_PRIORITY, isNil } from "block-kit-utils";
import type { O } from "block-kit-utils/dist/es/types";

import type { PluginFuncKeys } from "../types";
import type { CorePlugin } from "./implement";

export const PRIORITY_KEY = "__PRIORITY__";
export type PluginWithPriority = CorePlugin & { [T in PriorityKeys]?: number };
export type PriorityKeys = O.Values<{ [T in PluginFuncKeys]: `${typeof PRIORITY_KEY}${T}` }>;

/**
 * 获取插件的优先级
 * @param key
 * @param plugin
 */
export const getPluginPriority = <T extends PluginFuncKeys>(key: T, plugin: CorePlugin): number => {
  const priorityKey = `${PRIORITY_KEY}${key}` as PriorityKeys;
  const priorityPlugin = plugin as PluginWithPriority;
  const priority = priorityPlugin[priorityKey];
  return isNil(priority) ? DEFAULT_PRIORITY : priority;
};

/**
 * 优先级定义装饰器
 * @param priority
 */
export function Priority<T>(priority: number) {
  return function (
    target: T,
    key: PluginFuncKeys,
    descriptor: PropertyDescriptor
  ): PropertyDescriptor {
    const priorityKey = `${PRIORITY_KEY}${key}` as PriorityKeys;
    const plugin = target as PluginWithPriority;
    plugin[priorityKey] = priority;
    return descriptor;
  };
}
