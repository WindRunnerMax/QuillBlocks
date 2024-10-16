import type { Op } from "block-kit-delta";
import { Delta } from "block-kit-delta";

import { ImmutableDelta } from "../../src/state/mutate/delta";

describe("immutable delta", () => {
  const text1 = { insert: "text" };
  const eol1 = { insert: "\n" };
  const text2 = { insert: "text2" };
  const eol2 = { insert: "\n" };
  const ops = [text1, eol1, text2, eol2];

  it("each line", () => {
    let i = 0;
    const delta = new ImmutableDelta([text1, eol1, text2, eol2]);
    const spy = jest.fn();
    spy.mockImplementation((delta, attrs, index) => {
      for (const op of delta.ops) {
        expect(op).toBe(ops[i]);
        i = i + 1;
      }
      return [delta, attrs, index];
    });
    delta.eachLine(spy);
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.mock.calls).toEqual([
      [new Delta([{ insert: "text" }, { insert: "\n" }]), {}, 0],
      [new Delta([{ insert: "text2" }, { insert: "\n" }]), {}, 1],
    ]);
  });

  it("push", () => {
    const delta = new ImmutableDelta([text1]);
    const text2: Op = { insert: "123" };
    delta.push(text2);
    const text3: Op = { insert: "456", attributes: { bold: "true" } };
    delta.push(text3);
    expect(delta.ops.length).toBe(2);
    expect(delta.ops[1]).toBe(text3);
  });

  it("push eol", () => {
    const delta = new ImmutableDelta([text1]);
    const eol1 = { insert: "\n" };
    delta.push(eol1);
    delta.push(text2);
    const eol2 = { insert: "\n" };
    delta.push(eol2);
    expect(delta.ops.length).toBe(4);
    expect(delta.ops[1]).toBe(eol1);
    expect(delta.ops[2]).toBe(text2);
    expect(delta.ops[3]).toBe(eol2);
  });

  it("compose retain", () => {
    const delta = new ImmutableDelta([text1, eol1, text2, eol2]);
    const changes = new Delta().retain(7);
    const composed = delta.compose(changes);
    expect(composed.ops.length).toBe(4);
    expect(composed.ops[0]).toBe(text1);
    expect(composed.ops[1]).toBe(eol1);
    // 这里是前置 retain 导致实际位置切割
    expect(composed.ops[2]).not.toBe(text2);
    expect(composed.ops[3]).toBe(eol2);
  });

  it("compose entity retain", () => {
    const delta = new ImmutableDelta([text1, eol1, text2, eol2]);
    const changes = new Delta().retain(4);
    const composed = delta.compose(changes);
    expect(composed.ops.length).toBe(4);
    expect(composed.ops[0]).toBe(text1);
    expect(composed.ops[1]).toBe(eol1);
    expect(composed.ops[2]).toBe(text2);
    expect(composed.ops[3]).toBe(eol2);
  });

  it("compose insert", () => {
    const delta = new ImmutableDelta([text1, eol1, text2, eol2]);
    const changes = new Delta().retain(7).insert("123\n456");
    const composed = delta.compose(changes);
    expect(composed.ops.length).toBe(6);
    expect(composed.ops[0]).toBe(text1);
    expect(composed.ops[1]).toBe(eol1);
    expect(composed.ops[2]).toEqual({ insert: "te123" });
    expect(composed.ops[3]).toEqual({ insert: "\n" });
    expect(composed.ops[4]).toEqual({ insert: "456xt2" });
    expect(composed.ops[5]).toBe(eol2);
  });

  it("compose delete", () => {
    const delta = new ImmutableDelta([text1, eol1, text2, eol2]);
    const changes = new Delta().retain(4).delete(2);
    const composed = delta.compose(changes);
    expect(composed.ops.length).toBe(2);
    expect(composed.ops[0]).toEqual({ insert: "textext2" });
    expect(composed.ops[1]).toBe(eol2);
  });
});
