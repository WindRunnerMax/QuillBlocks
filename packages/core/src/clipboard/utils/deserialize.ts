import type { Delta } from "block-kit-delta";
import type { AttributeMap } from "block-kit-delta";
import { EOL } from "block-kit-delta";
import { isDOMElement } from "block-kit-utils";

/** 块结构标记 */
export const BLOCK_TAG_NAME = [
  "p",
  "div",
  "address",
  "article",
  "blockquote",
  "canvas",
  "dd",
  "dl",
  "dt",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "header",
  "iframe",
  "li",
  "main",
  "nav",
  "ol",
  "output",
  "pre",
  "section",
  "table",
  "td",
  "tr",
  "ul",
  "video",
];

/**
 * Delta 原地应用标记
 * @param delta
 * @param key
 * @param value
 */
export const applyMarker = (delta: Delta, attributes: AttributeMap) => {
  for (const op of delta.ops) {
    if (op.insert !== EOL) {
      op.attributes = { ...op.attributes, ...attributes };
    }
  }
  return delta;
};

/**
 * Delta 原地应用行标记
 * @param delta
 * @param key
 * @param value
 */
export const applyLineMarker = (delta: Delta, attributes: AttributeMap) => {
  for (const op of delta.ops) {
    if (op.insert === EOL) {
      op.attributes = { ...op.attributes, ...attributes };
    }
  }
  // 如果最后一个操作不是 EOL，则添加一个 EOL
  const lastOp = delta.ops[delta.ops.length - 1];
  if (lastOp && lastOp.insert !== EOL) {
    delta.ops.push({ insert: EOL, attributes: { ...attributes } });
  }
  return delta;
};

/**
 * 匹配 HTML 标签
 * @param node
 * @param key
 */
export const isMatchHTMLTag = (node: Node, key: string) => {
  return isDOMElement(node) && node.tagName.toLocaleLowerCase() === key.toLocaleLowerCase();
};

/**
 * 是否匹配块级标签
 * @param node
 */
export const isMatchBlockTag = (node: Node) => {
  return BLOCK_TAG_NAME.some(name => isMatchHTMLTag(node, name));
};
