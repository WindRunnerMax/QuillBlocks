import "./styles/index.scss";

import { Trigger } from "@arco-design/web-react";
import { IconBold, IconCode } from "@arco-design/web-react/icon";
import type { Editor } from "block-kit-core";
import { EDITOR_EVENT } from "block-kit-core";
import type { Op } from "block-kit-delta";
import { stopReactEvent } from "block-kit-react";
import { cs, NOOP, TRUE, useMemoFn } from "block-kit-utils";
import type { FC } from "react";
import { useEffect, useRef, useState } from "react";

import { BOLD_KEY } from "../bold/types";
import { HEADING_KEY } from "../heading/types";
import { INLINE_CODE } from "../inline-code/types";
import { filterLineMarkMap, filterMarkMap } from "./utils/marks";

export const MenuToolbar: FC<{
  editor: Editor;
}> = props => {
  const { editor } = props;
  const triggerRef = useRef<Trigger>(null);
  const [keys, setKeys] = useState<Record<string, string>>({});

  const onComputeMarks = useMemoFn(() => {
    const current = props.editor.selection.get();
    if (!current) return setKeys({});
    const ops: Op[] = [];
    if (current.isCollapsed) {
      const op = editor.collect.pickOpAtPoint(current.start);
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
    props.editor.event.on(EDITOR_EVENT.SELECTION_CHANGE, onComputeMarks);
    return () => {
      props.editor.event.off(EDITOR_EVENT.SELECTION_CHANGE, onComputeMarks);
    };
  }, [props.editor.event, onComputeMarks]);

  return (
    <div className="menu-toolbar" onMouseDown={stopReactEvent}>
      <Trigger
        ref={triggerRef}
        trigger="click"
        popup={() => (
          <div
            className="toolbar-dropdown"
            onClick={() => {
              onComputeMarks();
              triggerRef.current?.setPopupVisible(false);
            }}
          >
            <div onClick={() => editor.command.exec(HEADING_KEY, { value: NOOP })}>Text</div>
            <div onClick={() => editor.command.exec(HEADING_KEY, { value: "h1" })}>H1</div>
            <div onClick={() => editor.command.exec(HEADING_KEY, { value: "h2" })}>H2</div>
            <div onClick={() => editor.command.exec(HEADING_KEY, { value: "h3" })}>H3</div>
          </div>
        )}
      >
        <div className="menu-toolbar-item" style={{ width: 20, textAlign: "center" }}>
          {keys[HEADING_KEY]?.toUpperCase() || "Text"}
        </div>
      </Trigger>
      <div
        className={cs("menu-toolbar-item", keys[BOLD_KEY] && "active")}
        onClick={() => {
          props.editor.command.exec(BOLD_KEY, { value: keys[BOLD_KEY] ? NOOP : TRUE });
          onComputeMarks();
        }}
      >
        <IconBold />
      </div>
      <div
        className={cs("menu-toolbar-item", keys[INLINE_CODE] && "active")}
        onClick={() => {
          props.editor.command.exec(INLINE_CODE, { value: keys[INLINE_CODE] ? NOOP : TRUE });
          onComputeMarks();
        }}
      >
        <IconCode />
      </div>
    </div>
  );
};
