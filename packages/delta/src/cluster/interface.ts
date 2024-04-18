import type { Ops } from "../delta/interface";

export type ZoneDeltaOption = {
  ops?: Ops;
  zoneId?: string;
  parentId?: string | null;
};
export type DeltaSetOption = Record<string, ZoneDeltaOption>;

export type ZoneDeltaLike = Required<ZoneDeltaOption>;
export type DeltaSetLike = Record<string, ZoneDeltaLike>;
export type DeltaLike = Omit<ZoneDeltaLike, "zoneId" | "parentId">;

export const DELTA_TYPE = {
  Z: "Z", // Zone
  C: "C", // Col
  R: "R", // Row
} as const;
