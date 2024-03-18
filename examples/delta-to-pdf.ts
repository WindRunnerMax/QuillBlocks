// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfMake = require("../packages/utils/node_modules/pdfmake");
import fs from "fs";

import type PDF from "../packages/utils/node_modules/@types/pdfmake";
import type {
  Content,
  ContentImage,
  ContentTable,
  ContentText,
  Style,
  StyleDictionary,
  TableCell,
  TDocumentDefinitions,
} from "../packages/utils/node_modules/@types/pdfmake/interfaces";
import { isString } from "../packages/utils/node_modules/laser-utils";
import type { Line, Op } from "./delta-set";
import DeltaSet from "./delta-set";
const PdfPrinter = pdfMake as typeof PDF;

// ! 注意: 需要指定字体 可以考虑思源宋体 + 江城斜宋体
// https://github.com/RollDevil/SourceHanSerifSC
const FONT_PATH = "/Users/czy/Library/Fonts/";
const FONTS = {
  JetBrainsMono: {
    normal: FONT_PATH + "JetBrainsMono-Regular.ttf",
    bold: FONT_PATH + "JetBrainsMono-Bold.ttf",
    italics: FONT_PATH + "JetBrainsMono-Italic.ttf",
    bolditalics: FONT_PATH + "JetBrainsMono-BoldItalic.ttf",
  },
};

const ops = [
  { insert: "Heading" },
  {
    insert: "\n",
    attributes: { header: 1 },
  },
  { insert: "First Line " },
  {
    insert: "Bold",
    attributes: { bold: true },
  },
  { insert: ", " },
  {
    insert: "Italic",
    attributes: { italic: true },
  },
  { insert: ", " },
  {
    insert: "Underline",
    attributes: { underline: true },
  },
  { insert: ", " },
  {
    insert: "Compose",
    attributes: { underline: true, italic: true, bold: true },
  },
  { insert: "." },
  { insert: "\nCodeBlock" },
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
  { insert: "Image" },
  {
    insert: "\n",
    attributes: { header: 2 },
  },
  {
    insert: {
      image:
        "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AKp//2Q==",
    },
  },
  { insert: "\n" },
  { insert: "\n" },
];

const { CODE_BLOCK_KEY, opsToDeltaSet, ROOT_ZONE } = DeltaSet;
const deltaSet = opsToDeltaSet(ops);

/** 基准全局配置 */
const FORMAT_TYPE = {
  H1: "H1",
  H2: "H2",
};
const PRESET_FORMAT: StyleDictionary = {
  [FORMAT_TYPE.H1]: {
    fontSize: 22,
    bold: true,
  },
  [FORMAT_TYPE.H2]: {
    fontSize: 18,
    bold: true,
  },
};
const DEFAULT_FORMAT: Style = {
  font: "JetBrainsMono",
  fontSize: 14,
};

/** `PDF`转换调度 */
type LineBlock = Content;
type LeafBlock = ContentText | ContentTable | ContentImage;
type Tag = {
  format?: string;
  fontSize?: number;
  isInZone?: boolean;
  isInCodeBlock?: boolean;
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
  processor: (options: LeafOptions) => Promise<LeafBlock | null>; // 处理函数
};
type LineOptions = {
  prev: Line | null;
  current: Line;
  next: Line | null;
  tag: Tag;
  leaves: LeafBlock[];
};
type LinePlugin = {
  key: string; // 插件重载
  priority?: number; // 插件优先级
  match: (line: Line) => boolean; // 匹配`Line`规则
  processor: (options: LineOptions) => Promise<LineBlock | null>; // 处理函数
};

const LEAF_PLUGINS: LeafPlugin[] = [];
const LINE_PLUGINS: LinePlugin[] = [];

const parseZoneContent = async (
  zoneId: string,
  options: { defaultZoneTag?: Tag }
): Promise<Content[] | null> => {
  const { defaultZoneTag = {} } = options;
  const lines = deltaSet.get(zoneId);
  if (!lines) return null;
  const target: Content[] = [];
  for (let i = 0; i < lines.length; ++i) {
    const prevLine = lines[i - 1] || null;
    const currentLine = lines[i];
    const nextLine = lines[i + 1] || null;
    // 不能影响外部传递的`Tag`
    const tag: Tag = { ...defaultZoneTag };
    // 处理节点内容
    const ops = currentLine.ops;
    const leaves: LeafBlock[] = [];
    for (let k = 0; k < ops.length; ++k) {
      const prevOp = ops[k - 1] || null;
      const currentOp = ops[k];
      const nextOp = ops[k + 1] || null;
      const hit = LEAF_PLUGINS.find(leafPlugin => leafPlugin.match(currentOp));
      if (hit) {
        const result = await hit.processor({
          prev: prevOp,
          current: currentOp,
          next: nextOp,
          tag: tag,
        });
        result && leaves.push(result);
      }
    }
    // 处理行内容
    const hit = LINE_PLUGINS.find(linePlugin => linePlugin.match(currentLine));
    if (hit) {
      const result = await hit.processor({
        prev: prevLine,
        current: currentLine,
        next: nextLine,
        tag: tag,
        leaves: leaves,
      });
      result && target.push(result);
    }
  }
  return target;
};

const makeZoneBlock = async (
  config: {
    fill?: string;
    width?: number | string;
    children?: LineBlock[];
  } = {}
) => {
  const { width = "*", children = [], fill } = config;
  const cell: TableCell = { stack: children, fillColor: fill };
  return {
    table: { headerRows: 0, widths: [width], body: [[cell]] },
  };
};

const composeParagraph = (leaves: LeafBlock[]): LeafBlock => {
  if (leaves.length === 0) {
    // 空行需要兜底
    return { text: "\n" };
  } else if (leaves.length === 1 && !leaves[0].text) {
    // 单个`Zone`不需要包裹 通常是独立的块元素
    return leaves[0];
  } else {
    const isContainBlock = leaves.some(leaf => !leaf.text);
    if (isContainBlock) {
      // 需要包裹组合嵌套`BlockTable` // 实际还需要计算宽度避免越界
      return { layout: "noBorders", table: { headerRows: 0, body: [leaves] } };
    } else {
      return { text: leaves };
    }
  }
};

/** 注册插件 */
const ImagePlugin: LeafPlugin = {
  key: "IMAGE",
  match: (op: Op) => !!(op.insert && (op.insert as Record<string, unknown>).image),
  processor: async (options: LeafOptions) => {
    const { current } = options;
    const src = (current.insert as Record<string, unknown>)?.image as string;
    if (!src) return null;
    return { image: src };
  },
};
LEAF_PLUGINS.push(ImagePlugin);

const CodeBlockPlugin: LeafPlugin = {
  key: "CODEBLOCK",
  match: (op: Op) => !!(op.attributes && op.attributes[CODE_BLOCK_KEY]),
  processor: async (options: LeafOptions) => {
    const { current, tag } = options;
    const zoneId = current.attributes?.zoneId as string | undefined;
    const zone = zoneId && deltaSet.get(zoneId);
    if (!zone) return null;
    const content = await parseZoneContent(zoneId, {
      defaultZoneTag: {
        ...tag,
        isInZone: true,
        isInCodeBlock: true,
        fontSize: 12,
      },
    });
    const block = makeZoneBlock({
      fill: "#f2f3f5",
      children: content || [],
    });
    return block;
  },
};
LEAF_PLUGINS.push(CodeBlockPlugin);

const TextPlugin: LeafPlugin = {
  key: "TEXT",
  match: () => true,
  processor: async (options: LeafOptions) => {
    const { current, tag } = options;
    if (!isString(current.insert)) return null;
    const config: ContentText = {
      text: current.insert,
    };
    const attrs = current.attributes || {};
    if (attrs.bold) config.bold = true;
    if (attrs.italic) config.italics = true;
    if (attrs.underline) config.decoration = "underline";
    if (tag.fontSize) config.fontSize = tag.fontSize;
    return config;
  },
};
LEAF_PLUGINS.push(TextPlugin);

const HeadingPlugin: LinePlugin = {
  key: "HEADING",
  match: (line: Line) => !!(line.attrs && line.attrs.header),
  processor: async (options: LineOptions) => {
    const { current, leaves } = options;
    const attrs = current.attrs;
    const level = Number(attrs.header);
    const config = composeParagraph(leaves);
    switch (level) {
      case 1:
        config.style = FORMAT_TYPE.H1;
        break;
      case 2:
        config.style = FORMAT_TYPE.H2;
        break;
    }
    return config;
  },
};
LINE_PLUGINS.push(HeadingPlugin);

const ParagraphPlugin: LinePlugin = {
  key: "PARAGRAPH",
  match: () => true,
  processor: async (options: LineOptions) => {
    const { leaves } = options;
    return composeParagraph(leaves);
  },
};
LINE_PLUGINS.push(ParagraphPlugin);

/** 组装`PDF`数据 */
const main = async () => {
  const content = (await parseZoneContent(ROOT_ZONE, {})) || [];
  const doc: TDocumentDefinitions = {
    content: content,
    styles: PRESET_FORMAT,
    defaultStyle: DEFAULT_FORMAT,
  };

  const printer = new PdfPrinter(FONTS);
  const pdfDoc = printer.createPdfKitDocument(doc);
  pdfDoc.pipe(fs.createWriteStream(__dirname + "/doc.pdf"));
  pdfDoc.end();
};
main();

// http://pdfmake.org/playground.html
// https://pdfmake.github.io/docs/0.1/
// https://github.com/bpampuch/pdfmake/tree/0.2
