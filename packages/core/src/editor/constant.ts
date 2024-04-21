import { BLOCK_TYPE } from "blocks-kit-delta";
import type { BlockSetLike } from "blocks-kit-delta/dist/blocks/interface";
import { ROOT_BLOCK } from "blocks-kit-utils";

export const EMPTY_BLOCK_SET_LIKE: BlockSetLike = {
  [ROOT_BLOCK]: {
    id: ROOT_BLOCK,
    type: BLOCK_TYPE.Z,
    ops: [],
    children: [],
    attributes: {},
  },
};
