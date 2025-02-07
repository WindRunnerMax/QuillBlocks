/**
 * ToString 操作符
 * @see Symbol.toStringTag
 */
export const opt = Object.prototype.toString;

/**
 * 检查 undefined
 * - null => false
 * - undefined => true
 * @param {unknown} value
 * @returns {boolean}
 */
export const isUndefined = (value: unknown): value is undefined => {
  return typeof value === "undefined";
};

/**
 * 检查 null
 * - null => true
 * - undefined => false
 * @param {unknown} value
 * @returns {boolean}
 */
export const isNull = (value: unknown): value is undefined => {
  return value === null;
};

/**
 * 检查 undefined | null
 * - null => true
 * - undefined => true
 * @param {unknown} value
 * @returns {boolean}
 */
export const isEmptyValue = (value: unknown): value is undefined | null => {
  return value === null || value === void 0;
};

/**
 * 检查 nil = undefined | null
 * - null => true
 * - undefined => true
 * @param {unknown} value
 * @returns {boolean}
 */
export const isNil = isEmptyValue;

/**
 * 检查 object
 * - {} => true
 * - [] => false
 * - Object.create(null) => true
 * @param {unknown} value
 * @returns {boolean}
 */
export const isObject = <T = Record<string, unknown>>(value: unknown): value is T => {
  return opt.call(value) === "[object Object]";
};

/**
 * 检查 Array
 * - [] => true
 * - {} => false
 * @param {unknown} value
 * @returns {boolean}
 */
export const isArray = (value: unknown): value is unknown[] => {
  return Array.isArray(value);
};

/**
 * 检查 number
 * - 1 => true
 * - NaN => true
 * - "1" => false
 * @param {unknown} value
 * @returns {boolean}
 */
export const isNumber = (value: unknown): value is number => {
  return opt.call(value) === "[object Number]";
};

/**
 * 检查 plain number
 * - 1 => true
 * - "1" => true
 * - "-1.1" => true
 * @param {unknown} value
 * @returns {boolean}
 */
export const isPlainNumber = (value: unknown): value is number => {
  return /^(-|\+)?\d+(\.\d+)?$/.test(String(value));
};

/**
 * 检查 string
 * - "" => true
 * - [] => false
 * - {} => false
 * @param {unknown} value
 * @returns {boolean}
 */
export const isString = (value: unknown): value is string => {
  return opt.call(value) === "[object String]";
};

/**
 * 检查 function
 * - () => {} => true
 * - class {} => true
 * - function() {} => true
 * - new Function() => true
 * @param {unknown} value
 * @returns {boolean}
 */
export const isFunction = (value: unknown): value is (...args: never[]) => unknown => {
  return typeof value === "function";
};

/**
 * 检查 plain object
 * - {} => true
 * - [] => false
 * - Object.create(null) => true
 * @param {unknown} value
 * @returns {boolean}
 */
export const isPlainObject = <T = Record<string, unknown>>(value: unknown): value is T => {
  if (!isObject(value)) {
    return false;
  }
  if (Object.getPrototypeOf(value) === null) {
    return true;
  }
  return value.constructor === Object;
};

/**
 * 检查 boolean
 * - 1 => false
 * - true => true
 * - false => true
 * @param {unknown} value
 * @returns {boolean}
 */
export const isBoolean = (value: unknown): value is boolean => {
  return value === true || value === false || opt.call(value) === "[object Boolean]";
};

/**
 * 检查 object like
 * - {} => true
 * - [] => true
 * - Object.create(null) => true
 * @param {unknown} value
 * @returns {boolean}
 */
export const isObjectLike = <T = Record<string, unknown>>(value: unknown): value is T => {
  return !!value && typeof value === "object";
};

/**
 * 检查 truly
 * - 1 => true
 * - "1" => true
 * - true => true
 * - "true" => true
 * @param {unknown} value
 * @returns {boolean}
 */
export const isTruly = (value: unknown): boolean => {
  return !!value || value === "true";
};

/**
 * 检查 falsy
 * - 0 => true
 * - "" => true
 * - false => true
 * - "false" => true
 * @param {unknown} value
 * @returns {boolean}
 */
export const isFalsy = (value: unknown): boolean => {
  return !value || value === "false";
};
