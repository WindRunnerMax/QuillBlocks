import { Delta } from "block-kit-delta";

import { Editor } from "../../src/editor";
import { normalizeComposeOps } from "../../src/state/utils/normalize";

describe("state utils", () => {
  it("normalize compose ops", () => {
    const editor = new Editor({
      schema: {
        block: { void: true, block: true },
      },
    });
    const delta = new Delta()
      .insert("123\n456\n")
      .insert(" ", { block: "true" })
      .insert("789")
      .insert(" ", { block: "true" });
    const nextOps = normalizeComposeOps(editor, delta.ops);
    expect(nextOps).toEqual([
      { insert: "123" },
      { insert: "\n" },
      { insert: "456" },
      { insert: "\n" },
      { insert: " ", attributes: { block: "true" } },
      { insert: "\n" },
      { insert: "789" },
      { insert: " ", attributes: { block: "true" } },
      { insert: "\n" },
    ]);
  });
});
