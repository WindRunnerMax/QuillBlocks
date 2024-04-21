import type { AttributeMap } from "../attributes/interface";
import type { Ops } from "../delta/interface";

export interface BlockLike {
  id: string;
  ops: Ops;
  type: string;
  children: string[];
  attributes: AttributeMap;
}
export type BlockSetLike = Record<string, BlockLike>;
export type BlockOption = Partial<BlockLike>;
export type BlockSetOption = Record<string, BlockOption>;
