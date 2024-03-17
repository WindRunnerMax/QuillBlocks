import { isString } from "../packages/utils/node_modules/laser-utils";
import type { Line, Op } from "./delta-set";
import DeltaSet from "./delta-set";
const { CODE_BLOCK_KEY, ops, opsToDeltaSet, ROOT_ZONE } = DeltaSet;
const deltaSet = opsToDeltaSet(ops);

/** `MarkDown`转换调度 */
type Output = {
  prefix?: string;
  suffix?: string;
  last?: boolean;
};
type Tag = {
  isHTML?: boolean;
  isInZone?: boolean;
};
type LineOptions = {
  prev: Line | null;
  current: Line;
  next: Line | null;
  tag: Tag;
};
type LinePlugin = {
  key: string; // 插件重载
  priority?: number; // 插件优先级
  match: (line: Line) => boolean; // 匹配`Line`规则
  processor: (options: LineOptions) => Promise<Omit<Output, "last"> | null>; // 处理函数
};
type LeafOptions = {
  prev: Op | null;
  current: Op;
  next: Op | null;
  tag: Tag;
};
type LeafPlugin = {
  key: string; // 插件重载
  priority?: number; // 插件优先级
  match: (op: Op) => boolean; // 匹配`Op`规则
  processor: (options: LeafOptions) => Promise<Output | null>; // 处理函数
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
    // 不能影响外部传递的`Tag`
    const tag: Tag = { ...defaultZoneTag };
    // 先处理行内容 // 需要先处理行格式
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
        isString(currentOp.insert) && prefixOpGroup.push(currentOp.insert);
      }
      prefixLineGroup.push(prefixOpGroup.join("") + suffixOpGroup.join(""));
    }
    result.push(prefixLineGroup.join("") + suffixLineGroup.join(""));
  }
  return result.join(cut);
};

/** 注册插件 */
const HeadingPlugin: LinePlugin = {
  key: "HEADING",
  match: line => !!line.attrs.header,
  processor: async options => {
    if (options.tag.isHTML) {
      options.tag.isHTML = true;
      return {
        prefix: `<h${options.current.attrs.header}>`,
        suffix: `</h${options.current.attrs.header}>`,
      };
    } else {
      const repeat = Number(options.current.attrs.header);
      return { prefix: "#".repeat(repeat) + " " };
    }
  },
};
LINE_PLUGINS.push(HeadingPlugin);

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

const ImagePlugin: LeafPlugin = {
  key: "IMAGE",
  match: op => !!(op.insert && (op.insert as Record<string, unknown>).image),
  processor: async options => {
    const src = (options.current.insert as Record<string, string>).image;
    if (options.tag.isHTML || options.prev || options.next) {
      options.tag.isHTML = true;
      return { prefix: `<img src="${src}" />`, last: true };
    } else {
      // 在`Quill`默认实现中`Image`是行内元素 实际使用需要在行中适配
      return { prefix: `![Image](${src})`, last: true };
    }
  },
};
LEAF_PLUGINS.push(ImagePlugin);

const CodeBlockPlugin: LeafPlugin = {
  key: "CODEBLOCK",
  match: op => !!(op.attributes && op.attributes[CODE_BLOCK_KEY]),
  processor: async options => {
    const zoneId = options.current.attributes?.zoneId as string | undefined;
    const zone = zoneId && deltaSet.get(zoneId);
    if (!zone) return null;
    // 在`CodeBlock`中需要抹除所有格式信息
    const lines = zone.map(line => line.ops.map(op => op.insert).join(""));
    const code = lines.join("\n");
    if (options.tag.isHTML) {
      options.tag.isHTML = true;
      return {
        prefix: `<pre><code>${code}</code></pre>`,
        last: true,
      };
    } else {
      return { prefix: "```\n" + code, suffix: "\n```", last: true };
    }
  },
};
LEAF_PLUGINS.push(CodeBlockPlugin);

const main = async () => {
  const result = await parseZoneContent(ROOT_ZONE, {});
  console.log(result);
};
main();
