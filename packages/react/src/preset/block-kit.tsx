import type { Editor } from "block-kit-core";
import { EDITOR_STATE } from "block-kit-core";

import { BlockKitContext } from "../hooks/use-editor";
import { ReadonlyContext } from "../hooks/use-readonly";

export const BlockKit: React.FC<{ editor: Editor; readonly?: boolean }> = props => {
  const { editor, readonly, children } = props;

  if (editor.state.get(EDITOR_STATE.READONLY) !== readonly) {
    editor.state.set(EDITOR_STATE.READONLY, readonly || false);
  }

  return (
    <BlockKitContext.Provider value={editor}>
      <ReadonlyContext.Provider value={!!readonly}>{children}</ReadonlyContext.Provider>
    </BlockKitContext.Provider>
  );
};
