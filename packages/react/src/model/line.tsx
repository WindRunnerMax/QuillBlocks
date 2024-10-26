import type { Editor, LineState } from "block-kit-core";
import { NODE_KEY } from "block-kit-core";
import { LeafState } from "block-kit-core";
import { EOL } from "block-kit-delta";
import type { FC } from "react";
import React, { useMemo } from "react";

import type { ReactLineContext } from "../plugin";
import { EOLModel } from "./eol";
import { LeafModel } from "./leaf";

const LineView: FC<{
  editor: Editor;
  index: number;
  lineState: LineState;
}> = props => {
  const { editor, lineState } = props;
  const leaves = lineState.getLeaves();

  const setModel = (ref: HTMLDivElement | null) => {
    if (ref) {
      editor.model.setLineModel(ref, lineState);
    }
  };

  const children = useMemo(() => {
    const textLeaves = leaves.slice(0, -1);
    const nodes = textLeaves.map((n, i) => (
      <LeafModel key={i} editor={editor} index={i} leafState={n} />
    ));
    // COMPAT: 空行则仅存在一个 Leaf, 此时需要渲染空的占位节点
    if (!nodes.length && leaves[0]) {
      const leaf = leaves[0];
      nodes.push(<EOLModel key={EOL} editor={editor} leafState={leaf} />);
      return nodes;
    }
    const lastLeaf = textLeaves[textLeaves.length - 1];
    // COMPAT: inline-void 在行未时需要预设零宽字符来放置光标
    if (lastLeaf && lastLeaf.void && lastLeaf.inline) {
      const leaf = new LeafState({ insert: EOL }, lastLeaf.offset + 1, lineState);
      nodes.push(<EOLModel key={EOL} editor={editor} leafState={leaf} />);
    }
    return nodes;
  }, [editor, leaves, lineState]);

  const context = useMemo(() => {
    const context: ReactLineContext = {
      classList: [],
      lineState: lineState,
      attributes: lineState.attributes,
      style: {},
      children: children,
    };
    for (const plugin of editor.plugin.current) {
      if (plugin.renderLine) {
        context.children = plugin.renderLine(context);
      }
    }
    return context;
  }, [children, editor.plugin, lineState]);

  return (
    <div {...{ [NODE_KEY]: true }} ref={setModel} dir="auto">
      {context.children}
    </div>
  );
};

export const LineModel = React.memo(LineView);
