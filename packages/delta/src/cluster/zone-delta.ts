import { getUniqueId, isNumber } from "blocks-kit-utils";

import { Delta } from "../delta/delta";
import { cloneOps } from "../utils/clone";
import type { BlockDeltaOption } from "./interface";
import { BLOCK_TYPE } from "./interface";

export class BlockDelta extends Delta {
  public readonly blockId: string;
  public readonly blockType: string;

  constructor(options?: BlockDeltaOption) {
    const { ops = [], blockId = getUniqueId() } = options || {};
    super(ops);
    this.blockId = blockId;
    this.blockType = BLOCK_TYPE.Z;
  }

  slice(start = 0, end = Infinity): BlockDelta {
    const delta = super.slice(start, end);
    return BlockDelta.combine(this, delta);
  }

  compose(other: Delta): BlockDelta {
    const delta = super.compose(other);
    return BlockDelta.combine(this, delta);
  }

  concat(other: Delta): BlockDelta {
    const delta = super.concat(other);
    return BlockDelta.combine(this, delta);
  }

  invert(base: Delta): BlockDelta {
    const delta = super.invert(base);
    return BlockDelta.combine(this, delta);
  }

  transform(index: number, priority?: boolean): number;
  transform(other: Delta, priority?: boolean): Delta;
  transform(arg: number | Delta, priority?: boolean): typeof arg;
  transform(arg: number | Delta, priority = false): typeof arg {
    const rtn = super.transform(arg, priority);
    if (isNumber(rtn)) return rtn;
    else return BlockDelta.combine(this, rtn);
  }

  static combine(base: BlockDelta, delta: Delta) {
    const { ops } = delta;
    const { blockId, blockType } = base;
    return new BlockDelta({ ops, blockId, blockType });
  }

  clone(): BlockDelta {
    return new BlockDelta({
      blockId: this.blockId,
      blockType: this.blockType,
      ops: cloneOps(this.ops),
    });
  }
}
