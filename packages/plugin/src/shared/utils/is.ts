import type { Editor } from "block-kit-core";

export const isEmptyLine = (editor: Editor, lineIndex: number) => {
  const line = editor.state.block.getLine(lineIndex);
  return line && line.getLeaves().length === 0;
};
