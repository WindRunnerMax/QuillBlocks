import type { AttributeMap } from "../attributes/interface";

export interface Op {
  // Only one property out of {insert, delete, retain} will be present
  insert?: string;
  delete?: number;
  retain?: number;

  attributes?: AttributeMap;
}

export const OP_TYPES = {
  INSERT: "insert",
  RETAIN: "retain",
  DELETE: "delete",
};
export const EOL = "\n";
export const EOLOp: InsertOp = { insert: EOL };

export type Ops = Op[];
export type DeleteOp = { delete: number };
export type RetainOp = { retain: number; attributes?: AttributeMap };
export type InsertOp = { insert: string; attributes?: AttributeMap };
