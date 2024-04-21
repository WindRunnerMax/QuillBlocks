import { isString } from "blocks-kit-utils";

import { DeltaBlock } from "./delta-block";
import type { DeltaSetOption } from "./interface";

export class DeltaSet {
  private _deltas: Record<string, DeltaBlock>;

  constructor(deltas: DeltaSetOption = {}) {
    this._deltas = Object.keys(deltas).reduce(
      (acc, blockId) => ({ ...acc, [blockId]: new DeltaBlock(deltas[blockId]) }),
      {} as Record<string, DeltaBlock>
    );
  }

  get deltas() {
    return this._deltas;
  }

  get(zoneId: string): DeltaBlock | null {
    return this._deltas[zoneId] || null;
  }

  delete(zoneId: string): this {
    delete this._deltas[zoneId];
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
      this._deltas[params] = delta;
    } else {
      this._deltas[params.blockId] = params;
    }
    return this;
  }

  replace(zoneId: string, deltaBlock: DeltaBlock): this {
    return this.delete(zoneId).add(deltaBlock.blockId, deltaBlock);
  }

  forEach(cb: (zoneId: string, deltaBlock: DeltaBlock) => void) {
    for (const [zoneId, deltaBlock] of Object.entries(this._deltas)) {
      cb(zoneId, deltaBlock);
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
