import { formatEOL, normalizeEOL } from "../../src/state/utils/normalize";

describe("normalize", () => {
  it("lf signal line", () => {
    expect(normalizeEOL([{ insert: "\n" }])).toEqual([{ insert: "\n" }]);
    expect(normalizeEOL([{ insert: "1" }])).toEqual([{ insert: "1" }]);
    expect(normalizeEOL([{ insert: "1\n" }])).toEqual([{ insert: "1" }, { insert: "\n" }]);
  });

  it("lf multi line", () => {
    const ops1 = [{ insert: "\n\n1" }];
    const res1 = normalizeEOL(ops1);
    expect(res1).toEqual([{ insert: "\n" }, { insert: "\n" }, { insert: "1" }]);
    const ops2 = [{ insert: "1\n2\n\n", attributes: { ex: "1" } }];
    const res2 = normalizeEOL(ops2);
    expect(res2).toEqual([
      { insert: "1", attributes: { ex: "1" } },
      { insert: "\n", attributes: { ex: "1" } },
      { insert: "2", attributes: { ex: "1" } },
      { insert: "\n", attributes: { ex: "1" } },
      { insert: "\n", attributes: { ex: "1" } },
    ]);
  });

  it("lf attributes prototype", () => {
    const ops1 = [{ insert: "\n" }];
    const res1 = normalizeEOL(ops1);
    const ops2 = [{ insert: "1\n2" }];
    const res2 = normalizeEOL(ops2);
    expect(Object.prototype.hasOwnProperty.call(res1[0], "attributes")).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(res2[1], "attributes")).toBe(false);
  });

  it("eol", () => {
    expect(formatEOL("\r")).toBe("\n");
    expect(formatEOL("\r\n")).toBe("\n");
  });
});
