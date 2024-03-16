import fs from "fs";

import type {
  ExternalHyperlink,
  IParagraphStyleOptions,
  IRunOptions,
  Run,
  Table,
} from "../packages/plugin/node_modules/docx";
import {
  BorderStyle,
  Document,
  Footer,
  Header,
  LineRuleType,
  NumberFormat,
  Packer,
  PageBreak,
  PageNumber,
  Paragraph,
  sectionPageSizeDefaults,
  SimpleField,
  StyleLevel,
  Tab,
  TableOfContents,
  TabStopPosition,
  TabStopType,
  TextRun,
} from "../packages/plugin/node_modules/docx";
import type { Line, Op } from "./delta-set";
import DeltaSet from "./delta-set";
const { CODE_BLOCK_KEY, deltaSet, ROOT_ZONE } = DeltaSet;

// https://docx.js.org/
// https://github.com/dolanmiu/docx/issues/283
// https://stackoverflow.com/questions/14360183/default-wordml-unit-measurement-pixel-or-point-or-inches

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
const DEFAULT_FONT_FORMAT = { ascii: "Times New Roman", eastAsia: "宋体" };
const DEFAULT_TEXT_FORMAT = { size: 24 /** 12 PT */, color: "000000", font: DEFAULT_FONT_FORMAT };

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
    run: { size: 18, color: "4e5969" },
  },
];

/** `Word`转换调度 */
type LineBlock = Table | Paragraph;
type LeafBlock = Run | Table | ExternalHyperlink;
type Tag = {
  isInZone?: boolean;
  width: number;
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
  const tag: Tag = { ...defaultZoneTag }; // 不能影响外部传递的`Tag`
  for (let i = 0; i < lines.length; ++i) {
    const prevLine = lines[i - 1] || null;
    const currentLine = lines[i];
    const nextLine = lines[i + 1] || null;
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
const TextPlugin: LeafPlugin = {
  key: "BASE_TEXT",
  match: () => true,
  processor: async (options: LeafOptions) => {
    const { current } = options;
    const config: WithDefaultOption<IRunOptions> = {};
    return new TextRun(config);
  },
};

const makeZoneBlock = async (zoneId: string) => {
  // ...
};

/** 组装`Office Open XML` */
const HeaderSection = new Header({
  children: [
    new Paragraph({
      style: DEFAULT_FORMAT_TYPE.HF,
      tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
      spacing: { before: 8 * 0.5 * 20 },
      border: { bottom: { size: 12, style: BorderStyle.SINGLE } },
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
      border: { top: { size: 12, style: BorderStyle.SINGLE } },
      children: [
        new TextRun("页脚"),
        new TextRun({
          children: [new Tab(), PageNumber.CURRENT],
        }),
      ],
    }),
  ],
});

const doc = new Document({
  sections: [
    {
      properties: {
        page: {
          pageNumbers: { start: 1, formatType: NumberFormat.UPPER_ROMAN },
        },
      },
      children: [
        new Paragraph({
          text: "目录",
          style: DEFAULT_FORMAT_TYPE.H1,
        }),
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
      children: [
        new Paragraph({
          style: DEFAULT_FORMAT_TYPE.H1,
          children: [new TextRun("标题")],
        }),
        new Paragraph({
          style: DEFAULT_FORMAT_TYPE.CONTENT,
          children: [
            new TextRun("Hello World"),
            new TextRun({
              text: "Foo Bar",
              bold: true,
            }),
            new TextRun({
              text: "\tGithub is the best",
              bold: true,
            }),
          ],
        }),
        new Paragraph({ children: [new PageBreak()] }),
        new Paragraph({
          style: DEFAULT_FORMAT_TYPE.H2,
          children: [new TextRun("标题2")],
        }),
      ],
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
