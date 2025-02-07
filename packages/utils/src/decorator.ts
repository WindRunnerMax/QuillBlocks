import { isFunction } from "./is";

// ExperimentalDecorators
// https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html

/**
 * Bind 事件绑定装饰器
 * @param {T} _
 * @param {string} key
 * @param {PropertyDescriptor} descriptor
 */
export function Bind<T>(_: T, key: string, descriptor: PropertyDescriptor): PropertyDescriptor {
  const originalMethod = descriptor.value;
  if (!isFunction(originalMethod)) {
    throw new TypeError(`${originalMethod} is not a function`);
  }

  return {
    configurable: true,
    get() {
      const boundFunction = originalMethod.bind(this);
      Object.defineProperty(this, key, {
        value: boundFunction,
        configurable: true,
        enumerable: false,
      });
      return boundFunction;
    },
  };
}
