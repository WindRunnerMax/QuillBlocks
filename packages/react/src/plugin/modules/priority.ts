import type { CorePlugin } from "block-kit-core";
import { PRIORITY_KEY } from "block-kit-core";
import { DEFAULT_PRIORITY, isNumber } from "block-kit-utils";
import type { O } from "block-kit-utils/dist/es/types";

/**
 * 获取插件的优先级
 * @param key
 * @param plugin
 */
export const getPluginPriority = (key: string, plugin: CorePlugin): number => {
  const priorityKey = `${PRIORITY_KEY}${key}`;
  const priorityPlugin = plugin as O.Any;
  const priority = priorityPlugin[priorityKey];
  return isNumber(priority) ? priority : DEFAULT_PRIORITY;
};

/**
 * 优先级定义装饰器
 * - 兼容性实现, 非强制类型检查
 * @param priority
 */
export function Priority<T>(priority: number) {
  return function (target: T, key: string, descriptor: PropertyDescriptor): PropertyDescriptor {
    const priorityKey = `${PRIORITY_KEY}${key}`;
    const plugin = target as O.Mixed;
    plugin[priorityKey] = priority;
    return descriptor;
  };
}
