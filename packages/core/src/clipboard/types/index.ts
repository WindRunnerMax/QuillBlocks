import type { Delta } from "block-kit-delta";
import { Clipboard } from "block-kit-utils";

import { NODE_KEY } from "../../model/types";

export const LINE_TAG = NODE_KEY;
export const TEXT_HTML = Clipboard.TEXT_HTML;
export const TEXT_PLAIN = Clipboard.TEXT_PLAIN;
export const TEXT_DOC = "application/x-rich-text";

export type CopyContext = {
  delta: Delta;
  html: Node;
};

export type PasteContext = {
  delta: Delta;
  html: Node;
  files?: File[];
};

export type PasteNodesContext = {
  delta: Delta;
};
