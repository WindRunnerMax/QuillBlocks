/**
 * ToString 操作符
 * @see Symbol.toStringTag
 */
export const opt = Object.prototype.toString;

/** 开发模式 */
export const IS_DEV = process.env.NODE_ENV === "development";

/** 生产模式 */
export const IS_PROD = process.env.NODE_ENV === "production";

/** 测试模式 */
export const IS_TEST = process.env.NODE_ENV === "test";

/** Node 环境 */
export const IS_NODE_ENV = typeof process === "object" && opt.call(process) === "[object process]";

/** 浏览器环境 */
export const IS_BROWSER_ENV =
  typeof navigator !== "undefined" &&
  typeof window === "object" &&
  opt.call(window) === "[object Window]";

/** DOM 环境 */
export const IS_DOM_ENV =
  typeof window !== "undefined" &&
  typeof window.document !== "undefined" &&
  typeof window.document.createElement !== "undefined";

/** Iframe 环境 */
export const IS_IFRAME = IS_BROWSER_ENV && window.self !== window.top;

/** 移动端 环境 */
export const IS_MOBILE =
  IS_BROWSER_ENV && /Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent);

/** PC 环境 */
export const IS_WINDOWS = IS_BROWSER_ENV && /Windows/i.test(navigator.userAgent);

/** Mac 环境 */
export const IS_MAC = IS_BROWSER_ENV && /Mac/i.test(navigator.userAgent);

/** Linux 环境 */
export const IS_LINUX = IS_BROWSER_ENV && /Linux/i.test(navigator.userAgent);

/** Android 环境 */
export const IS_ANDROID = IS_BROWSER_ENV && /Android/i.test(navigator.userAgent);

/** Ipad 环境 */
export const IS_IPAD = IS_BROWSER_ENV && /iPad/i.test(navigator.userAgent);

/** IOS 环境 */
export const IS_IOS =
  IS_BROWSER_ENV && /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

/** Firefox 环境 */
export const IS_FIREFOX =
  IS_BROWSER_ENV && /^(?!.*Seamonkey)(?=.*Firefox).*/i.test(navigator.userAgent);

/** Webkit 环境 */
export const IS_WEBKIT = IS_BROWSER_ENV && /AppleWebKit(?!.*Chrome)/i.test(navigator.userAgent);

/** Chrome 环境 */
export const IS_CHROME = IS_BROWSER_ENV && /Chrome/i.test(navigator.userAgent);

/** 可信环境 */
export const IS_TRUST_ENV = IS_BROWSER_ENV && window.isSecureContext;
