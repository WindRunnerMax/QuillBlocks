import type { Ops } from "../delta/interface";

export const BLOCK_TYPE = {
  C: "C", // Col
  R: "R", // Row
  Z: "Z", // Block
} as const;

export type BlockDeltaOption = {
  ops?: Ops;
  blockId?: string;
  blockType?: string;
};

export type BlockSetOption = Record<string, BlockDeltaOption>;
export type BlockDeltaLike = Required<BlockDeltaOption>;
export type BlockSetLike = Record<string, BlockDeltaLike>;
export type DeltaLike = Omit<BlockDeltaLike, "blockId" | "blockType">;
