import type { Editor, LeafState } from "block-kit-core";
import { LEAF_KEY } from "block-kit-core";
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

  const context = useMemo(() => {
    const context: ReactLeafContext = {
      op: leafState.op,
      classList: [],
      lineState: leafState.parent,
      leafState: leafState,
      attributes: leafState.op.attributes,
      style: {},
      children: <Text>{leafState.getText()}</Text>,
    };
    for (const plugin of editor.plugin.current) {
      if (plugin.render && plugin.match(context.attributes || {}, context.op)) {
        plugin.render(context);
      }
    }
    return context;
  }, [editor, leafState]);

  return (
    <span
      {...{ [LEAF_KEY]: true }}
      ref={setModel}
      className={context.classList.join(" ")}
      style={context.style}
    >
      {context.children}
    </span>
  );
};

export const LeafModel = React.memo(LeafView);
