import { getUniqueId, isNumber } from "blocks-kit-utils";

import { Delta } from "../delta/delta";
import { cloneOps } from "../utils/clone";
import type { ZoneDeltaOption } from "./interface";
import { DELTA_TYPE } from "./interface";

export class ZoneDelta extends Delta {
  public zoneId: string;
  public parentId: string | null;
  public readonly type = DELTA_TYPE.Z;

  constructor(options?: ZoneDeltaOption) {
    const { ops = [], zoneId = getUniqueId(), parentId = null } = options || {};
    super(ops);
    this.zoneId = zoneId;
    this.parentId = parentId;
  }

  slice(start = 0, end = Infinity): ZoneDelta {
    const delta = super.slice(start, end);
    return ZoneDelta.combine(this, delta);
  }

  compose(other: Delta): ZoneDelta {
    const delta = super.compose(other);
    return ZoneDelta.combine(this, delta);
  }

  concat(other: Delta): ZoneDelta {
    const delta = super.concat(other);
    return ZoneDelta.combine(this, delta);
  }

  invert(base: Delta): ZoneDelta {
    const delta = super.invert(base);
    return ZoneDelta.combine(this, delta);
  }

  transform(index: number, priority?: boolean): number;
  transform(other: Delta, priority?: boolean): Delta;
  transform(arg: number | Delta, priority?: boolean): typeof arg;
  transform(arg: number | Delta, priority = false): typeof arg {
    const rtn = super.transform(arg, priority);
    if (isNumber(rtn)) return rtn;
    else return ZoneDelta.combine(this, rtn);
  }

  static combine(base: ZoneDelta, delta: Delta) {
    const { ops } = delta;
    const { zoneId, parentId } = base;
    return new ZoneDelta({ ops, zoneId, parentId });
  }

  clone(): ZoneDelta {
    return new ZoneDelta({
      zoneId: this.zoneId,
      parentId: this.parentId,
      ops: cloneOps(this.ops),
    });
  }
}
