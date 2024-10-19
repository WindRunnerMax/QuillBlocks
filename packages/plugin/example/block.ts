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
  ],
});
