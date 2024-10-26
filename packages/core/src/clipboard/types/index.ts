import type { Delta } from "block-kit-delta";

import type { Op } from "../../../../delta/dist";
import { NODE_KEY } from "../../model/types";

export const LINE_TAG = NODE_KEY;
export const TEXT_DOC = "application/x-rich-text";

export type SerializeContext = {
  op: Op;
  html: Node;
};

export type CopyContext = {
  delta: Delta;
  html: Node;
};

export type DeserializeContext = {
  delta: Delta;
  html: Node;
  files?: File[];
};

export type PasteContext = {
  delta: Delta;
};
