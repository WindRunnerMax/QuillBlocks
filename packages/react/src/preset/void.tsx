import { VOID_KEY } from "block-kit-core";
import { Range } from "block-kit-core";
import { Point } from "block-kit-core";
import type { FC, PropsWithChildren } from "react";
import React from "react";

import { useEditorStatic } from "../hooks/use-editor";
import type { ReactLeafContext } from "../plugin/types";
import { ZeroSpace } from "./zero";

export type VoidProps = PropsWithChildren<{
  className?: string;
  style?: React.CSSProperties;
  context: ReactLeafContext;
  tag?: "span" | "div";
}>;

/**
 * 空嵌入节点 HOC
 * @param props
 */
export const Void: FC<VoidProps> = props => {
  const { context, tag: Tag = "span" } = props;
  const { editor } = useEditorStatic();
  const leaf = context.leafState;

  const onMouseDown = () => {
    // Fix: 修复选区偏移量, leaf 的长度可能 > 1, 而 DOM 节点的长度仅为 1
    const point = new Point(leaf.parent.index, leaf.offset + 1);
    const range = new Range(point, point.clone());
    editor.selection.set(range, true);
  };

  return (
    <React.Fragment>
      <ZeroSpace void hide len={leaf.length > 1 ? leaf.length : void 0} />
      <Tag
        className={props.className}
        style={{ userSelect: "none", ...props.style }}
        contentEditable={false}
        {...{ [VOID_KEY]: true }}
        onMouseDown={onMouseDown}
      >
        {props.children}
      </Tag>
    </React.Fragment>
  );
};
