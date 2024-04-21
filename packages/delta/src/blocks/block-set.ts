import { isString } from "blocks-kit-utils";

import { Block } from "./block";
import type { BlockSetOption } from "./interface";

export class BlockSet {
  private _blocks: Record<string, Block>;

  constructor(deltas: BlockSetOption = {}) {
    this._blocks = Object.keys(deltas).reduce(
      (acc, blockId) => ({ ...acc, [blockId]: new Block(deltas[blockId]) }),
      {} as Record<string, Block>
    );
  }

  get blocks() {
    return this._blocks;
  }

  get(zoneId: string): Block | null {
    return this._blocks[zoneId] || null;
  }

  delete(zoneId: string): this {
    delete this._blocks[zoneId];
    return this;
  }

  add(params: Block): this;
  add(params: string, block: Block): this;
  add(params: Block | string, block?: Block): this {
    if (isString(params)) {
      const delta = block;
      if (!delta) {
        console.error("DeltaBlock is not defined:", params);
        return this;
      }
      if (delta.id !== params) {
        console.error("BlockId is not equal:", params, delta.id);
        return this;
      }
      this._blocks[params] = delta;
    } else {
      this._blocks[params.id] = params;
    }
    return this;
  }

  replace(zoneId: string, block: Block): this {
    return this.delete(zoneId).add(block.id, block);
  }

  forEach(cb: (zoneId: string, block: Block) => void) {
    for (const [zoneId, deltaBlock] of Object.entries(this._blocks)) {
      cb(zoneId, deltaBlock);
    }
  }

  clone(): BlockSet {
    const newDeltaSet = new BlockSet();
    this.forEach((zoneId, delta) => {
      newDeltaSet.replace(zoneId, delta.clone());
    });
    return newDeltaSet;
  }
}
