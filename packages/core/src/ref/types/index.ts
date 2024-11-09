import type { RawRange } from "../../selection/modules/raw-range";

export type RawRangeRef = {
  current: RawRange | null;
  unref: () => RawRange | null;
};
