import type { LeafContext, LineContext } from "./types";

export abstract class EditorPlugin {
  // Uniquely identifies
  static KEY: string;

  // Attributes match plugin
  abstract match(key: string): boolean;

  // Copy delta -> html
  serialize?(context: TODO): TODO;

  // Paste html -> delta
  deserialize?(context: TODO): TODO;

  // Render line
  renderLine?(context: LineContext): unknown;

  // Render element
  render?(context: LeafContext): unknown;

  // Destroy plugin
  destroy?(): void;
}
