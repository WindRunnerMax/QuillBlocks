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
  const leafState = context.leafState;

  const onMouseDown = () => {
    const point = new Point(leafState.parent.index, leafState.offset + leafState.length);
    const range = new Range(point, point.clone());
    editor.selection.set(range, true);
  };

  return (
    <React.Fragment>
      <ZeroSpace />
      <span
        className={props.className}
        style={{ userSelect: "none", ...props.style }}
        contentEditable={false}
        {...{ [VOID_KEY]: true }}
        onMouseDown={onMouseDown}
      >
        {props.children}
      </span>
    </React.Fragment>
  );
};
