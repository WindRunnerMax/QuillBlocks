import "block-kit-react/styles/index.css";

import { Editor, LOG_LEVEL } from "block-kit-core";
import { BlockDelta } from "block-kit-delta";
import { Laser } from "block-kit-react";
import type { FC } from "react";
import { useEffect, useMemo } from "react";
import ReactDOM from "react-dom";

import { BoldPlugin } from "../src/bold";
import { ImagePlugin } from "../src/image";
import { INIT } from "./block";
import { schema } from "./schema";

const LaserEditor: FC = () => {
  const editor = useMemo(() => {
    const editor = new Editor({ delta: INIT, logLevel: LOG_LEVEL.DEBUG, schema });
    editor.plugin.register(new BoldPlugin(), new ImagePlugin());
    return editor;
  }, []);

  useEffect(() => {
    // @ts-expect-error editor
    window.editor = editor;
    // @ts-expect-error BlockDelta
    window.BlockDelta = BlockDelta;
  }, [editor]);

  return <Laser editor={editor}></Laser>;
};

ReactDOM.render(<LaserEditor />, document.getElementById("root"));
