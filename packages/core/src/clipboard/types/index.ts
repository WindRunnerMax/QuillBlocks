import type { Delta } from "block-kit-delta";

import type { Op } from "../../../../delta/dist";

export const TEXT_DOC = "application/x-block-kit";

/** Fragment(Delta) => HTML */
export type SerializeContext = {
  /** Op 基准 */
  op: Op;
  /** HTML 目标 */
  html: Node;
};

/** Context => Clipboard */
export type CopyContext = {
  /** Delta 基准 */
  delta: Delta;
  /** HTML 目标 */
  html: Node;
};

/** HTML => Fragment(Delta)  */
export type DeserializeContext = {
  /** Delta 目标 */
  delta: Delta;
  /** HTML 基准 */
  html: Node;
  /** FILE 基准 */
  files?: File[];
};

/** Clipboard => Context */
export type PasteContext = {
  /** Delta 基准 */
  delta: Delta;
};
