// "🧑" + "\u200d" + "🎨" = "🧑‍🎨"
// https://github.com/slab/quill/issues/1230
// https://mathiasbynens.be/notes/javascript-unicode
// https://github.com/ianstormtaylor/slate/issues/2635
// https://eev.ee/blog/2015/09/12/dark-corners-of-unicode
// https://www.zhihu.com/question/563376088/answer/2736182091

import type { P } from "block-kit-utils/dist/es/types";

/**
 * 获取首个 Unicode 字符长度
 * @param str
 */
export const getFirstUnicodeLen = (str: string | P.Nil) => {
  if (!str || str.length < 2) {
    return str ? str.length : 0;
  }
  const first = str.charCodeAt(0);
  const second = str.charCodeAt(1);
  // 首个 Unicode 字符是 Emoji
  // 这里采用简单的方式直接通过代理对判断 [\uD800-\uDBFF][\uDC00-\uDFFF]
  // https://github.com/slab/quill/commit/c55149
  // 完整模式匹配则需要类似 lodash 判断 has 后通过 array 取值
  // https://github.com/lodash/lodash/blob/es/_hasUnicode.js
  // https://github.com/lodash/lodash/blob/es/_unicodeToArray.js
  if (0xd800 < first && first < 0xdbff && 0xdc00 < second && second < 0xdfff) {
    // 此时基本 Unicode 字符长度为 2
    let len = 2;
    // 通过连接符号来组合单个 Unicode 字符长度
    // [-][-] \u200d [-][-] \u200d [-][-]
    for (let i = 2, n = str.length; i < n; i = i + 3) {
      if (str[i].charCodeAt(0) !== 0x200d) break;
      len = len + 3;
    }
    return len;
  }
  return 1;
};

/**
 * 获取末尾 Unicode 字符长度
 * @param str
 */
export const getLastUnicodeLen = (str: string | P.Nil) => {
  if (!str || str.length < 2) {
    return str ? str.length : 0;
  }
  const first = str.charCodeAt(str.length - 2);
  const second = str.charCodeAt(str.length - 1);
  if (0xd800 < first && first < 0xdbff && 0xdc00 < second && second < 0xdfff) {
    // 此时基本 Unicode 字符长度为 2
    let len = 2;
    // 通过连接符号来组合单个 Unicode 字符长度
    // [-][-] \u200d [-][-] \u200d [-][-]
    for (let i = str.length - 3; i > 0; i = i - 3) {
      if (str[i].charCodeAt(0) !== 0x200d) break;
      len = len + 3;
    }
    return len;
  }
  return 1;
};
