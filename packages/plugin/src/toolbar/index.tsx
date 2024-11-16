import "./styles/index.scss";

import { IconBold } from "@arco-design/web-react/icon";
import type { Editor } from "block-kit-core";
import { EDITOR_EVENT, pickOpAtPoint } from "block-kit-core";
import type { Op } from "block-kit-delta";
import { stopReactEvent } from "block-kit-react";
import { cs, NOOP, TRUE, useMemoFn } from "block-kit-utils";
import type { FC } from "react";
import { useEffect, useState } from "react";

import { BOLD_KEY } from "../bold/types";
import { filterMarkMap } from "./utils/marks";

export const MenuToolbar: FC<{
  editor: Editor;
}> = props => {
  const [keys, setKeys] = useState<Record<string, string>>({});

  const onComputeMarks = useMemoFn(() => {
    const current = props.editor.selection.get();
    if (!current) return setKeys({});
    const ops: Op[] = [];
    if (current.isCollapsed) {
      const op = pickOpAtPoint(props.editor, current.start);
      op && ops.push(op);
    } else {
      const fragment = props.editor.clipboard.getFragment();
      fragment && ops.push(...fragment.ops);
    }
    const markMap = filterMarkMap(ops);
    setKeys(markMap);
  });

  useEffect(() => {
    props.editor.event.on(EDITOR_EVENT.SELECTION_CHANGE, onComputeMarks);
    return () => {
      props.editor.event.off(EDITOR_EVENT.SELECTION_CHANGE, onComputeMarks);
    };
  }, [props.editor.event, onComputeMarks]);

  return (
    <div className="menu-toolbar" onMouseDown={stopReactEvent}>
      <div
        className={cs("menu-toolbar-item", keys[BOLD_KEY] && "active")}
        onClick={() => {
          props.editor.command.exec(BOLD_KEY, { value: keys[BOLD_KEY] ? NOOP : TRUE });
          onComputeMarks();
        }}
      >
        <IconBold />
      </div>
    </div>
  );
};
