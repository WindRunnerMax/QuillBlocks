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

  get(zoneId: string) {
    return this.deltas[zoneId] || null;
  }

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
  const current = group[i];
  const next = group[i + 1];
  // 代码块结构的起始
  if (!isCodeBlockLine(prev) && isCodeBlockLine(current)) {
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
  if (currentMode === "CODEBLOCK" && isCodeBlockLine(current) && !isCodeBlockLine(next)) {
    currentZone = ROOT_ZONE;
    currentMode = "NORMAL";
  }
}

type Result = {
  prefix?: string;
  suffix?: string;
  last?: boolean;
};
type Tag = {
  isHTML?: boolean;
};
type LineOptions = {
  prev: Line | null;
  current: Line;
  next: Line | null;
  tag: Tag;
};
type LinePlugin = {
  key: string; // 插件重载
  match: (line: Line) => boolean; // 匹配`Line`规则
  processor: (options: LineOptions) => Promise<Result | null>; // 处理函数
};
type LeafOptions = {
  prev: Op | null;
  current: Op;
  next: Op | null;
  tag: Tag;
};
type LeafPlugin = {
  key: string; // 插件重载
  match: (op: Op) => boolean; // 匹配`Op`规则
  processor: (options: LeafOptions) => Promise<Result | null>; // 处理函数
};

const LINE_PLUGINS: LinePlugin[] = [];
const LEAF_PLUGINS: LeafPlugin[] = [];
const parseZoneContent = async (
  zoneId: string,
  options: { defaultZoneTag?: Tag; wrap?: string }
): Promise<string | null> => {
  const { defaultZoneTag = {}, wrap: cut = "\n\n" } = options;
  const lines = deltaSet.get(zoneId);
  if (!lines) return null;
  const result: string[] = [];
  for (let i = 0; i < lines.length; ++i) {
    const prevLine = lines[i - 1] || null;
    const currentLine = lines[i];
    const nextLine = lines[i + 1] || null;
    const prefixLineGroup: string[] = [];
    const suffixLineGroup: string[] = [];
    const tag: Tag = { ...defaultZoneTag }; // 不能影响外部传递的`Tag`
    // 先处理行内容
    for (const linePlugin of LINE_PLUGINS) {
      if (!linePlugin.match(currentLine)) continue;
      const result = await linePlugin.processor({
        prev: prevLine,
        current: currentLine,
        next: nextLine,
        tag: tag,
      });
      if (!result) continue;
      result.prefix && prefixLineGroup.push(result.prefix);
      result.suffix && suffixLineGroup.push(result.suffix);
    }
    const ops = currentLine.ops;
    // 处理节点内容
    for (let k = 0; k < ops.length; ++k) {
      const prevOp = ops[k - 1] || null;
      const currentOp = ops[k];
      const nextOp = ops[k + 1] || null;
      const prefixOpGroup: string[] = [];
      const suffixOpGroup: string[] = [];
      let last = false;
      for (const leafPlugin of LEAF_PLUGINS) {
        if (!leafPlugin.match(currentOp)) continue;
        const result = await leafPlugin.processor({
          prev: prevOp,
          current: currentOp,
          next: nextOp,
          tag: { ...tag },
        });
        if (!result) continue;
        result.prefix && prefixOpGroup.push(result.prefix);
        result.suffix && suffixOpGroup.unshift(result.suffix);
        if (result.last) {
          last = true;
          break;
        }
      }
      if (!last && currentOp.insert) {
        prefixOpGroup.push(currentOp.insert as string);
      }
      prefixLineGroup.push(prefixOpGroup.join("") + suffixOpGroup.join(""));
    }
    result.push(prefixLineGroup.join("") + suffixLineGroup.join(""));
  }
  return result.join(cut);
};

const BoldPlugin: LeafPlugin = {
  key: "BOLD",
  match: op => op.attributes && op.attributes.bold,
  processor: async options => {
    if (options.tag.isHTML) {
      options.tag.isHTML = true;
      return { prefix: "<strong>", suffix: "</strong>" };
    } else {
      return { prefix: "**", suffix: "**" };
    }
  },
};
LEAF_PLUGINS.push(BoldPlugin);

const ItalicPlugin: LeafPlugin = {
  key: "ITALIC",
  match: op => op.attributes && op.attributes.italic,
  processor: async options => {
    if (options.tag.isHTML) {
      options.tag.isHTML = true;
      return { prefix: "<em>", suffix: "</em>" };
    } else {
      return { prefix: "_", suffix: "_" };
    }
  },
};
LEAF_PLUGINS.push(ItalicPlugin);

const UnderlinePlugin: LeafPlugin = {
  key: "UNDERLINE",
  match: op => op.attributes && op.attributes.underline,
  processor: async options => {
    if (options.tag.isHTML) {
      options.tag.isHTML = true;
      return { prefix: "<ins>", suffix: "</ins>" };
    } else {
      return { prefix: "++", suffix: "++" };
    }
  },
};
LEAF_PLUGINS.push(UnderlinePlugin);

const main = async () => {
  // console.log(JSON.stringify(deltaSet));
  const result = await parseZoneContent(ROOT_ZONE, {});
  console.log(result);
};
main();
