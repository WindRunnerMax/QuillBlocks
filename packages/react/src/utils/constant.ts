import type { BlockSetLike } from "blocks-kit-delta";
import { BLOCK_TYPE } from "blocks-kit-delta";

import { ROOT_BLOCK } from "../../../utils/src/constant";

export const DEFAULT_BLOCKS_DATA: BlockSetLike = {
  [ROOT_BLOCK]: {
    id: ROOT_BLOCK,
    ops: [],
    children: ["xxx", "yyy"],
    type: BLOCK_TYPE.Z,
    attributes: {},
  },
  xxx: {
    id: "xxx",
    ops: [],
    children: [],
    type: BLOCK_TYPE.Z,
    attributes: {},
  },
  yyy: {
    id: "yyy",
    ops: [],
    children: [],
    type: BLOCK_TYPE.Z,
    attributes: {},
  },
};
