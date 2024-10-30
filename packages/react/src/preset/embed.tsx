import { VOID_KEY } from "block-kit-core";
import { Range } from "block-kit-core";
import { Point } from "block-kit-core";
import type { FC, PropsWithChildren } from "react";
import React from "react";

import { useEditor } from "../hooks/use-editor";
import type { ReactLeafContext } from "../plugin";
import { ZeroSpace } from "./zero";

export type EmbedProps = PropsWithChildren<{
  className?: string;
  style?: React.CSSProperties;
  context: ReactLeafContext;
}>;

export const Embed: FC<EmbedProps> = props => {
  const { context } = props;
  const editor = useEditor();
  const leaf = context.leafState;

  const onMouseDown = () => {
    const point = new Point(leaf.parent.index, leaf.index, 1);
    const range = new Range(point, point.clone());
    editor.selection.set(range, true);
  };

  return (
    <React.Fragment>
      <ZeroSpace embed />
      <span
        className={props.className}
        style={{ margin: "0 1px", ...props.style }}
        contentEditable={false}
        {...{ [VOID_KEY]: true }}
        onMouseDown={onMouseDown}
      >
        {props.children}
      </span>
    </React.Fragment>
  );
};
