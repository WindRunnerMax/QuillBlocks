import type { AttributeMap } from "../attributes/interface";

export const OP_TYPES = {
  INSERT: "insert",
  RETAIN: "retain",
  DELETE: "delete",
};

export interface Op {
  // only one property out of { insert, delete, retain } will be present
  insert?: string;
  delete?: number;
  retain?: number;
  attributes?: AttributeMap;
}

export type Ops = Op[];
export type DeleteOp = { delete: number };
export type RetainOp = { retain: number; attributes?: AttributeMap };
export type InsertOp = { insert: string; attributes?: AttributeMap };
