import type { LeafContext, LineContext, WrapperContext } from "block-kit-core";
import { CorePlugin } from "block-kit-core";

export interface ReactLineContext extends LineContext {
  children?: React.ReactNode;
}

export interface ReactLeafContext extends LeafContext {
  children?: React.ReactNode;
}

export interface ReactWrapperContext extends WrapperContext {
  children?: React.ReactNode;
}

export abstract class EditorPlugin extends CorePlugin {
  renderWrapper?(context: ReactWrapperContext): React.ReactNode;
  renderLine?(context: ReactLineContext): React.ReactNode;
  render?(context: ReactLeafContext): React.ReactNode;
}
