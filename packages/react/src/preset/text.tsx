import { LEAF_STRING } from "block-kit-core";
import { isDOMText, isFunction } from "block-kit-utils";
import { forwardRef } from "react";

export type TextProps = {
  children: string;
};

export const Text = forwardRef<HTMLSpanElement, TextProps>((props, ref) => {
  const onRef = (dom: HTMLSpanElement | null) => {
    if (!dom) return null;
    // 处理外部引用的 ref
    if (isFunction(ref)) {
      ref(dom);
    } else {
      ref && (ref.current = dom);
    }
    // COMPAT: 避免 React 非受控与 IME 造成的 DOM 内容问题
    if (props.children !== dom.textContent) {
      // If the text content is inconsistent due to the modification of the input
      // it needs to be corrected
      dom.childNodes.forEach((node, index) => {
        // Guaranteed to have only one text child
        if (index === 0) return null;
        node.parentNode && node.parentNode.removeChild(node);
      });
      if (isDOMText(dom.firstChild)) {
        dom.firstChild.nodeValue = props.children;
      }
    }
  };

  return (
    <span ref={onRef} {...{ [LEAF_STRING]: true }}>
      {props.children}
    </span>
  );
});
