import { LEAF_KEY, VOID_KEY } from "block-kit-core";
import { Range } from "block-kit-core";
import { Point } from "block-kit-core";
import type { FC, PropsWithChildren } from "react";
import React from "react";

import { useEditor } from "../hooks/use-editor";
import { ZeroSpace } from "./zero";

export type VoidProps = PropsWithChildren<{
  className?: string;
  style?: React.CSSProperties;
}>;

export const Void: FC<VoidProps> = props => {
  const editor = useEditor();
  const ref = React.useRef<HTMLSpanElement>(null);

  const onMouseDown = () => {
    const el = ref.current;
    if (!el) return void 0;
    const leafNode = el.closest(`[${LEAF_KEY}]`) as HTMLElement | null;
    const leafState = editor.model.getLeafState(leafNode);
    if (leafState) {
      const point = new Point(leafState.parent.index, leafState.offset + leafState.length);
      const range = new Range(point, point.clone());
      editor.selection.set(range, true);
    }
  };

  return (
    <React.Fragment>
      <ZeroSpace void hide />
      <span
        ref={ref}
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
