import type { Editor, LineState } from "block-kit-core";
import { NODE_KEY, PLUGIN_TYPE } from "block-kit-core";
import { EOL, EOL_OP } from "block-kit-delta";
import { cs, isDOMText } from "block-kit-utils";
import { useUpdateLayoutEffect } from "block-kit-utils/dist/es/hooks";
import type { FC } from "react";
import React, { useMemo } from "react";

import type { ReactLineContext } from "../plugin";
import { JSX_TO_LEAF, LEAF_TO_TEXT } from "../utils/weak-map";
import { EOLModel } from "./eol";
import { LeafModel } from "./leaf";

const LineView: FC<{
  editor: Editor;
  index: number;
  lineState: LineState;
}> = props => {
  const { editor, lineState } = props;

  const setModel = (ref: HTMLDivElement | null) => {
    if (ref) {
      editor.model.setLineModel(ref, lineState);
    }
  };

  // 首次处理会将所有 DOM 渲染, 不需要执行脏数据检查
  // 需要 LayoutEffect 以保证 DOM -> Sel 的执行顺序
  useUpdateLayoutEffect(() => {
    const leaves = lineState.getLeaves();
    for (const leaf of leaves) {
      const dom = LEAF_TO_TEXT.get(leaf);
      if (!dom) continue;
      const text = leaf.getText();
      // 避免 React 非受控与 IME 造成的 DOM 内容问题
      if (text === dom.textContent) continue;
      editor.logger.debug("Correct Text Node", dom);
      const nodes = dom.childNodes;
      for (let i = 1; i < nodes.length; ++i) {
        const node = nodes[i];
        node && node.remove();
      }
      if (isDOMText(dom.firstChild)) {
        dom.firstChild.nodeValue = text;
      }
    }
  }, [lineState]);

  const elements = useMemo(() => {
    const leaves = lineState.getLeaves();
    const textLeaves = leaves.slice(0, -1);
    const nodes = textLeaves.map((n, i) => {
      const node = <LeafModel key={i} editor={editor} index={i} leafState={n} />;
      JSX_TO_LEAF.set(node, n);
      return node;
    });
    // 空行则仅存在一个 Leaf, 此时需要渲染空的占位节点
    if (!nodes.length && leaves[0]) {
      const leaf = leaves[0];
      const node = <EOLModel key={EOL} editor={editor} leafState={leaf} />;
      JSX_TO_LEAF.set(node, leaf);
      nodes.push(node);
      return nodes;
    }
    // inline-void(embed) 在行未时需要预设零宽字符来放置光标
    const eolLeaf = leaves[leaves.length - 1];
    const lastLeaf = textLeaves[textLeaves.length - 1];
    if (lastLeaf && eolLeaf && lastLeaf.embed) {
      const node = <EOLModel key={EOL} editor={editor} leafState={eolLeaf} />;
      JSX_TO_LEAF.set(node, eolLeaf);
      nodes.push(node);
      return nodes;
    }
    return nodes;
  }, [editor, lineState]);

  const children = useMemo(() => {
    const wrapped: JSX.Element[] = [];
    for (let i = 0; i < elements.length; ++i) {
      wrapped.push(elements[i]);
    }
    return wrapped;
  }, [elements]);

  const runtime = useMemo(() => {
    const context: ReactLineContext = {
      classList: [],
      lineState: lineState,
      attributes: lineState.attributes,
      style: {},
      children,
    };
    const plugins = editor.plugin.getPriorityPlugins(PLUGIN_TYPE.RENDER_LINE);
    for (const plugin of plugins) {
      const op = { ...EOL_OP, attributes: context.attributes };
      if (plugin.match(context.attributes, op)) {
        context.children = plugin.renderLine(context);
      }
    }
    return context;
  }, [children, editor.plugin, lineState]);

  return (
    <div
      {...{ [NODE_KEY]: true }}
      ref={setModel}
      dir="auto"
      className={cs(runtime.classList)}
      style={runtime.style}
    >
      {runtime.children}
    </div>
  );
};

export const LineModel = React.memo(LineView);
