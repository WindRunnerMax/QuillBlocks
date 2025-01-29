import "./styles/index.scss";
import "@arco-design/web-react/es/style/index.less";

import { Editor, LOG_LEVEL } from "block-kit-core";
import { Delta } from "block-kit-delta";
import {
  AlignPlugin,
  BoldPlugin,
  FontSizePlugin,
  HeadingPlugin,
  ImagePlugin,
  InlineCodePlugin,
  ItalicPlugin,
  LineHeightPlugin,
  MentionPlugin,
  StrikePlugin,
  Toolbar,
  UnderlinePlugin,
} from "block-kit-plugin";
import { BlockKit, Editable } from "block-kit-react";
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
      new HeadingPlugin(instance),
      new AlignPlugin(instance),
      new LineHeightPlugin(instance),
      new FontSizePlugin(instance)
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
    <BlockKit editor={editor}>
      <div className="block-kit-editor-container">
        <Toolbar className="block-kit-toolbar">
          <Toolbar.Bold></Toolbar.Bold>
          <Toolbar.Italic></Toolbar.Italic>
          <Toolbar.Underline></Toolbar.Underline>
          <Toolbar.Strike></Toolbar.Strike>
          <Toolbar.InlineCode></Toolbar.InlineCode>
          <Toolbar.FontSize></Toolbar.FontSize>
          <Toolbar.Cut></Toolbar.Cut>
          <Toolbar.Heading></Toolbar.Heading>
          <Toolbar.Align></Toolbar.Align>
          <Toolbar.LineHeight></Toolbar.LineHeight>
          <Toolbar.Cut></Toolbar.Cut>
          <GitHubIcon></GitHubIcon>
        </Toolbar>
        <Editable autoFocus className="block-kit-editable"></Editable>
      </div>
    </BlockKit>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
