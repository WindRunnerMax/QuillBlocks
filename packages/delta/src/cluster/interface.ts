import type { Ops } from "../delta/interface";

export type BlockDeltaOption = {
  ops?: Ops;
  blockId?: string;
  blockType?: string;
};
export type DeltaSetOption = Record<string, BlockDeltaOption>;

export type BlockDeltaLike = Required<BlockDeltaOption>;
export type DeltaSetLike = Record<string, BlockDeltaLike>;
export type DeltaLike = Omit<BlockDeltaLike, "zoneId" | "parentId">;

export const BLOCK_TYPE = {
  C: "C", // Col
  R: "R", // Row
  Z: "Z", // Zone
} as const;
