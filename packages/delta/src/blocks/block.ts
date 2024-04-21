import { getUniqueId, isNumber } from "blocks-kit-utils";

import type { AttributeMap } from "../attributes/interface";
import { BLOCK_TYPE } from "../cluster/interface";
import { Delta } from "../delta/delta";
import { cloneOps } from "../utils/clone";
import type { BlockOption } from "./interface";

export class Block extends Delta {
  public readonly id: string;
  public readonly type: string;
  public readonly children: string[];
  public readonly attributes: AttributeMap;

  constructor(options?: BlockOption) {
    const {
      ops = [],
      children = [],
      attributes = {},
      id = getUniqueId(),
      type = BLOCK_TYPE.Z,
    } = options || {};
    super(ops);
    this.id = id;
    this.type = type;
    this.children = children;
    this.attributes = attributes;
  }

  slice(start = 0, end = Infinity): Block {
    const delta = super.slice(start, end);
    return Block.combine(this, delta);
  }

  compose(other: Delta): Block {
    const delta = super.compose(other);
    return Block.combine(this, delta);
  }

  concat(other: Delta): Block {
    const delta = super.concat(other);
    return Block.combine(this, delta);
  }

  invert(base: Delta): Block {
    const delta = super.invert(base);
    return Block.combine(this, delta);
  }

  transform(index: number, priority?: boolean): number;
  transform(other: Delta, priority?: boolean): Delta;
  transform(arg: number | Delta, priority?: boolean): typeof arg;
  transform(arg: number | Delta, priority = false): typeof arg {
    const rtn = super.transform(arg, priority);
    if (isNumber(rtn)) return rtn;
    else return Block.combine(this, rtn);
  }

  static combine(base: Block, delta: Delta) {
    const { ops } = delta;
    return new Block({ ...base, ops });
  }

  clone(): Block {
    return new Block({
      id: this.id,
      type: this.type,
      ops: cloneOps(this.ops),
      children: [...this.children],
      attributes: { ...this.attributes },
    });
  }
}
