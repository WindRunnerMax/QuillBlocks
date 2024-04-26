import type { BlockSet } from "blocks-kit-delta";

import type { Range } from "../../selection/modules/range";

export type ContentChangeEvent = {
  current: BlockSet;
  previous: BlockSet;
  source: string;
  changes: BlockSet;
  effect: string[];
};
export type SelectionChangeEvent = {
  previous: Range | null;
  current: Range | null;
};
export type PaintEvent = {
  zoneId: string;
};
