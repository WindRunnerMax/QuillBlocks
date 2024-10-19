import type { Op } from "block-kit-delta";
import { getOpLength } from "block-kit-delta";

import type { Editor } from "../../editor";

/**
 * 获取索引位置的 Op
 * @param op
 */
export const pickOpAtIndex = (editor: Editor, length: number): Op | null => {
  const delta = editor.state.toBlockSet();
  const ops = delta.ops;
  let index = length;
  for (const op of ops) {
    const opLength = getOpLength(op);
    if (opLength >= index) {
      return op;
    }
    index = index - opLength;
  }
  return null;
};
