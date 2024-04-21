import type { BlockSetLike } from "blocks-kit-delta";
import { BLOCK_TYPE } from "blocks-kit-delta";

import { ROOT_BLOCK } from "../../../utils/src/constant";

export const DEFAULT_BLOCKS_DATA: BlockSetLike = {
  [ROOT_BLOCK]: {
    id: ROOT_BLOCK,
    ops: [],
    children: ["LINE-1", "LINE-2"],
    type: BLOCK_TYPE.Z,
    attributes: {},
  },
  "LINE-1": {
    id: "LINE-1",
    ops: [],
    children: [],
    type: BLOCK_TYPE.Z,
    attributes: {},
  },
  "LINE-2": {
    id: "LINE-2",
    ops: [],
    children: [],
    type: BLOCK_TYPE.Z,
    attributes: {},
  },
};
