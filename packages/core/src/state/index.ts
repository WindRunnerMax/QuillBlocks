import type { BlockSet } from "blocks-kit-delta";
import { ROOT_BLOCK } from "blocks-kit-utils";

import type { Editor } from "../editor";
import type { BlockState } from "./modules/block";

export class EditorState {
  private active = ROOT_BLOCK;
  private status: Record<string, boolean> = {};
  private blocks: Record<string, BlockState> = {};

  constructor(private editor: Editor, private blockSet: BlockSet) {}
}
