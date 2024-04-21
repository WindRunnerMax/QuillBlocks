import { Editor, LOG_LEVEL } from "blocks-kit-core";
import { BlockSet } from "blocks-kit-delta";
import type { FC } from "react";
import { useEffect, useMemo } from "react";
import ReactDOM from "react-dom";

import { Editable } from "./components/editable";
import { DEFAULT_BLOCKS_DATA } from "./utils/constant";

export const BlocksEditor: FC = () => {
  const editor = useMemo(
    () => new Editor({ blockSet: new BlockSet(DEFAULT_BLOCKS_DATA), logLevel: LOG_LEVEL.INFO }),
    []
  );

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.editor = editor;
  }, [editor]);

  return <Editable editor={editor}></Editable>;
};

ReactDOM.render(<BlocksEditor />, document.getElementById("root"));
