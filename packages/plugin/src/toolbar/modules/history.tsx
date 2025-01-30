import { IconRedo, IconUndo } from "@arco-design/web-react/icon";
import { EDITOR_EVENT } from "block-kit-core";
import { cs, useMemoFn } from "block-kit-utils";
import type { FC } from "react";
import { Fragment, useEffect, useState } from "react";

import { useToolbarContext } from "../context/provider";

export const History: FC = () => {
  const { editor, refreshMarks } = useToolbarContext();
  const [undoable, setUndoable] = useState(false);
  const [redoable, setRedoable] = useState(false);

  const refresh = useMemoFn(() => {
    setUndoable(editor.history.isUndoAble());
    setRedoable(editor.history.isRedoAble());
  });

  useEffect(() => {
    editor.event.on(EDITOR_EVENT.CONTENT_CHANGE, refresh, 1000);
    return () => {
      editor.event.off(EDITOR_EVENT.CONTENT_CHANGE, refresh);
    };
  }, [editor, refresh]);

  const undo = () => {
    editor.history.undo();
    refreshMarks();
  };

  const redo = () => {
    editor.history.redo();
    refreshMarks();
  };

  return (
    <Fragment>
      <div className={cs("menu-toolbar-item", !undoable && "disable")} onClick={undo}>
        <IconUndo />
      </div>
      <div className={cs("menu-toolbar-item", !redoable && "disable")} onClick={redo}>
        <IconRedo />
      </div>
    </Fragment>
  );
};
