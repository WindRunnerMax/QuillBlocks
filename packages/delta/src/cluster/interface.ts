import type { Ops } from "../delta/interface";

export type DeltaBlockOption = {
  ops?: Ops;
  blockId?: string;
  blockType?: string;
};
export type DeltaSetOption = Record<string, DeltaBlockOption>;

export type DeltaBlockLike = Required<DeltaBlockOption>;
export type DeltaSetLike = Record<string, DeltaBlockLike>;
export type DeltaLike = Omit<DeltaBlockLike, "blockId" | "blockType">;

export const BLOCK_TYPE = {
  C: "C", // Col
  R: "R", // Row
  Z: "Z", // Zone
} as const;
