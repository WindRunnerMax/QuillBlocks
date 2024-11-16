import "./index.scss";
import "@arco-design/web-react/es/style/index.less";

import { Editor, LOG_LEVEL } from "block-kit-core";
import { Delta } from "block-kit-delta";
import { Editable } from "block-kit-react";
import type { FC } from "react";
import { useEffect, useMemo } from "react";
import ReactDOM from "react-dom";

import { BoldPlugin } from "../src/bold";
import { HeadingPlugin } from "../src/heading";
import { ImagePlugin } from "../src/image";
import { InlineCodePlugin } from "../src/inline-code";
import { MentionPlugin } from "../src/mention";
import { MenuToolbar } from "../src/toolbar";
import { INIT } from "./block";
import { schema } from "./schema";

const App: FC = () => {
  const editor = useMemo(() => {
    const editor = new Editor({ delta: INIT, logLevel: LOG_LEVEL.DEBUG, schema });
    editor.plugin.register(
      new BoldPlugin(editor),
      new ImagePlugin(editor, false),
      new MentionPlugin(),
      new InlineCodePlugin(editor),
      new HeadingPlugin(editor)
    );
    return editor;
  }, []);

  useEffect(() => {
    // @ts-expect-error editor
    window.editor = editor;
    // @ts-expect-error BlockDelta
    window.Delta = Delta;
  }, [editor]);

  return (
    <div className="editor-container">
      <MenuToolbar editor={editor}></MenuToolbar>
      <Editable editor={editor} className="editable-node"></Editable>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
