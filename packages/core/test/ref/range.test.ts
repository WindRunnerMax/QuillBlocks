import { Delta } from "block-kit-delta";

import { Editor } from "../../src/editor";
import { RawRange } from "../../src/selection/modules/raw-range";

describe("ref range", () => {
  const editor = new Editor();

  it("base", () => {
    const range = RawRange.fromEdge(3, 6);
    const ref = editor.ref.pack(range);
    const delta = new Delta().retain(5).insert("1");
    editor.state.apply(delta);
    const newRange = ref.unpack();
    expect(newRange).toEqual({ start: 3, len: 4 });
    expect(ref.unpack()).toBeNull();
    // @ts-expect-error protected property
    expect(editor.ref.rangeRefs.size).toBe(0);
  });

  it("start", () => {
    const range = RawRange.fromEdge(3, 6);
    const ref = editor.ref.pack(range);
    const delta = new Delta().retain(3).insert("1");
    editor.state.apply(delta);
    const newRange = ref.unpack();
    expect(newRange).toEqual({ start: 4, len: 3 });
  });

  it("end", () => {
    const range = RawRange.fromEdge(3, 6);
    const ref = editor.ref.pack(range);
    const delta = new Delta().retain(6).insert("1");
    editor.state.apply(delta);
    const newRange = ref.unpack();
    expect(newRange).toEqual({ start: 3, len: 4 });
  });
});
