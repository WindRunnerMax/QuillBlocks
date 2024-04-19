import { getUniqueId, isNumber } from "blocks-kit-utils";

import { Delta } from "../delta/delta";
import { cloneOps } from "../utils/clone";
import type { DeltaBlockOption } from "./interface";
import { BLOCK_TYPE } from "./interface";

export class DeltaBlock extends Delta {
  public readonly blockId: string;
  public readonly blockType: string;

  constructor(options?: DeltaBlockOption) {
    const { ops = [], blockId = getUniqueId() } = options || {};
    super(ops);
    this.blockId = blockId;
    this.blockType = BLOCK_TYPE.Z;
  }

  slice(start = 0, end = Infinity): DeltaBlock {
    const delta = super.slice(start, end);
    return DeltaBlock.combine(this, delta);
  }

  compose(other: Delta): DeltaBlock {
    const delta = super.compose(other);
    return DeltaBlock.combine(this, delta);
  }

  concat(other: Delta): DeltaBlock {
    const delta = super.concat(other);
    return DeltaBlock.combine(this, delta);
  }

  invert(base: Delta): DeltaBlock {
    const delta = super.invert(base);
    return DeltaBlock.combine(this, delta);
  }

  transform(index: number, priority?: boolean): number;
  transform(other: Delta, priority?: boolean): Delta;
  transform(arg: number | Delta, priority?: boolean): typeof arg;
  transform(arg: number | Delta, priority = false): typeof arg {
    const rtn = super.transform(arg, priority);
    if (isNumber(rtn)) return rtn;
    else return DeltaBlock.combine(this, rtn);
  }

  static combine(base: DeltaBlock, delta: Delta) {
    const { ops } = delta;
    const { blockId, blockType } = base;
    return new DeltaBlock({ ops, blockId, blockType });
  }

  clone(): DeltaBlock {
    return new DeltaBlock({
      blockId: this.blockId,
      blockType: this.blockType,
      ops: cloneOps(this.ops),
    });
  }
}
