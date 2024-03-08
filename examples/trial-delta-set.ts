import Delta from "../packages/core/node_modules/quill-delta/dist/Delta";
import type Op from "../packages/core/node_modules/quill-delta/dist/Op";
import { getUniqueId } from "../packages/utils/node_modules/laser-utils/dist/lib/uuid";

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

// 常量
const ROOT_ZONE = "ROOT";
const CODE_BLOCK_KEY = "code-block";
// 构造`Delta`实例
const delta = new Delta(ops);
// 将`Delta`转换为`Line`的数据表达
type Line = {
  attrs: Record<string, boolean | string | number>;
  ops: Op[];
};
const group: Line[] = [];
delta.eachLine((line, attributes) => {
  group.push({ attrs: attributes || {}, ops: line.ops });
});
// 用于对齐`Word`的数据表达
// 同时为了方便处理嵌套关系 将数据结构拍平
class DeltaSet {
  private deltas: Record<string, Line[]> = {};
  push(id: string, line: Line) {
    if (!this.deltas[id]) this.deltas[id] = [];
    this.deltas[id].push(line);
  }
}
const deltaSet = new DeltaSet();
// 标记当前正在处理的的`ZoneId`
// 实际情况下可能会存在多层嵌套 此时需要用`stack`来处理
let currentZone: string = ROOT_ZONE;
// 标记当前处理的类型 如果存在多种类型时会用得到
let currentMode: "NORMAL" | "CODEBLOCK" = "NORMAL";
// 用于判断当前`Line`是否为`CodeBlock`
const isCodeBlockLine = (line: Line) => line && !!line.attrs[CODE_BLOCK_KEY];
// 遍历`Line`的数据表达 构造`DeltaSet`
for (let i = 0; i < group.length; ++i) {
  const prev = group[i - 1];
  const line = group[i];
  const next = group[i + 1];
  // 代码块结构的起始
  if (!isCodeBlockLine(prev) && isCodeBlockLine(line)) {
    const newZoneId = getUniqueId();
    // 存在嵌套关系 构造新的索引
    const codeBlockLine: Line = {
      attrs: {},
      ops: [{ insert: " ", attributes: { [CODE_BLOCK_KEY]: "true", zoneId: newZoneId } }],
    };
    // 需要在当前`Zone`加入指向新`Zone`的索引`Line`
    deltaSet.push(currentZone, codeBlockLine);
    currentZone = newZoneId;
    currentMode = "CODEBLOCK";
  }
  // 将`Line`置入当前要处理的`Zone`
  deltaSet.push(currentZone, group[i]);
  // 代码块结构的结束
  if (currentMode === "CODEBLOCK" && isCodeBlockLine(line) && !isCodeBlockLine(next)) {
    currentZone = ROOT_ZONE;
    currentMode = "NORMAL";
  }
}
console.log(JSON.stringify(deltaSet));
