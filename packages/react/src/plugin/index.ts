import type { LeafContext, LineContext, WrapLeafContext, WrapLineContext } from "block-kit-core";
import { CorePlugin } from "block-kit-core";

export interface ReactWrapLineContext extends WrapLineContext {
  children?: React.ReactNode;
}

export interface ReactWrapLeafContext extends WrapLeafContext {
  children?: React.ReactNode;
}

export interface ReactLineContext extends LineContext {
  children?: React.ReactNode;
}

export interface ReactLeafContext extends LeafContext {
  children?: React.ReactNode;
}

export abstract class EditorPlugin extends CorePlugin {
  wrapLine?(context: ReactWrapLineContext): React.ReactNode;
  wrapLeaf?(context: ReactWrapLeafContext): React.ReactNode;
  renderLine?(context: ReactLineContext): React.ReactNode;
  renderLeaf?(context: ReactLeafContext): React.ReactNode;
}
