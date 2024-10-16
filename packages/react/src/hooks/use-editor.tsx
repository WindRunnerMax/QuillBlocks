import type { Editor } from "block-kit-core";
import React, { createContext } from "react";

export const LaserContext = createContext<Editor | null>(null);

export const EditorProvider: React.FC<{ editor: Editor }> = props => {
  const { editor, children } = props;
  return <LaserContext.Provider value={editor}>{children}</LaserContext.Provider>;
};

export const useEditor = () => {
  const editor = React.useContext(LaserContext);
  if (!editor) {
    throw new Error("UseEditor must be used within a LaserContext");
  }
  return editor;
};
