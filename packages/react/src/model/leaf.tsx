import type { Editor, LeafState } from "block-kit-core";
import { LEAF_KEY } from "block-kit-core";
import type { FC } from "react";
import React from "react";

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

  return (
    <span {...{ [LEAF_KEY]: true }} ref={setModel}>
      {leafState.op.attributes?.bold === "true" ? (
        <b>
          <Text>{leafState.getText()}</Text>
        </b>
      ) : (
        <Text>{leafState.getText()}</Text>
      )}
    </span>
  );
};

export const LeafModel = React.memo(LeafView);
