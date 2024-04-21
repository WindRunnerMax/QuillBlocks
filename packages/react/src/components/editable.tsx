import "../styles/index.scss";

import type { Editor } from "blocks-kit-core";
import { EDITOR_STATE } from "blocks-kit-core";
import React, { useEffect, useLayoutEffect, useRef } from "react";

import { WithEditor } from "../hooks/use-editor";

export const Editable: React.FC<{
  editor: Editor;
  readonly?: boolean;
}> = props => {
  const { editor, readonly } = props;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    editor.state.set(EDITOR_STATE.READONLY, readonly || false);
  }, [editor.state, readonly]);

  useLayoutEffect(() => {
    const el = ref.current;
    el && editor.onMount(el);
    return () => {
      editor.destroy();
    };
  }, [editor]);

  return (
    <WithEditor editor={editor}>
      <div ref={ref} className="blocks-editor"></div>
    </WithEditor>
  );
};
