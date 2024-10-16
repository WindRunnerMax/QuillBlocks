import type { Properties } from "csstype";
import type { AttributeMap } from "block-kit-delta";

export type LineContext = {
  classList: string[];
};

export type LeafContext = {
  attributes?: AttributeMap;
  style: Properties<string | number>;
};
