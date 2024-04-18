import { Delta, deltaEndsWith } from "../../src";

describe("delta", () => {
  const delta = new Delta().insert("123").insert("\n").insert("456").insert("\n");

  it("delta ends with", () => {
    expect(deltaEndsWith(delta, "456\n")).toBe(true);
    expect(deltaEndsWith(delta, "\n456\n")).toBe(true);
    expect(deltaEndsWith(delta, "\n")).toBe(true);
    expect(deltaEndsWith(delta, "123\n456\n")).toBe(true);
  });

  it("delta not ends with", () => {
    expect(deltaEndsWith(delta, "6")).toBe(false);
    expect(deltaEndsWith(delta, "123")).toBe(false);
    expect(deltaEndsWith(delta, "1123\n456\n")).toBe(false);
  });
});
