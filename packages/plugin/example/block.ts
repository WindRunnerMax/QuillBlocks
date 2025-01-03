import { Delta } from "block-kit-delta";

export const INIT = new Delta({
  ops: [
    { insert: "Editor" },
    { insert: "\n", attributes: { heading: "h1" } },
    { insert: "从零实现富文本编辑器" },
    { insert: "\n" },
    { insert: "行内结构" },
    { insert: "\n", attributes: { heading: "h2" } },
    { insert: "支持 " },
    { insert: "加粗", attributes: { bold: "true" } },
    { insert: "、" },
    { insert: "行内代码", attributes: { "inline-code": "true" } },
    { insert: "等" },
    { insert: "\n" },
    { insert: "块级结构" },
    { insert: "\n", attributes: { heading: "h2" } },
    { insert: " ", attributes: { image: "true" } },
    { insert: "\n" },
    { insert: "嵌入结构" },
    { insert: "\n", attributes: { heading: "h2" } },
    { insert: " ", attributes: { mention: "true", name: "Czy" } },
    { insert: "\n" },
  ],
});
