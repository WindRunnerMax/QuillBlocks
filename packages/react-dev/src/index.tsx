import "./styles/index.scss";
import "@arco-design/web-react/es/style/index.less";

import { Editor, LOG_LEVEL, Point, Range } from "block-kit-core";
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
    // COMPAT: 这里有个奇怪的表现
    // 当自动聚焦时, 必须要先更新浏览器选区再聚焦
    // 否则会造成立即按下回车时, 光标不会跟随选区移动
    // 无论是 Model 选区还是浏览器选区, 都已经更新但是却不移动
    const start = new Point(0, 0);
    editor.selection.set(new Range(start, start), true);
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
