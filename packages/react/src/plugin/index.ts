import type { LeafContext, LineContext } from "block-kit-core";
import { CorePlugin } from "block-kit-core";

export interface ReactLineContext extends LineContext {
  children?: React.ReactNode;
}

export interface ReactLeafContext extends LeafContext {
  children?: React.ReactNode;
}

export abstract class EditorPlugin extends CorePlugin {
  wrapLine?(context: React.ReactNode): React.ReactNode;
  wrapLeaf?(context: React.ReactNode): React.ReactNode;
  renderLine?(context: ReactLineContext): React.ReactNode;
  renderLeaf?(context: ReactLeafContext): React.ReactNode;
}
