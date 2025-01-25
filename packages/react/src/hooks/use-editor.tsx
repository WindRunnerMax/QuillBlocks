import type { Editor } from "block-kit-core";
import React, { createContext } from "react";

export const BlockKitContext = createContext<Editor | null>(null);

export const EditorProvider: React.FC<{ editor: Editor }> = props => {
  const { editor, children } = props;
  return <BlockKitContext.Provider value={editor}>{children}</BlockKitContext.Provider>;
};

export const useEditor = () => {
  const editor = React.useContext(BlockKitContext);

  if (!editor) {
    throw new Error("UseEditor must be used within a EditorContext");
  }

  return editor;
};
