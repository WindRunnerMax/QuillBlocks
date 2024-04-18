import { getOpLength } from "../../src/delta/op";

describe("Op", () => {
  describe("length()", () => {
    it("delete", () => {
      expect(getOpLength({ delete: 5 })).toEqual(5);
    });

    it("retain", () => {
      expect(getOpLength({ retain: 2 })).toEqual(2);
    });

    it("insert text", () => {
      expect(getOpLength({ insert: "text" })).toEqual(4);
    });
  });
});
