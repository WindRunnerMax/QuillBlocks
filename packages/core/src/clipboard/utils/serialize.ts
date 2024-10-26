import { EOL } from "block-kit-delta";

import { LINE_TAG } from "../types";

/**
 * 序列化 HTML 到 文本
 * @param node
 */
export const serializeHTML = (node: Node): string => {
  const el = document.createElement("div");
  el.appendChild(node);
  return el.innerHTML;
};

/**
 * 递归处理节点文本内容
 * @param node
 */
export const getTextContent = (node: Node): string => {
  if (node instanceof Text) {
    return node.textContent || "";
  }
  const texts: string[] = [];
  node.childNodes.forEach(child => {
    texts.push(getTextContent(child));
  });
  if (node instanceof Element && node.getAttribute(LINE_TAG)) {
    texts.push(EOL);
  }
  return texts.join("");
};

/**
 * 获取节点的文本内容
 * @param node
 */
export const getFragmentText = (node: Node) => {
  const texts: string[] = [];
  Array.from(node.childNodes).forEach(it => {
    texts.push(getTextContent(it));
  });
  // COMPAT: 将文本最后的`\n`移除
  return texts.join("").slice(0, -1);
};
