import { isString } from "blocks-kit-utils";

import type { DeltaSetOption } from "./interface";
import { ZoneDelta } from "./zone-delta";

export class DeltaSet {
  private _deltas: Record<string, ZoneDelta>;

  constructor(deltas: DeltaSetOption = {}) {
    this._deltas = Object.keys(deltas).reduce(
      (acc, zoneId) => ({ ...acc, [zoneId]: new ZoneDelta(deltas[zoneId]) }),
      {} as Record<string, ZoneDelta>
    );
  }

  get deltas() {
    return this._deltas;
  }

  get(zoneId: string): ZoneDelta | null {
    return this._deltas[zoneId] || null;
  }

  delete(zoneId: string): this {
    delete this._deltas[zoneId];
    return this;
  }

  add(params: ZoneDelta): this;
  add(params: string, zoneDelta: ZoneDelta): this;
  add(params: ZoneDelta | string, zoneDelta?: ZoneDelta): this {
    if (isString(params)) {
      const delta = zoneDelta;
      if (!delta) {
        console.error("ZoneDelta is not defined:", params);
        return this;
      }
      if (delta.zoneId !== params) {
        console.error("ZoneId is not equal:", params, delta.zoneId);
        return this;
      }
      this._deltas[params] = delta;
    } else {
      this._deltas[params.zoneId] = params;
    }
    return this;
  }

  replace(zoneId: string, zoneDelta: ZoneDelta): this {
    return this.delete(zoneId).add(zoneDelta.zoneId, zoneDelta);
  }

  forEach(cb: (zoneId: string, zoneDelta: ZoneDelta) => void) {
    for (const [zoneId, zoneDelta] of Object.entries(this._deltas)) {
      cb(zoneId, zoneDelta);
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
