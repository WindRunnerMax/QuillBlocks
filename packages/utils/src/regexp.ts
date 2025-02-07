export class RegExec {
  /**
   * 获取正则匹配的第 index 个结果
   * @param {RegExp} regex 正则表达式
   * @param {string} str 字符串
   * @param {number} index 匹配的索引
   * @returns {string}
   */
  public static exec(regex: RegExp, str: string, index: number = 1): string {
    const res = regex.exec(str);
    if (!res) return "";
    return res[index] !== void 0 ? res[index] : res[0];
  }

  /**
   * 获取正则匹配的所有结果
   * @param {RegExp} regex 正则表达式
   * @param {string} str 字符串
   * @param {number} index 匹配的索引
   * @returns {string[]}
   */
  public static match(regex: RegExp, str: string, index: number = 1): string[] {
    const result: string[] = [];
    const flags = `${regex.flags}${regex.global ? "" : "g"}`;
    const next = new RegExp(regex, flags);
    let temp: RegExpExecArray | null = null;
    while ((temp = next.exec(str))) {
      const item = temp && temp[index] !== void 0 ? temp[index] : temp[0];
      result.push(item || "");
    }
    return result;
  }

  /**
   * 读数组索引值
   * @param {string[] | null} from
   * @param {number} index
   * @returns {string}
   */
  public static get(from: string[] | null, index: number): string {
    return from ? from[index] || "" : "";
  }
}
