import type { AttributeMap } from "../attributes/interface";
import type { Ops } from "../delta/interface";

export interface Block {
  id: string;
  ops: Ops[];
  children: string[];
  attributes: AttributeMap;
}

export type BlockSet = Record<string, Block>;
