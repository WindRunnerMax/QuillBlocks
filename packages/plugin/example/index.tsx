import "block-kit-react/styles/index.css";

import { Editor, LOG_LEVEL } from "block-kit-core";
import { BlockDelta } from "block-kit-delta";
import { Laser } from "block-kit-react";
import type { FC } from "react";
import { useEffect, useMemo } from "react";
import ReactDOM from "react-dom";

import { INIT } from "./block-set";

const LaserEditor: FC = () => {
  const editor = useMemo(() => new Editor({ delta: INIT, logLevel: LOG_LEVEL.DEBUG }), []);

  useEffect(() => {
    // @ts-expect-error editor
    window.editor = editor;
    // @ts-expect-error BlockDelta
    window.BlockDelta = BlockDelta;
  }, [editor]);

  return <Laser editor={editor}></Laser>;
};

ReactDOM.render(<LaserEditor />, document.getElementById("root"));
