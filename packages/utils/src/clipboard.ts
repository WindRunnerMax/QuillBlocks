import { isString } from "./is";

/** 纯文本 */
export const TEXT_PLAIN = "text/plain";
/** HTML 文本 */
export const TEXT_HTML = "text/html";

export type ClipboardTransfer = {
  /** 纯文本 */
  "text/plain": string;
  /** HTML 文本 */
  "text/html"?: string;
} & Record<string, string>;

export class Clipboard {
  /** 纯文本 */
  public static TEXT_PLAIN: typeof TEXT_PLAIN = TEXT_PLAIN;
  /** HTML 文本 */
  public static TEXT_HTML: typeof TEXT_HTML = TEXT_HTML;

  /**
   * 执行复制命令 [兼容性方案]
   * @param {ClipboardTransfer} data
   */
  public static execCopyCommand(data: ClipboardTransfer) {
    const textarea = document.createElement("textarea");
    textarea.addEventListener(
      "copy",
      event => {
        for (const [key, value] of Object.entries(data)) {
          event.clipboardData && event.clipboardData.setData(key, value);
        }
        event.stopPropagation();
        event.preventDefault();
      },
      true
    );
    textarea.style.position = "fixed";
    textarea.style.left = "-999px";
    textarea.style.top = "-999px";
    textarea.value = data[TEXT_PLAIN];
    // COMPAT: `safari`需要挂载在`DOM`上才能触发
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  }

  /**
   * 写入剪贴板
   * @param {ClipboardTransfer | string} data
   */
  public static write(data: ClipboardTransfer | string): boolean {
    const params: ClipboardTransfer = isString(data) ? { [TEXT_PLAIN]: data } : data;
    const plainText = params[TEXT_PLAIN];
    if (!plainText) return false;
    if (navigator.clipboard && window.ClipboardItem) {
      const dataItems: Record<string, Blob> = {};
      for (const [key, value] of Object.entries(params)) {
        const blob = new Blob([value], { type: key });
        dataItems[key] = blob;
      }
      navigator.clipboard.write([new ClipboardItem(dataItems)]).catch(() => {
        Clipboard.execCopyCommand(params);
      });
      return true;
    }
    Clipboard.execCopyCommand(params);
    return true;
  }

  /**
   * 将纯文本写入剪贴板
   * @param {string} text
   */
  public static writeText(text: string): boolean {
    if (!text) return false;
    // Available only in secure contexts.
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {
        Clipboard.execCopyCommand({ [TEXT_PLAIN]: text });
      });
      return true;
    }
    Clipboard.execCopyCommand({ [TEXT_PLAIN]: text });
    return true;
  }
}
