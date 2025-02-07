import { URI } from "./uri";

export class Extract {
  /**
   * 提取 Email 信息
   * @param {string} str
   */
  public static email(str: string) {
    const [name, domain] = str.split("@");
    return { name, domain: domain || "" };
  }

  /**
   * 从路径解析数据
   * @param {string} path
   * @param {string} template
   * @returns {Record<string, string>}
   * @example ("/user/123", "/user/:id") => { id: "123" }
   */
  public static path = URI.parsePathParams;
}
