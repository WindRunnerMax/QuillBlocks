import { getFirstUnicodeLen, getLastUnicodeLen } from "../../src/collect/utils/string";

describe("collect unicode", () => {
  it("forward emoji length", () => {
    expect(getFirstUnicodeLen("")).toEqual(0);
    expect(getFirstUnicodeLen("1")).toEqual(1);
    expect(getFirstUnicodeLen("12")).toEqual(1);
    expect(getFirstUnicodeLen("1🧑‍🎨")).toEqual(1);
    expect(getFirstUnicodeLen("🧑11")).toEqual(2);
    expect(getFirstUnicodeLen("🧑‍🎨11")).toEqual(5);
    expect(getFirstUnicodeLen("👨‍👨‍👦‍👦11")).toEqual(11);
  });

  it("backward emoji length", () => {
    expect(getLastUnicodeLen("")).toEqual(0);
    expect(getLastUnicodeLen("1")).toEqual(1);
    expect(getLastUnicodeLen("12")).toEqual(1);
    expect(getLastUnicodeLen("🧑‍🎨1")).toEqual(1);
    expect(getLastUnicodeLen("11🧑")).toEqual(2);
    expect(getLastUnicodeLen("11🧑‍🎨")).toEqual(5);
    expect(getLastUnicodeLen("11👨‍👨‍👦‍👦")).toEqual(11);
  });
});
