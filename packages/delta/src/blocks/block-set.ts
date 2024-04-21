import { isString } from "blocks-kit-utils";

import { DeltaBlock } from "../cluster/delta-block";
import type { BlockSetOption } from "./interface";

export class BlockSet {
  private _blocks: Record<string, DeltaBlock>;

  constructor(deltas: BlockSetOption = {}) {
    this._blocks = Object.keys(deltas).reduce(
      (acc, blockId) => ({ ...acc, [blockId]: new DeltaBlock(deltas[blockId]) }),
      {} as Record<string, DeltaBlock>
    );
  }

  get blocks() {
    return this._blocks;
  }

  get(zoneId: string): DeltaBlock | null {
    return this._blocks[zoneId] || null;
  }

  delete(zoneId: string): this {
    delete this._blocks[zoneId];
    return this;
  }

  add(params: DeltaBlock): this;
  add(params: string, deltaBlock: DeltaBlock): this;
  add(params: DeltaBlock | string, deltaBlock?: DeltaBlock): this {
    if (isString(params)) {
      const delta = deltaBlock;
      if (!delta) {
        console.error("DeltaBlock is not defined:", params);
        return this;
      }
      if (delta.blockId !== params) {
        console.error("BlockId is not equal:", params, delta.blockId);
        return this;
      }
      this._blocks[params] = delta;
    } else {
      this._blocks[params.blockId] = params;
    }
    return this;
  }

  replace(zoneId: string, deltaBlock: DeltaBlock): this {
    return this.delete(zoneId).add(deltaBlock.blockId, deltaBlock);
  }

  forEach(cb: (zoneId: string, deltaBlock: DeltaBlock) => void) {
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
