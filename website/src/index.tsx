import "./styles/index.scss";
import "@arco-design/web-react/es/style/index.less";

import { Editor, LOG_LEVEL } from "block-kit-core";
import { Delta } from "block-kit-delta";
import {
  AlignPlugin,
  BackgroundPlugin,
  BoldPlugin,
  DividerPlugin,
  FloatToolbar,
  FontSizePlugin,
  HeadingPlugin,
  ImagePlugin,
  IndentPlugin,
  InlineCodePlugin,
  ItalicPlugin,
  LineHeightPlugin,
  LinkPlugin,
  MentionPlugin,
  Mixin,
  QuotePlugin,
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
      new LinkPlugin(instance),
      new QuotePlugin(instance)
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
    e && setMountDOM(editor, e);
  };

  return (
    <BlockKit editor={editor} readonly={readonly}>
      <div className="block-kit-editor-container">
        <Toolbar className="block-kit-toolbar">
          <Mixin.Bold></Mixin.Bold>
          <Mixin.Italic></Mixin.Italic>
          <Mixin.Underline></Mixin.Underline>
          <Mixin.Strike></Mixin.Strike>
          <Mixin.Link></Mixin.Link>
          <Mixin.InlineCode></Mixin.InlineCode>
          <Mixin.Cut></Mixin.Cut>
          <Mixin.FontSize></Mixin.FontSize>
          <Mixin.FontColor></Mixin.FontColor>
          <Mixin.Cut></Mixin.Cut>
          <Mixin.Heading></Mixin.Heading>
          <Mixin.Align></Mixin.Align>
          <Mixin.LineHeight></Mixin.LineHeight>
          <Mixin.Cut></Mixin.Cut>
          <Mixin.Quote></Mixin.Quote>
          <Mixin.BulletList></Mixin.BulletList>
          <Mixin.OrderList></Mixin.OrderList>
          <Mixin.Cut></Mixin.Cut>
          <Mixin.Image></Mixin.Image>
          <Mixin.Divider></Mixin.Divider>
          <Mixin.Cut></Mixin.Cut>
          <Mixin.History></Mixin.History>
          <Mixin.Cut></Mixin.Cut>
          <GitHubIcon></GitHubIcon>
        </Toolbar>
        <FloatToolbar width={344} offsetHeight={50}>
          <Mixin.Bold></Mixin.Bold>
          <Mixin.Italic></Mixin.Italic>
          <Mixin.Underline></Mixin.Underline>
          <Mixin.Strike></Mixin.Strike>
          <Mixin.Link></Mixin.Link>
          <Mixin.InlineCode></Mixin.InlineCode>
          <Mixin.FontSize></Mixin.FontSize>
          <Mixin.FontColor></Mixin.FontColor>
        </FloatToolbar>
        <div className="block-kit-editable-container">
          <div className="block-kit-mount-dom" ref={onMountRef}></div>
          <Editable autoFocus className="block-kit-editable"></Editable>
        </div>
      </div>
    </BlockKit>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
