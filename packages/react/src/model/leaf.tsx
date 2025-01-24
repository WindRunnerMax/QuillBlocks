import type { Editor, LeafState } from "block-kit-core";
import { LEAF_KEY, PLUGIN_TYPE } from "block-kit-core";
import type { FC } from "react";
import React, { useMemo } from "react";

import type { ReactLeafContext } from "../plugin";
import { Text } from "../preset/text";

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
    const context: ReactLeafContext = {
      op: leafState.op,
      classList: [],
      lineState: leafState.parent,
      leafState: leafState,
      attributes: leafState.op.attributes,
      style: {},
      children: <Text>{leafState.getText()}</Text>,
    };
    const plugins = editor.plugin.getPriorityPlugins(PLUGIN_TYPE.RENDER);
    for (const plugin of plugins) {
      if (plugin.match(context.attributes || {}, context.op)) {
        context.children = plugin.render(context);
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
