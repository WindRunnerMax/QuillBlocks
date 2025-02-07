import { IS_DOM_ENV } from "./env";

export type Rect = { width: number; height: number };
export type ResizeCallback = (prev: Rect, next: Rect) => void;

export class Resize {
  /** 前次调度宽度 */
  private prevWidth: number;
  /** 前次调度高度 */
  private prevHeight: number;
  /** 挂载的销毁函数 */
  private destroy: () => void;

  /**
   * 构造函数
   * @param dom
   * @param callback
   */
  constructor(private dom: HTMLElement, private callback: ResizeCallback) {
    const rect = dom.getBoundingClientRect();
    this.prevWidth = rect.width;
    this.prevHeight = rect.height;
    this.destroy = () => null;
  }

  /**
   * 观察元素
   */
  public connect() {
    if (!IS_DOM_ENV) return void 0;
    if (window.ResizeObserver) {
      this.observeByResizeObserver();
    } else {
      this.observeByIframe();
    }
  }

  /**
   * 断开观察
   */
  public disconnect() {
    this.destroy();
  }

  /**
   * 基于 ResizeObserver 观察元素
   */
  private observeByResizeObserver() {
    this.disconnect();
    const observer = new ResizeObserver(entries => {
      const [entry] = entries;
      if (!entry) return void 0;
      const { width, height } = entry.contentRect;
      if (width !== this.prevWidth || height !== this.prevHeight) {
        this.callback({ width: this.prevWidth, height: this.prevHeight }, { width, height });
        this.prevWidth = width;
        this.prevHeight = height;
      }
    });
    observer.observe(this.dom);
    this.destroy = () => {
      observer.disconnect();
    };
  }

  /**
   * 基于 iframe 观察元素
   */
  private observeByIframe() {
    this.dom.style.position = "relative";
    const iframe = document.createElement("iframe");
    iframe.setAttribute("src", "//about:blank");
    iframe.setAttribute("frameborder", "0");
    iframe.setAttribute("contenteditable", "false");
    // 不可以设置 iframe.hidden 属性为 true
    iframe.setAttribute(
      "style",
      [
        "position: absolute",
        "top: 0",
        "left: 0",
        "right: 0",
        "bottom: 0",
        "opacity: 0",
        "width: 100%",
        "height: 100%",
        "border: none",
        "z-index: -999999",
        "user-select: none",
        "visibility: hidden",
        "pointer-events: none",
        "transform: translate(-999999px, -999999px)",
      ].join(";")
    );
    iframe.onload = () => {
      if (!iframe.contentWindow) return void 0;
      iframe.contentWindow.onresize = () => {
        const rect = this.dom.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        if (width !== this.prevWidth || height !== this.prevHeight) {
          this.callback({ width: this.prevWidth, height: this.prevHeight }, { width, height });
          this.prevWidth = width;
          this.prevHeight = height;
        }
      };
    };
    this.dom.appendChild(iframe);
    this.destroy = () => {
      this.dom.removeChild(iframe);
    };
  }
}
