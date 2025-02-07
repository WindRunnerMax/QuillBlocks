export class Scroll {
  /**
   * 检查元素 X 轴溢出
   * @param {Element} dom
   * @returns {boolean}
   */
  public static isOverflowX(dom: Element): boolean {
    if (!dom) return false;
    const rect = dom.getBoundingClientRect();
    return dom.scrollWidth > rect.width;
  }

  /**
   * 检查元素 Y 轴溢出
   * @param {Element} dom
   * @returns {boolean}
   */
  public static isOverflowY(dom: Element): boolean {
    if (!dom) return false;
    const rect = dom.getBoundingClientRect();
    return dom.scrollHeight > rect.height;
  }

  /**
   * X 轴滚动指定距离
   * @param {Element | Window} scroll
   * @param {number} deltaX
   */
  public scrollDeltaX(scroll: Element | Window, deltaX: number) {
    if (scroll instanceof Window) {
      scroll.scrollTo({ top: scroll.scrollX + deltaX, behavior: "instant" });
    } else {
      const left = scroll.scrollLeft + deltaX;
      scroll.scrollLeft = left;
    }
  }

  /**
   * Y 轴滚动指定距离
   * @param {Element | Window} scroll
   * @param {number} deltaY
   */
  public scrollDeltaY(scroll: Element | Window, deltaY: number) {
    if (scroll instanceof Window) {
      scroll.scrollTo({ top: scroll.scrollY + deltaY, behavior: "instant" });
    } else {
      const top = scroll.scrollTop + deltaY;
      scroll.scrollTop = top;
    }
  }

  /**
   * 检查元素滚动到顶部
   * @param {Element} dom
   * @param {number} threshold
   * @returns {boolean}
   */
  public static isCloseToTop(dom: Element, threshold = 0) {
    return dom.scrollTop <= threshold;
  }

  /**
   * 检查元素滚动到底部
   * @param {Element} dom
   * @param {number} threshold
   * @returns {boolean}
   */
  public static isCloseToBottom(dom: Element, threshold: number = 0): boolean {
    return dom.scrollHeight - dom.scrollTop - dom.clientHeight <= threshold;
  }

  /**
   * 检查元素滚动到左侧
   * @param {Element} dom
   * @param {number} threshold
   * @returns {boolean}
   */
  public static isCloseToLeft(dom: Element, threshold: number = 0): boolean {
    return dom.scrollLeft <= threshold;
  }

  /**
   * 检查元素滚动到右侧
   * @param {Element} dom
   * @param {number} threshold
   * @returns {boolean}
   */
  public static isCloseToRight(dom: Element, threshold: number = 0): boolean {
    return dom.scrollWidth - dom.scrollLeft - dom.clientWidth <= threshold;
  }

  /**
   * 滚动到顶部
   * @param {Element | Window} scroll
   */
  public static scrollToTop(scroll: Element | Window) {
    if (scroll instanceof Window) {
      scroll.scrollTo({ top: 0, behavior: "instant" });
    } else {
      scroll.scrollTop = 0;
    }
  }

  /**
   * 滚动到底部
   * @param {Element | Window} scroll
   */
  public static scrollToBottom(scroll: Element | Window) {
    if (scroll instanceof Window) {
      scroll.scrollTo({ top: document.body.scrollHeight, behavior: "instant" });
    } else {
      scroll.scrollTop = scroll.scrollHeight;
    }
  }

  /**
   * 滚动到左侧
   * @param {Element | Window} scroll
   */
  public static scrollToLeft(scroll: Element | Window) {
    if (scroll instanceof Window) {
      scroll.scrollTo({ left: 0, behavior: "instant" });
    } else {
      scroll.scrollLeft = 0;
    }
  }

  /**
   * 滚动到右侧
   * @param {Element | Window} scroll
   */
  public static scrollToRight(scroll: Element | Window) {
    if (scroll instanceof Window) {
      scroll.scrollTo({ left: document.body.scrollWidth, behavior: "instant" });
    } else {
      scroll.scrollLeft = scroll.scrollWidth;
    }
  }
}
