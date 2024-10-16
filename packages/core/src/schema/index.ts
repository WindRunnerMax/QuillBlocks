import type { EditorSchema } from "./types";

export class Schema {
  /** Void */
  public readonly void: Set<string> = new Set<string>();
  /** Block */
  public readonly block: Set<string> = new Set<string>();
  /** Inline */
  public readonly inline: Set<string> = new Set<string>();
  /** Tail Mark */
  public readonly tailMark: Set<string> = new Set<string>();

  constructor(schema: EditorSchema) {
    for (const [key, value] of Object.entries(schema)) {
      if (value.void) {
        this.void.add(key);
        this.block.add(key);
      }
      if (value.block) {
        this.block.add(key);
      }
    }
  }
}
