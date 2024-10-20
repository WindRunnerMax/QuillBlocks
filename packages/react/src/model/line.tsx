import type { Editor, LineState } from "block-kit-core";
import { NODE_KEY } from "block-kit-core";
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
    return (
      <React.Fragment>
        {leaves.map((leaf, index) => {
          if (leaf.eol) {
            // 判断是否为 Block Void 行, 只需要判断行首节点即可
            const firstNode = leaves[0];
            const isBlockVoid = firstNode && firstNode.block && firstNode.void;
            return (
              <EOLModel
                blockVoid={isBlockVoid}
                key={EOL}
                editor={editor}
                index={index}
                leafState={leaf}
              />
            );
          }
          return <LeafModel key={index} editor={editor} index={index} leafState={leaf} />;
        })}
      </React.Fragment>
    );
  }, [editor, leaves]);

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
