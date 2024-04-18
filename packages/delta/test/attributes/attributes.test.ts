import { composeAttributes } from "../../src/attributes/compose";
import { diffAttributes } from "../../src/attributes/diff";
import { invertAttributes } from "../../src/attributes/invert";
import { transformAttributes } from "../../src/attributes/transform";

describe("AttributeMap", () => {
  describe("compose()", () => {
    const attributes = { bold: "true", color: "red" };

    it("left is undefined", () => {
      expect(composeAttributes(undefined, attributes)).toEqual(attributes);
    });

    it("right is undefined", () => {
      expect(composeAttributes(attributes, undefined)).toEqual(attributes);
    });

    it("both are undefined", () => {
      expect(composeAttributes(undefined, undefined)).toBe(undefined);
    });

    it("missing", () => {
      expect(composeAttributes(attributes, { italic: "true" })).toEqual({
        bold: "true",
        italic: "true",
        color: "red",
      });
    });

    it("overwrite", () => {
      expect(composeAttributes(attributes, { bold: "false", color: "blue" })).toEqual({
        bold: "false",
        color: "blue",
      });
    });

    it("remove", () => {
      expect(composeAttributes(attributes, { bold: "" })).toEqual({
        color: "red",
      });
    });

    it("remove to none", () => {
      expect(composeAttributes(attributes, { bold: "", color: "" })).toEqual(undefined);
    });

    it("remove missing", () => {
      expect(composeAttributes(attributes, { italic: "" })).toEqual(attributes);
    });
  });

  describe("diff()", () => {
    const format = { bold: "true", color: "red" };

    it("left is undefined", () => {
      expect(diffAttributes(undefined, format)).toEqual(format);
    });

    it("right is undefined", () => {
      const expected = { bold: "", color: "" };
      expect(diffAttributes(format, undefined)).toEqual(expected);
    });

    it("same format", () => {
      expect(diffAttributes(format, format)).toEqual(undefined);
    });

    it("add format", () => {
      const added = { bold: "true", italic: "true", color: "red" };
      const expected = { italic: "true" };
      expect(diffAttributes(format, added)).toEqual(expected);
    });

    it("remove format", () => {
      const removed = { bold: "true" };
      const expected = { color: "" };
      expect(diffAttributes(format, removed)).toEqual(expected);
    });

    it("overwrite format", () => {
      const overwritten = { bold: "true", color: "blue" };
      const expected = { color: "blue" };
      expect(diffAttributes(format, overwritten)).toEqual(expected);
    });
  });

  describe("invert()", () => {
    it("attributes is undefined", () => {
      const base = { bold: "true" };
      expect(invertAttributes(undefined, base)).toEqual({});
    });

    it("base is undefined", () => {
      const attributes = { bold: "true" };
      const expected = { bold: "" };
      expect(invertAttributes(attributes, undefined)).toEqual(expected);
    });

    it("both undefined", () => {
      expect(invertAttributes()).toEqual({});
    });

    it("merge", () => {
      const attributes = { bold: "true" };
      const base = { italic: "true" };
      const expected = { bold: "" };
      expect(invertAttributes(attributes, base)).toEqual(expected);
    });

    it('""', () => {
      const attributes = { bold: "" };
      const base = { bold: "true" };
      const expected = { bold: "true" };
      expect(invertAttributes(attributes, base)).toEqual(expected);
    });

    it("replace", () => {
      const attributes = { color: "red" };
      const base = { color: "blue" };
      const expected = base;
      expect(invertAttributes(attributes, base)).toEqual(expected);
    });

    it("noop", () => {
      const attributes = { color: "red" };
      const base = { color: "red" };
      const expected = {};
      expect(invertAttributes(attributes, base)).toEqual(expected);
    });

    it("combined", () => {
      const attributes = {
        bold: "true",
        italic: "",
        color: "red",
        size: "12px",
      };
      const base = { font: "serif", italic: "true", color: "blue", size: "12px" };
      const expected = { bold: "", italic: "true", color: "blue" };
      expect(invertAttributes(attributes, base)).toEqual(expected);
    });
  });

  describe("transform()", () => {
    const left = { bold: "true", color: "red", font: "" };
    const right = { color: "blue", font: "serif", italic: "true" };

    it("left is undefined", () => {
      expect(transformAttributes(undefined, left, false)).toEqual(left);
    });

    it("right is undefined", () => {
      expect(transformAttributes(left, undefined, false)).toEqual(undefined);
    });

    it("both are undefined", () => {
      expect(transformAttributes(undefined, undefined, false)).toEqual(undefined);
    });

    it("with priority", () => {
      expect(transformAttributes(left, right, true)).toEqual({
        italic: "true",
      });
    });

    it("without priority", () => {
      expect(transformAttributes(left, right, false)).toEqual(right);
    });
  });
});
