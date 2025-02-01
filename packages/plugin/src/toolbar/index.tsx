import "./styles/index.scss";

import { EDITOR_EVENT } from "block-kit-core";
import type { Op } from "block-kit-delta";
import { useEditorStatic } from "block-kit-react";
import { cs, useMemoFn } from "block-kit-utils";
import { useEffect, useState } from "react";

import { ToolbarContext } from "./context/provider";
import { Align } from "./modules/align";
import { Bold } from "./modules/bold";
import { Cut } from "./modules/cut";
import { FontColor } from "./modules/font-color";
import { FontSize } from "./modules/font-size";
import { Heading } from "./modules/heading";
import { History } from "./modules/history";
import { InlineCode } from "./modules/inline-code";
import { Italic } from "./modules/italic";
import { LineHeight } from "./modules/line-height";
import { Strike } from "./modules/strike";
import { Underline } from "./modules/underline";
import type { ToolbarProps } from "./types";
import { filterLineMarkMap, filterMarkMap } from "./utils/marks";

export const Toolbar = (props: ToolbarProps) => {
  const { editor } = useEditorStatic();
  const [keys, setKeys] = useState<Record<string, string>>({});

  const refreshMarks = useMemoFn(() => {
    const current = editor.selection.get();
    if (!current) {
      setKeys({});
      return void 0;
    }
    if (current.isCollapsed) {
      setKeys({ ...editor.collect.marks });
      return void 0;
    }
    const ops: Op[] = [];
    if (current.isCollapsed) {
      const op = editor.collect.getOpAtPoint(current.start);
      op && ops.push(op);
    } else {
      const fragment = editor.collect.getFragment();
      fragment && ops.push(...fragment);
    }
    const markMap = filterMarkMap(ops);
    const lines = editor.state.block.getLines();
    const { start, end } = current;
    const lineMarkMap = filterLineMarkMap(
      lines.slice(start.line, end.line + 1).map(line => line.attributes)
    );
    setKeys({ ...markMap, ...lineMarkMap });
  });

  useEffect(() => {
    editor.event.on(EDITOR_EVENT.SELECTION_CHANGE, refreshMarks);
    return () => {
      editor.event.off(EDITOR_EVENT.SELECTION_CHANGE, refreshMarks);
    };
  }, [editor.event, refreshMarks]);

  return (
    <div
      className={cs("block-kit-menu-toolbar", props.className)}
      onMouseDown={e => e.preventDefault()}
    >
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

Toolbar.Cut = Cut;
Toolbar.Bold = Bold;
Toolbar.Align = Align;
Toolbar.Italic = Italic;
Toolbar.Strike = Strike;
Toolbar.History = History;
Toolbar.Heading = Heading;
Toolbar.FontSize = FontSize;
Toolbar.FontColor = FontColor;
Toolbar.Underline = Underline;
Toolbar.InlineCode = InlineCode;
Toolbar.LineHeight = LineHeight;
