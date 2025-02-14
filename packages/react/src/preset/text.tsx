import { LEAF_STRING } from "block-kit-core";
import { isDOMText, isFunction } from "block-kit-utils";
import { forwardRef } from "react";

export type TextProps = {
  children: string;
};

/**
 * 文本节点
 * @param props
 */
export const Text = forwardRef<HTMLSpanElement, TextProps>((props, ref) => {
  const onRef = (dom: HTMLSpanElement | null) => {
    // 处理外部引用的 ref
    if (isFunction(ref)) {
      ref(dom);
    } else if (ref) {
      ref.current = dom;
    }
    if (!dom || props.children === dom.textContent) {
      return void 0;
    }
    // COMPAT: 避免 React 非受控与 IME 造成的 DOM 内容问题
    const nodes = dom.childNodes;
    // If the text content is inconsistent due to the modification of the input
    // it needs to be corrected
    for (let i = 1; i < nodes.length; ++i) {
      const node = nodes[i];
      node && node.remove();
    }
    // Guaranteed to have only one text child
    if (isDOMText(dom.firstChild)) {
      dom.firstChild.nodeValue = props.children;
    }
  };

  return (
    <span ref={onRef} {...{ [LEAF_STRING]: true }}>
      {props.children}
    </span>
  );
});
