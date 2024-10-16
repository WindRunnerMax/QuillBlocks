import { Delta } from "../../src/delta/delta";
import { MutateIterator } from "../../src/mutate/iterator";

describe("immutable iterator", () => {
  const insert1 = { insert: "Hello", attributes: { bold: "true" } };
  const retain1 = { retain: 3 };
  const insert2 = { insert: "2", attributes: { src: "link" } };
  const delete1 = { delete: 4 };
  const delta = new Delta([insert1, retain1, insert2, delete1]);

  it("next", () => {
    const iter = new MutateIterator(delta.ops);
    for (let i = 0; i < delta.ops.length; i += 1) {
      expect(iter.next()).toBe(delta.ops[i]);
    }
    expect(iter.next()).toEqual({ retain: Infinity });
  });

  it("next length", () => {
    const iter = new MutateIterator(delta.ops);
    expect(iter.next(2)).toEqual({
      insert: "He",
      attributes: { bold: "true" },
    });
    expect(iter.next(10)).toEqual({
      insert: "llo",
      attributes: { bold: "true" },
    });
    expect(iter.next(1)).toEqual({ retain: 1 });
    expect(iter.next(2)).toEqual({ retain: 2 });
    expect(iter.next(100)).toBe(insert2);
  });

  it("rest", () => {
    const iter = new MutateIterator(delta.ops);
    iter.next(2);
    const rest1 = iter.rest();
    expect(rest1[0]).toEqual({ insert: "llo", attributes: { bold: "true" } });
    expect(rest1[1]).toBe(retain1);
    expect(rest1[2]).toBe(insert2);
    expect(rest1[3]).toBe(delete1);
    iter.next(3);
    const rest2 = iter.rest();
    expect(rest2[0]).toBe(retain1);
    expect(rest2[1]).toBe(insert2);
    expect(rest2[2]).toBe(delete1);
    iter.next(3);
    iter.next(2);
    iter.next(4);
    expect(iter.rest()).toEqual([]);
  });
});
