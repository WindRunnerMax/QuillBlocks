import type { Editor } from "block-kit-core";
import React from "react";

export type ToolbarContextType = {
  editor: Editor;
  refreshMarks: () => void;
  keys: Record<string, string>;
  setKeys: (v: Record<string, string>) => void;
};

export const ToolbarContext = React.createContext<ToolbarContextType>({
  keys: {},
  setKeys: () => null,
  refreshMarks: () => null,
  editor: null as unknown as Editor,
});

export const useToolbarContext = () => React.useContext(ToolbarContext);
