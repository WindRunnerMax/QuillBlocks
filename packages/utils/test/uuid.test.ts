import { getId } from "../src/index";

describe("id", () => {
  it("unique id length", () => {
    expect(getId()).toHaveLength(10);
    expect(getId(5)).toHaveLength(5);
    expect(getId(15)).toHaveLength(15);
  });
});
