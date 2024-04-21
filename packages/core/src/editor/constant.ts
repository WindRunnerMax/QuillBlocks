import { BLOCK_TYPE } from "blocks-kit-delta";
import type { BlockLike, BlockSetLike } from "blocks-kit-delta/dist/blocks/interface";
import { ROOT_BLOCK } from "blocks-kit-utils";

export const DEFAULT_BLOCK_LIKE: BlockLike = {
  id: ROOT_BLOCK,
  ops: [],
  children: [],
  attributes: {},
  type: BLOCK_TYPE.Z,
};

export const DEFAULT_BLOCK_SET_LIKE: BlockSetLike = {
  [ROOT_BLOCK]: DEFAULT_BLOCK_LIKE,
};
