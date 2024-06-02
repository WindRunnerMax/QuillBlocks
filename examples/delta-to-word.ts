import fs from "fs";

import type {
  ExternalHyperlink,
  IImageOptions,
  IParagraphOptions,
  IParagraphStyleOptions,
  IRunOptions,
  ISpacingProperties,
  ITableCellOptions,
  ITableOptions,
  ITableRowOptions,
  Run,
} from "../packages/tools/node_modules/docx";
import {
  BorderStyle,
  Document,
  Footer,
  Header,
  ImageRun,
  LineRuleType,
  NumberFormat,
  Packer,
  PageNumber,
  Paragraph,
  sectionPageSizeDefaults,
  SimpleField,
  StyleLevel,
  Tab,
  Table,
  TableCell,
  TableLayoutType,
  TableOfContents,
  TableRow,
  TabStopPosition,
  TabStopType,
  TextRun,
  WidthType,
} from "../packages/tools/node_modules/docx";
import imageSize from "../packages/tools/node_modules/image-size";
import { isString } from "../packages/utils/node_modules/laser-utils";
import type { Line, Op } from "./delta-set";
import DeltaSet from "./delta-set";
const { CODE_BLOCK_KEY, ops, opsToDeltaSet, ROOT_ZONE } = DeltaSet;
const deltaSet = opsToDeltaSet(ops);

/** 基准全局配置 */
const PAGE_SIZE = {
  WIDTH: sectionPageSizeDefaults.WIDTH - 1440 * 2,
  HEIGHT: sectionPageSizeDefaults.HEIGHT - 1440 * 2,
};
const DEFAULT_FORMAT_TYPE = {
  H1: "H1",
  H2: "H2",
  CONTENT: "Content",
  IMAGE: "Image",
  HF: "HF",
};
const DEFAULT_LINE_SPACING_FORMAT = {
  before: 6 * 20, // 6 PT
  after: 6 * 20, // 6 PT
  line: 20 * 20, // 20 PT
  lineRule: LineRuleType.EXACT,
};
const BORDER_NODE = { style: BorderStyle.NONE, size: 1, color: "#000000" };
const NO_BORDER = { top: BORDER_NODE, bottom: BORDER_NODE, left: BORDER_NODE, right: BORDER_NODE };
const DEFAULT_FONT_FORMAT = { ascii: "Times New Roman", eastAsia: "宋体" };
const DEFAULT_TEXT_FORMAT = { size: 24 /** 12 PT */, color: "#000000", font: DEFAULT_FONT_FORMAT };

const PRESET_SCHEME_LIST: IParagraphStyleOptions[] = [
  {
    id: DEFAULT_FORMAT_TYPE.CONTENT,
    name: DEFAULT_FORMAT_TYPE.CONTENT,
    quickFormat: true,
    paragraph: {
      spacing: DEFAULT_LINE_SPACING_FORMAT,
    },
  },
  {
    id: DEFAULT_FORMAT_TYPE.H1,
    name: DEFAULT_FORMAT_TYPE.H1,
    basedOn: "Heading1",
    next: DEFAULT_FORMAT_TYPE.CONTENT,
    quickFormat: true,
    paragraph: {
      spacing: DEFAULT_LINE_SPACING_FORMAT,
    },
    run: {
      ...DEFAULT_TEXT_FORMAT,
      size: 36,
      bold: true,
      italics: false,
      font: { ...DEFAULT_FONT_FORMAT, eastAsia: "黑体" },
    },
  },
  {
    id: DEFAULT_FORMAT_TYPE.H2,
    name: DEFAULT_FORMAT_TYPE.H2,
    basedOn: "Heading2",
    next: DEFAULT_FORMAT_TYPE.CONTENT,
    quickFormat: true,
    paragraph: {
      spacing: DEFAULT_LINE_SPACING_FORMAT,
    },
    run: {
      ...DEFAULT_TEXT_FORMAT,
      size: 32,
      bold: true,
      italics: false,
      font: { ...DEFAULT_FONT_FORMAT, eastAsia: "黑体" },
    },
  },
  {
    id: DEFAULT_FORMAT_TYPE.IMAGE,
    name: DEFAULT_FORMAT_TYPE.IMAGE,
    quickFormat: true,
    next: DEFAULT_FORMAT_TYPE.CONTENT,
    paragraph: {
      spacing: {
        ...DEFAULT_LINE_SPACING_FORMAT,
        line: undefined,
      },
    },
  },
  {
    id: DEFAULT_FORMAT_TYPE.HF,
    name: DEFAULT_FORMAT_TYPE.HF,
    quickFormat: true,
    run: { size: 18, color: "#1d2129" },
  },
];

/** 单位转换 */
const daxToCM = (dax: number) => (dax / 20 / 72) * 2.54;
const cmToPixel = (cm: number) => cm * 10 * 3.7795275591;
const daxToPixel = (dax: number) => Math.ceil(cmToPixel(daxToCM(dax)));

/** `Word`转换调度 */
type LineBlock = Table | Paragraph;
type LeafBlock = Run | Table | ExternalHyperlink;
type Tag = {
  width: number;
  fontSize?: number;
  fontColor?: string;
  spacing?: ISpacingProperties;
  paragraphFormat?: string;
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
): Promise<LineBlock[] | null> => {
  const { defaultZoneTag = { width: PAGE_SIZE.WIDTH } } = options;
  const lines = deltaSet.get(zoneId);
  if (!lines) return null;
  const target: LineBlock[] = [];
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

/** 注册插件 */
type WithDefaultOption<T> = { -readonly [P in keyof T]: T[P] };
const makeZoneBlock = async (
  config: {
    table?: WithDefaultOption<Omit<ITableOptions, "children" | "rows">>;
    row?: WithDefaultOption<Omit<ITableRowOptions, "children">>;
    cell?: WithDefaultOption<Omit<ITableCellOptions, "children">>;
    children?: LineBlock[];
  } = {}
) => {
  const { table, row, cell, children } = config;
  const tableCell = new TableCell({
    width: { size: "100%", type: WidthType.PERCENTAGE },
    borders: NO_BORDER,
    ...cell,
    children: children || [],
  });
  const tableRow = new TableRow({
    ...row,
    children: [tableCell],
  });
  return new Table({
    width: { size: "100%", type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    style: DEFAULT_FORMAT_TYPE.CONTENT,
    ...table,
    rows: [tableRow],
  });
};

const ImagePlugin: LeafPlugin = {
  key: "IMAGE",
  match: (op: Op) => !!(op.insert && (op.insert as Record<string, unknown>).image),
  processor: async (options: LeafOptions) => {
    const { current, tag } = options;
    const src = (current.insert as Record<string, unknown>)?.image as string;
    if (!src) return null;
    tag.paragraphFormat = DEFAULT_FORMAT_TYPE.IMAGE;
    const base64 = src.split(",")[1];
    const buffer = Buffer.from(base64, "base64");
    const { width = 100, height = 100 } = imageSize(buffer);
    const scale = height / width;
    const targetWidth = Math.min(daxToPixel(tag.width), width);
    const targetHeight = targetWidth * scale;
    const config: WithDefaultOption<IImageOptions> = {
      data: buffer,
      transformation: { width: targetWidth, height: targetHeight },
    };
    return new ImageRun(config);
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
    const MARGIN = 10 * 20;
    const content = await parseZoneContent(zoneId, {
      defaultZoneTag: {
        ...tag,
        isInZone: true,
        isInCodeBlock: true,
        fontSize: 20,
        width: options.tag.width - MARGIN * 2,
        spacing: { ...DEFAULT_LINE_SPACING_FORMAT, after: 0, before: 0 },
      },
    });
    const border = { size: 1, style: BorderStyle.SINGLE, color: "#e5e6eb" };
    const background = { fill: "#f2f3f5" };
    const block = makeZoneBlock({
      table: { width: { size: tag.width, type: WidthType.DXA } },
      cell: {
        margins: {
          top: MARGIN / 5,
          bottom: MARGIN / 2,
          left: MARGIN,
          right: MARGIN,
          marginUnitType: WidthType.DXA,
        },
        borders: { top: border, bottom: border, left: border, right: border },
        shading: background,
      },
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
    const config: WithDefaultOption<IRunOptions> = {};
    config.text = current.insert;
    const attrs = current.attributes || {};
    if (attrs.bold) config.bold = true;
    if (attrs.italic) config.italics = true;
    if (attrs.underline) config.underline = {};
    if (tag.fontSize) config.size = tag.fontSize;
    if (tag.fontColor) config.color = tag.fontColor;
    return new TextRun(config);
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
    const config: WithDefaultOption<IParagraphOptions> = {};
    switch (level) {
      case 1:
        config.style = DEFAULT_FORMAT_TYPE.H1;
        break;
      case 2:
        config.style = DEFAULT_FORMAT_TYPE.H2;
        break;
    }
    config.children = leaves;
    return new Paragraph(config);
  },
};
LINE_PLUGINS.push(HeadingPlugin);

const ParagraphPlugin: LinePlugin = {
  key: "PARAGRAPH",
  match: () => true,
  processor: async (options: LineOptions) => {
    const { leaves, tag } = options;
    const config: WithDefaultOption<IParagraphOptions> = {};
    const isBlockNode = leaves.some(leaf => leaf instanceof Table);
    config.style = tag.paragraphFormat || DEFAULT_FORMAT_TYPE.CONTENT;
    if (!isBlockNode) {
      if (tag.spacing) config.spacing = tag.spacing;
      config.children = leaves;
      return new Paragraph(config);
    } else {
      if (leaves.length === 1 && leaves[0] instanceof Table) {
        // 单个`Zone`不需要包裹 通常是独立的块元素
        return leaves[0] as Table;
      } else {
        // 需要包裹组合嵌套`BlockTable`
        return makeZoneBlock({ children: leaves });
      }
    }
  },
};
LINE_PLUGINS.push(ParagraphPlugin);

/** 组装`Office Open XML` */
const HeaderSection = new Header({
  children: [
    new Paragraph({
      style: DEFAULT_FORMAT_TYPE.HF,
      tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
      spacing: { before: 8 * 0.5 * 20 },
      border: { bottom: { size: 6, style: BorderStyle.SINGLE, color: "#1d2129" } },
      children: [
        new TextRun("页眉"),
        new TextRun({
          children: [
            new Tab(),
            new SimpleField(`STYLEREF "${DEFAULT_FORMAT_TYPE.H1}" \\* MERGEFORMAT`),
          ],
        }),
      ],
    }),
  ],
});

const FooterSection = new Footer({
  children: [
    new Paragraph({
      style: DEFAULT_FORMAT_TYPE.HF,
      tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
      spacing: { after: 10 * 0.5 * 20 },
      border: { top: { size: 6, style: BorderStyle.SINGLE, color: "#1d2129" } },
      children: [
        new TextRun("页脚"),
        new TextRun({
          children: [new Tab(), PageNumber.CURRENT],
        }),
      ],
    }),
  ],
});

const main = async () => {
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            pageNumbers: { start: 1, formatType: NumberFormat.UPPER_ROMAN },
          },
        },
        children: [
          new Paragraph({ text: "目录", style: DEFAULT_FORMAT_TYPE.H1 }),
          new TableOfContents("Table Of Contents", {
            hyperlink: true,
            headingStyleRange: "1-2",
            stylesWithLevels: [
              new StyleLevel(DEFAULT_FORMAT_TYPE.H1, 1),
              new StyleLevel(DEFAULT_FORMAT_TYPE.H2, 2),
            ],
          }),
        ],
      },
      {
        properties: {
          page: {
            pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL },
          },
        },
        headers: { default: HeaderSection },
        footers: { default: FooterSection },
        children: (await parseZoneContent(ROOT_ZONE, {})) || [],
      },
    ],
    styles: {
      paragraphStyles: PRESET_SCHEME_LIST,
      default: { document: { run: DEFAULT_TEXT_FORMAT } },
    },
  });

  // 生成`.docx`文件
  Packer.toBuffer(doc).then(buffer => {
    fs.writeFileSync(__dirname + "/word.docx", buffer);
  });
};
main();

// https://docx.js.org/
// https://github.com/dolanmiu/docx/issues/283
// https://stackoverflow.com/questions/14360183/default-wordml-unit-measurement-pixel-or-point-or-inches
