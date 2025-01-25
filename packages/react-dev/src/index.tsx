import "./styles/index.scss";
import "@arco-design/web-react/es/style/index.less";

import { Editor, LOG_LEVEL } from "block-kit-core";
import { Delta } from "block-kit-delta";
import {
  BoldPlugin,
  HeadingPlugin,
  ImagePlugin,
  InlineCodePlugin,
  ItalicPlugin,
  MentionPlugin,
  StrikePlugin,
  Toolbar,
  UnderlinePlugin,
} from "block-kit-plugin";
import { Editable } from "block-kit-react";
import type { FC } from "react";
import { useEffect, useMemo } from "react";
import ReactDOM from "react-dom";

import { GitHubIcon } from "./components/github";
import { INIT } from "./config/block";
import { schema } from "./config/schema";

const App: FC = () => {
  const editor = useMemo(() => {
    const instance = new Editor({ delta: INIT, logLevel: LOG_LEVEL.DEBUG, schema });
    instance.plugin.register(
      new BoldPlugin(instance),
      new ItalicPlugin(instance),
      new UnderlinePlugin(instance),
      new StrikePlugin(instance),
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
    editor.selection.focus();
  }, [editor]);

  return (
    <div className="block-kit-editor-container">
      <Toolbar className="block-kit-toolbar" editor={editor}>
        <Toolbar.Heading></Toolbar.Heading>
        <Toolbar.Bold></Toolbar.Bold>
        <Toolbar.Italic></Toolbar.Italic>
        <Toolbar.Underline></Toolbar.Underline>
        <Toolbar.Strike></Toolbar.Strike>
        <Toolbar.Cut></Toolbar.Cut>
        <Toolbar.InlineCode></Toolbar.InlineCode>
        <Toolbar.Cut></Toolbar.Cut>
        <GitHubIcon></GitHubIcon>
      </Toolbar>
      <Editable className="block-kit-editable" editor={editor}></Editable>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
