import DOMNodeType = globalThis.Node;
import DOMTextType = globalThis.Text;
import DOMElementType = globalThis.Element;

const global = typeof globalThis !== "undefined" ? globalThis : window;
const DOMNode = global.Node;

/**
 * 检查 DOM 节点
 * @param {unknown} value
 * @returns {boolean}
 */
export const isDOMNode = (value: unknown): value is DOMNodeType => {
  return value instanceof Node;
};

/**
 * 检查 DOM 文本节点
 * @param {unknown} value
 * @returns {boolean}
 */
export const isDOMText = (value: unknown): value is DOMTextType => {
  return isDOMNode(value) && value.nodeType === DOMNode.TEXT_NODE;
};

/**
 * 检查 DOM 元素节点
 * @param {unknown} value
 * @returns {boolean}
 */
export const isDOMElement = (value: unknown): value is DOMElementType => {
  return isDOMNode(value) && value.nodeType === DOMNode.ELEMENT_NODE;
};

/**
 * 检查 DOM 注释节点
 * @param {unknown} value
 * @returns {boolean}
 */
export const isDOMComment = (value: unknown): value is Comment => {
  return isDOMNode(value) && value.nodeType === DOMNode.COMMENT_NODE;
};

/**
 * 检查 DOM 文档节点
 * @param {unknown} value
 * @returns {boolean}
 */
export const isHTMLElement = (value: unknown): value is HTMLElement => {
  return isDOMNode(value) && value instanceof HTMLElement;
};

/**
 * 获取焦点元素
 * @returns {DOMElementType | null}
 */
export const getActiveElement = () => {
  let activeElement = document.activeElement;

  while (activeElement && activeElement.shadowRoot && activeElement.shadowRoot.activeElement) {
    activeElement = activeElement.shadowRoot.activeElement;
  }

  return activeElement;
};

/**
 * 阻止事件冒泡
 * @param event
 */
export const stopNativeEvent = (
  event: Pick<Event, "stopPropagation"> & Partial<Pick<Event, "stopImmediatePropagation">>
) => {
  event.stopPropagation();
  event.stopImmediatePropagation && event.stopImmediatePropagation();
};

/**
 * 阻止事件默认行为与冒泡
 * @param event
 */
export const preventNativeEvent = (
  event: Pick<Event, "preventDefault" | "stopPropagation"> &
    Partial<Pick<Event, "stopImmediatePropagation">>
) => {
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation && event.stopImmediatePropagation();
};
