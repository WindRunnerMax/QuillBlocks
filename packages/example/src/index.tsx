import "./index.scss";
import "@arco-design/web-react/es/style/index.less";

import { Editor, LOG_LEVEL } from "block-kit-core";
import { Delta } from "block-kit-delta";
import { BoldPlugin } from "block-kit-plugin";
import { HeadingPlugin } from "block-kit-plugin";
import { ImagePlugin } from "block-kit-plugin";
import { InlineCodePlugin } from "block-kit-plugin";
import { MentionPlugin } from "block-kit-plugin";
import { MenuToolbar } from "block-kit-plugin";
import { Editable } from "block-kit-react";
import type { FC } from "react";
import { useEffect, useMemo } from "react";
import ReactDOM from "react-dom";

import { INIT } from "./block";
import { schema } from "./schema";

const App: FC = () => {
  const editor = useMemo(() => {
    const instance = new Editor({ delta: INIT, logLevel: LOG_LEVEL.DEBUG, schema });
    instance.plugin.register(
      new BoldPlugin(instance),
      new ImagePlugin(instance, false),
      new MentionPlugin(),
      new InlineCodePlugin(instance),
      new HeadingPlugin(instance)
    );
    return instance;
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
