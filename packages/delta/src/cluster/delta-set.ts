import { isString } from "blocks-kit-utils";

import type { DeltaSetOption } from "./interface";
import { BlockDelta } from "./zone-delta";

export class DeltaSet {
  private _deltas: Record<string, BlockDelta>;

  constructor(deltas: DeltaSetOption = {}) {
    this._deltas = Object.keys(deltas).reduce(
      (acc, blockId) => ({ ...acc, [blockId]: new BlockDelta(deltas[blockId]) }),
      {} as Record<string, BlockDelta>
    );
  }

  get deltas() {
    return this._deltas;
  }

  get(zoneId: string): BlockDelta | null {
    return this._deltas[zoneId] || null;
  }

  delete(zoneId: string): this {
    delete this._deltas[zoneId];
    return this;
  }

  add(params: BlockDelta): this;
  add(params: string, BlockDelta: BlockDelta): this;
  add(params: BlockDelta | string, BlockDelta?: BlockDelta): this {
    if (isString(params)) {
      const delta = BlockDelta;
      if (!delta) {
        console.error("BlockDelta is not defined:", params);
        return this;
      }
      if (delta.blockId !== params) {
        console.error("BlockId is not equal:", params, delta.blockId);
        return this;
      }
      this._deltas[params] = delta;
    } else {
      this._deltas[params.blockId] = params;
    }
    return this;
  }

  replace(zoneId: string, BlockDelta: BlockDelta): this {
    return this.delete(zoneId).add(BlockDelta.blockId, BlockDelta);
  }

  forEach(cb: (zoneId: string, BlockDelta: BlockDelta) => void) {
    for (const [zoneId, BlockDelta] of Object.entries(this._deltas)) {
      cb(zoneId, BlockDelta);
    }
  }

  clone(): DeltaSet {
    const newDeltaSet = new DeltaSet();
    this.forEach((zoneId, delta) => {
      newDeltaSet.replace(zoneId, delta.clone());
    });
    return newDeltaSet;
  }
}
