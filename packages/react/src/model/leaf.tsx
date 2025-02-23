import type { Editor, LeafState } from "block-kit-core";
import { LEAF_KEY, PLUGIN_TYPE } from "block-kit-core";
import type { FC } from "react";
import React, { useMemo } from "react";

import type { ReactLeafContext } from "../plugin/types";
import { Text } from "../preset/text";
import { LEAF_TO_TEXT as LT } from "../utils/weak-map";

/**
 * Leaf Model
 * @param props
 * @returns
 */
const LeafView: FC<{
  editor: Editor;
  index: number;
  leafState: LeafState;
}> = props => {
  const { editor, leafState } = props;

  const setModel = (ref: HTMLSpanElement | null) => {
    if (ref) {
      editor.model.setLeafModel(ref, leafState);
    }
  };

  const runtime = useMemo(() => {
    const text = leafState.getText();
    const context: ReactLeafContext = {
      op: leafState.op,
      classList: [],
      lineState: leafState.parent,
      leafState: leafState,
      attributes: leafState.op.attributes,
      style: {},
      children: <Text ref={el => LT.set(leafState, el)}>{text}</Text>,
    };
    const plugins = editor.plugin.getPriorityPlugins(PLUGIN_TYPE.RENDER_LEAF);
    for (const plugin of plugins) {
      if (plugin.match(context.attributes || {}, context.op)) {
        context.children = plugin.renderLeaf(context);
      }
    }
    return context;
  }, [editor, leafState]);

  return (
    <span
      {...{ [LEAF_KEY]: true }}
      ref={setModel}
      className={runtime.classList.join(" ")}
      style={runtime.style}
    >
      {runtime.children}
    </span>
  );
};

export const LeafModel = React.memo(LeafView);
