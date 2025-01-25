import "./styles/index.scss";

import { EDITOR_EVENT } from "block-kit-core";
import type { Op } from "block-kit-delta";
import { stopReactEvent } from "block-kit-react";
import { cs, useMemoFn } from "block-kit-utils";
import { useEffect, useState } from "react";

import { ToolbarContext } from "./context/provider";
import { Bold } from "./modules/bold";
import { Heading } from "./modules/heading";
import { InlineCode } from "./modules/inline-code";
import type { ToolbarProps } from "./types";
import { filterLineMarkMap, filterMarkMap } from "./utils/marks";

export const MenuToolbar = (props: ToolbarProps) => {
  const { editor } = props;
  const [keys, setKeys] = useState<Record<string, string>>({});

  const refreshMarks = useMemoFn(() => {
    const current = props.editor.selection.get();
    if (!current) return setKeys({});
    const ops: Op[] = [];
    if (current.isCollapsed) {
      const op = editor.collect.getOpAtPoint(current.start);
      op && ops.push(op);
    } else {
      const fragment = props.editor.collect.getFragment();
      fragment && ops.push(...fragment);
    }
    const markMap = filterMarkMap(ops);
    const lines = props.editor.state.block.getLines();
    const { start, end } = current;
    const lineMarkMap = filterLineMarkMap(
      lines.slice(start.line, end.line + 1).map(line => line.attributes)
    );
    setKeys({ ...markMap, ...lineMarkMap });
  });

  useEffect(() => {
    props.editor.event.on(EDITOR_EVENT.SELECTION_CHANGE, refreshMarks);
    return () => {
      props.editor.event.off(EDITOR_EVENT.SELECTION_CHANGE, refreshMarks);
    };
  }, [props.editor.event, refreshMarks]);

  return (
    <div className={cs("block-kit-menu-toolbar", props.className)} onMouseDown={stopReactEvent}>
      <ToolbarContext.Provider
        value={{
          keys,
          editor,
          setKeys,
          refreshMarks,
        }}
      >
        {props.children}
      </ToolbarContext.Provider>
    </div>
  );
};

MenuToolbar.Bold = Bold;
MenuToolbar.Heading = Heading;
MenuToolbar.InlineCode = InlineCode;
