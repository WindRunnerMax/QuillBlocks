import type { DeltaSetLike } from "blocks-kit-delta";
import { BLOCK_TYPE } from "blocks-kit-delta";
import { ROOT_BLOCK } from "blocks-kit-utils";

export const EMPTY_DELTA_SET_LIKE: DeltaSetLike = {
  [ROOT_BLOCK]: {
    blockId: ROOT_BLOCK,
    ops: [{ insert: "\n" }],
    blockType: BLOCK_TYPE.Z,
  },
};
