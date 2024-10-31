import "./index.scss";
import "@arco-design/web-react/es/style/index.less";

import { Editor, LOG_LEVEL } from "block-kit-core";
import { BlockDelta } from "block-kit-delta";
import { Editable } from "block-kit-react";
import type { FC } from "react";
import { useEffect, useMemo } from "react";
import ReactDOM from "react-dom";

import { BoldPlugin } from "../src/bold";
import { ImagePlugin } from "../src/image";
import { InlineCodePlugin } from "../src/inline-code";
import { MentionPlugin } from "../src/mention";
import { INIT } from "./block";
import { schema } from "./schema";

const App: FC = () => {
  const editor = useMemo(() => {
    const editor = new Editor({ delta: INIT, logLevel: LOG_LEVEL.DEBUG, schema });
    editor.plugin.register(
      new BoldPlugin(),
      new ImagePlugin(editor, false),
      new MentionPlugin(),
      new InlineCodePlugin()
    );
    return editor;
  }, []);

  useEffect(() => {
    // @ts-expect-error editor
    window.editor = editor;
    // @ts-expect-error BlockDelta
    window.BlockDelta = BlockDelta;
  }, [editor]);

  return <Editable editor={editor}></Editable>;
};

ReactDOM.render(<App />, document.getElementById("root"));
