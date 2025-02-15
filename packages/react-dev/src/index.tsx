import "./styles/index.scss";
import "@arco-design/web-react/es/style/index.less";

import { Editor, LOG_LEVEL } from "block-kit-core";
import { Delta } from "block-kit-delta";
import {
  AlignPlugin,
  BackgroundPlugin,
  BoldPlugin,
  DividerPlugin,
  FontSizePlugin,
  HeadingPlugin,
  ImagePlugin,
  IndentPlugin,
  InlineCodePlugin,
  ItalicPlugin,
  LineHeightPlugin,
  LinkPlugin,
  MentionPlugin,
  setMountDOM,
  StrikePlugin,
  Toolbar,
  UnderlinePlugin,
} from "block-kit-plugin";
import { FontColorPlugin } from "block-kit-plugin";
import { BulletListPlugin } from "block-kit-plugin";
import { OrderListPlugin } from "block-kit-plugin";
import { BlockKit, Editable } from "block-kit-react";
import type { FC } from "react";
import { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom";

import { GitHubIcon } from "./components/github";
import { INIT } from "./config/block";
import { schema } from "./config/schema";

const App: FC = () => {
  const [readonly] = useState(false);
  const editor = useMemo(() => {
    const instance = new Editor({ delta: INIT, logLevel: LOG_LEVEL.DEBUG, schema });
    instance.plugin.register(
      new BoldPlugin(instance),
      new ItalicPlugin(instance),
      new UnderlinePlugin(instance),
      new StrikePlugin(instance),
      new ImagePlugin(instance),
      new MentionPlugin(),
      new InlineCodePlugin(instance),
      new HeadingPlugin(instance),
      new AlignPlugin(instance),
      new LineHeightPlugin(instance),
      new FontSizePlugin(instance),
      new FontColorPlugin(instance),
      new BackgroundPlugin(instance),
      new DividerPlugin(instance),
      new BulletListPlugin(instance),
      new OrderListPlugin(instance),
      new IndentPlugin(instance),
      new LinkPlugin(instance)
    );
    return instance;
  }, []);

  useEffect(() => {
    // @ts-expect-error editor
    window.editor = editor;
    // @ts-expect-error BlockDelta
    window.Delta = Delta;
  }, [editor]);

  const onMountRef = (e: HTMLElement | null) => {
    setMountDOM(editor, e);
  };

  return (
    <BlockKit editor={editor} readonly={readonly}>
      <div className="block-kit-editor-container">
        <Toolbar className="block-kit-toolbar">
          <Toolbar.Bold></Toolbar.Bold>
          <Toolbar.Italic></Toolbar.Italic>
          <Toolbar.Underline></Toolbar.Underline>
          <Toolbar.Strike></Toolbar.Strike>
          <Toolbar.Link></Toolbar.Link>
          <Toolbar.InlineCode></Toolbar.InlineCode>
          <Toolbar.Cut></Toolbar.Cut>
          <Toolbar.FontSize></Toolbar.FontSize>
          <Toolbar.FontColor></Toolbar.FontColor>
          <Toolbar.Cut></Toolbar.Cut>
          <Toolbar.Heading></Toolbar.Heading>
          <Toolbar.Align></Toolbar.Align>
          <Toolbar.LineHeight></Toolbar.LineHeight>
          <Toolbar.Cut></Toolbar.Cut>
          <Toolbar.BulletList></Toolbar.BulletList>
          <Toolbar.OrderList></Toolbar.OrderList>
          <Toolbar.Cut></Toolbar.Cut>
          <Toolbar.Image></Toolbar.Image>
          <Toolbar.Divider></Toolbar.Divider>
          <Toolbar.Cut></Toolbar.Cut>
          <Toolbar.History></Toolbar.History>
          <Toolbar.Cut></Toolbar.Cut>
          <GitHubIcon></GitHubIcon>
        </Toolbar>
        <div className="block-kit-mount-dom" ref={onMountRef}></div>
        <Editable autoFocus className="block-kit-editable"></Editable>
      </div>
    </BlockKit>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
