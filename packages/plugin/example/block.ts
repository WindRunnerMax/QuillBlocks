import { Delta } from "block-kit-delta";

export const INIT = new Delta({
  ops: [
    { insert: "text" },
    { insert: "bold", attributes: { bold: "true" } },
    { insert: "\n" },
    { insert: "text2" },
    { insert: "bold2", attributes: { bold: "true" } },
    { insert: "\n" },
    { insert: " ", attributes: { image: "true" } },
    { insert: "\n" },
    { insert: "text3" },
    { insert: "\n" },
    { insert: " ", attributes: { mention: "true", name: "Czy" } },
    { insert: "\n" },
    { insert: "text4" },
    { insert: "text5", attributes: { "inline-code": "true" } },
    { insert: "\n" },
  ],
});
