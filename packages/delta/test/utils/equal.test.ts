import type { AttributeMap, Op } from "../../src";
import { isEqualAttributes, isEqualOp } from "../../src";

describe("equal", () => {
  it("diff key attrs", () => {
    const origin: AttributeMap = { a: "1" };
    const target: AttributeMap = { b: "1" };
    expect(isEqualAttributes(origin, target)).toEqual(false);
  });

  it("diff value attrs", () => {
    const origin: AttributeMap = { a: "1" };
    const target: AttributeMap = { a: "2" };
    expect(isEqualAttributes(origin, target)).toEqual(false);
  });

  it("undefined attrs", () => {
    expect(isEqualAttributes(undefined, undefined)).toEqual(true);
  });

  it("equal attrs", () => {
    const origin: AttributeMap = { a: "1" };
    const target: AttributeMap = { a: "1" };
    expect(isEqualAttributes(origin, target)).toEqual(true);
  });

  it("diff attrs op", () => {
    const origin: Op = { insert: "1", attributes: { a: "1" } };
    const target: Op = { insert: "1", attributes: { b: "1" } };
    expect(isEqualOp(origin, target)).toEqual(false);
  });

  it("diff value op", () => {
    const origin: Op = { insert: "1" };
    const target: Op = { insert: "2" };
    expect(isEqualOp(origin, target)).toEqual(false);
  });

  it("undefined attrs", () => {
    expect(isEqualOp(undefined, undefined)).toEqual(true);
  });

  it("equal attrs", () => {
    const origin: Op = { insert: "1" };
    const target: Op = { insert: "1" };
    expect(isEqualOp(origin, target)).toEqual(true);
  });
});
