import type { Editor, LeafState } from "block-kit-core";
import { LEAF_KEY } from "block-kit-core";
import type { FC } from "react";
import React from "react";

import { ZeroSpace } from "../preset/zero";

const EOLView: FC<{
  editor: Editor;
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
      <ZeroSpace enter />
    </span>
  );
};

export const EOLModel = React.memo(EOLView);
