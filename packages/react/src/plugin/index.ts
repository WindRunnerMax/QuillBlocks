import type {
  LeafContext as LaserLeafContext,
  LineContext as LaserLineContext,
} from "block-kit-core";
import { EditorPlugin as Plugin } from "block-kit-core";

export interface LineContext extends LaserLineContext {
  children?: React.ReactNode;
}

export interface LeafContext extends LaserLeafContext {
  children?: React.ReactNode;
}

export abstract class EditorPlugin extends Plugin {
  // Render line
  renderLine?(context: LineContext): React.ReactNode;

  // Render element
  render?(context: LeafContext): React.ReactNode;
}
