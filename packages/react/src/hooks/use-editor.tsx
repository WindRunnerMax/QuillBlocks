import type { Editor } from "block-kit-core";
import React, { createContext } from "react";

export const BlockKitContext = createContext<Editor | null>(null);

export const useEditorStatic = () => {
  const editor = React.useContext(BlockKitContext);

  if (!editor) {
    throw new Error("UseEditor must be used within a EditorContext");
  }

  return {
    editor,
    ref: editor.ref,
    rect: editor.rect,
    state: editor.state,
    event: editor.event,
    input: editor.input,
    model: editor.model,
    plugin: editor.plugin,
    schema: editor.schema,
    logger: editor.logger,
    collect: editor.collect,
    command: editor.command,
    history: editor.history,
    perform: editor.perform,
    clipboard: editor.clipboard,
    selection: editor.selection,
  };
};
