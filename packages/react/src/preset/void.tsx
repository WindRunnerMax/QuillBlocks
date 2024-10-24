import { EDITOR_EVENT, VOID_KEY } from "block-kit-core";
import { Range } from "block-kit-core";
import { Point } from "block-kit-core";
import type { EventFn } from "block-kit-utils";
import { KEY_CODE, useMemoFn } from "block-kit-utils";
import type { FC, PropsWithChildren } from "react";
import React, { useEffect, useMemo } from "react";

import { useEditor } from "../hooks/use-editor";
import type { ReactLeafContext } from "../plugin";
import { ZeroSpace } from "./zero";

export type VoidProps = PropsWithChildren<{
  className?: string;
  style?: React.CSSProperties;
  context: ReactLeafContext;
}>;

export const Void: FC<VoidProps> = props => {
  const { context } = props;
  const editor = useEditor();
  const leafState = context.leafState;
  const range = useMemo(() => leafState.toRange(), [leafState]);

  const onMouseDown = () => {
    const point = new Point(leafState.parent.index, leafState.offset + leafState.length);
    const range = new Range(point, point.clone());
    editor.selection.set(range, true);
  };

  const onKeyDown = useMemoFn<EventFn<typeof EDITOR_EVENT.KEY_DOWN>>(e => {
    const sel = editor.selection.get();
    if (!sel || !sel.isCollapsed || !Point.isEqual(sel.end, range.end)) {
      return void 0;
    }
    switch (e.keyCode) {
      case KEY_CODE.UP: {
        e.preventDefault();
        const prevLine = leafState.parent.prev();
        if (!prevLine) break;
        const point = new Point(prevLine.index, prevLine.length - 1);
        editor.selection.set(new Range(point, point.clone()), true);
        break;
      }
      case KEY_CODE.DOWN: {
        e.preventDefault();
        const nextLine = leafState.parent.next();
        if (!nextLine) break;
        const point = new Point(nextLine.index, 0);
        editor.selection.set(new Range(point, point.clone()), true);
        break;
      }
    }
  });

  useEffect(() => {
    editor.event.on(EDITOR_EVENT.KEY_DOWN, onKeyDown);
    return () => {
      editor.event.off(EDITOR_EVENT.KEY_DOWN, onKeyDown);
    };
  }, [editor.event, onKeyDown]);

  return (
    <React.Fragment>
      <ZeroSpace void hide />
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
