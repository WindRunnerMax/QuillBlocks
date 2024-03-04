const Delta = require("../packages/core/node_modules/quill-delta/dist/Delta");
const ops = [
  { insert: "标题" },
  {
    insert: "\n",
    attributes: { header: 1 },
  },
  { insert: "首行" },
  {
    insert: "加粗",
    attributes: { bold: true },
  },
  { insert: "、" },
  {
    insert: "斜体",
    attributes: { italic: true },
  },
  { insert: "、" },
  {
    insert: "下划线",
    attributes: { underline: true },
  },
  { insert: "、" },
  {
    insert: "组合",
    attributes: { underline: true, italic: true, bold: true },
  },
  { insert: "\n代码块" },
  {
    insert: "\n",
    attributes: { header: 2 },
  },
  { insert: 'const a = "Hello World";' },
  {
    insert: "\n",
    attributes: { "code-block": "plain" },
  },
  { insert: "console.log(a);" },
  {
    insert: "\n",
    attributes: { "code-block": "plain" },
  },
];

const delta = new Delta(ops);
console.log("delta :>> ", delta);
