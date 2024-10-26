import type { Editor } from "block-kit-core";
import { EDITOR_KEY, EDITOR_STATE } from "block-kit-core";
import React, { useEffect, useLayoutEffect, useRef } from "react";

import { EditorProvider } from "../hooks/use-editor";
import { BlockModel } from "../model/block";

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
    <EditorProvider editor={editor}>
      <div
        ref={ref}
        {...{ [EDITOR_KEY]: true }}
        contentEditable={!readonly}
        suppressContentEditableWarning
        style={{
          outline: "none",
          overflowWrap: "break-word",
          position: "relative",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        <BlockModel editor={editor} state={editor.state.block}></BlockModel>
      </div>
    </EditorProvider>
  );
};
