import type { Delta } from "block-kit-delta";

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
