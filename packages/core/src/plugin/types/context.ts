import type { AttributeMap } from "block-kit-delta";
import type { Op } from "block-kit-delta";
import type { P } from "block-kit-utils/dist/es/types";
import type { Properties } from "csstype";

import type { LeafState } from "../../state/modules/leaf-state";
import type { LineState } from "../../state/modules/line-state";

export type LineContext = {
  classList: string[];
  lineState: LineState;
  attributes?: AttributeMap;
  style: Properties<string | number>;
  children?: P.Any;
};

export type LeafContext = {
  op: Op;
  classList: string[];
  lineState: LineState;
  leafState: LeafState;
  attributes?: AttributeMap;
  style: Properties<string | number>;
  children?: P.Any;
};
