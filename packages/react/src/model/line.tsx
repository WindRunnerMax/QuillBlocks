import type { Editor, LineState } from "block-kit-core";
import { NODE_KEY } from "block-kit-core";
import type { FC } from "react";
import React from "react";

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
      ref && editor.model.setLineModel(ref, lineState);
    }
  };

  return (
    <div {...{ [NODE_KEY]: true }} className="block-kit-line" ref={setModel}>
      {leaves.map((leaf, index) =>
        !leaf.eol ? (
          <LeafModel key={index} editor={editor} index={index} leafState={leaf}></LeafModel>
        ) : (
          <EOLModel key={index} editor={editor} index={index} leafState={leaf} />
        )
      )}
    </div>
  );
};

export const LineModel = React.memo(LineView);
