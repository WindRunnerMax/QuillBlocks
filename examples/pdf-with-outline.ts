// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfMake = require("../packages/utils/node_modules/pdfmake");
import fs from "fs";
import { Stream } from "stream";

import type PDF from "../packages/utils/node_modules/@types/pdfmake";
import type { TDocumentDefinitions } from "../packages/utils/node_modules/@types/pdfmake/interfaces";
import {
  PDFDict,
  PDFDocument,
  PDFHexString,
  PDFName,
  PDFNumber,
} from "../packages/utils/node_modules/pdf-lib";
import type { DictMap } from "../packages/utils/node_modules/pdf-lib/src/core/objects/PDFDict";
const PdfPrinter = pdfMake as typeof PDF;

const FONT_PATH = "/Users/czy/Library/Fonts/";
const FONTS = {
  JetBrainsMono: {
    normal: FONT_PATH + "JetBrainsMono-Regular.ttf",
    bold: FONT_PATH + "JetBrainsMono-Bold.ttf",
    italics: FONT_PATH + "JetBrainsMono-Italic.ttf",
    bolditalics: FONT_PATH + "JetBrainsMono-BoldItalic.ttf",
  },
};

const doc: TDocumentDefinitions = {
  content: [
    { text: "Header1", style: "header", id: "Hash1" },
    { text: "123" },
    { text: "\n", pageBreak: "after" },
    { text: "Header1.1", id: "Hash1.1", style: "subHeader" },
    { text: "123" },
    { text: "456" },
    { text: "789" },
    { text: "Header1.2", id: "Hash1.2", style: "subHeader" },
    { text: "123" },
    { text: "123" },
    { text: "123" },
    { text: "\n", pageBreak: "after" },
    { text: "Header2", style: "header", id: "Hash2" },
    { text: "123" },
    { text: "Header2.1", style: "subHeader", id: "Hash2.1" },
    { text: "123" },
    { text: "Header2.2", style: "subHeader", id: "Hash2.2" },
    { text: "123" },
  ],
  styles: {
    header: { fontSize: 20, bold: true },
    subHeader: { fontSize: 16, bold: true },
  },
  defaultStyle: { font: "JetBrainsMono" },
};

const main = async () => {
  const printer = new PdfPrinter(FONTS);
  const pdfDoc = printer.createPdfKitDocument(doc);
  const writableStream = new Stream.Writable();
  const slice: Uint8Array[] = [];
  writableStream._write = (chunk: Uint8Array, _, next) => {
    slice.push(chunk);
    next();
  };
  pdfDoc.pipe(writableStream);
  pdfDoc.end();
  const buffer = await new Promise<Buffer>(resolve => {
    writableStream.on("finish", async () => {
      const data = Buffer.concat(slice);
      resolve(data);
    });
  });
  const pdf = await PDFDocument.load(buffer);
  const context = pdf.context;

  const root = context.nextRef();
  const header1 = context.nextRef();
  const header11 = context.nextRef();
  const header12 = context.nextRef();
  const header2 = context.nextRef();
  const header21 = context.nextRef();
  const header22 = context.nextRef();

  const header1Map: DictMap = new Map([]);
  header1Map.set(PDFName.of("Title"), PDFHexString.fromText("HEADER1"));
  header1Map.set(PDFName.of("Dest"), PDFName.of("Hash1"));
  header1Map.set(PDFName.of("Parent"), root);
  header1Map.set(PDFName.of("First"), header11);
  header1Map.set(PDFName.of("Last"), header12);
  header1Map.set(PDFName.of("Count"), PDFNumber.of(2));
  context.assign(header1, PDFDict.fromMapWithContext(header1Map, context));

  const header11Map: DictMap = new Map([]);
  header11Map.set(PDFName.of("Title"), PDFHexString.fromText("HEADER1.1"));
  header11Map.set(PDFName.of("Dest"), PDFName.of("Hash1.1"));
  header11Map.set(PDFName.of("Parent"), header1);
  header11Map.set(PDFName.of("Next"), header12);
  context.assign(header11, PDFDict.fromMapWithContext(header11Map, context));

  const header12Map: DictMap = new Map([]);
  header12Map.set(PDFName.of("Title"), PDFHexString.fromText("HEADER1.2"));
  header12Map.set(PDFName.of("Dest"), PDFName.of("Hash1.2"));
  header12Map.set(PDFName.of("Parent"), header1);
  header12Map.set(PDFName.of("Prev"), header11);
  context.assign(header12, PDFDict.fromMapWithContext(header12Map, context));

  const header2Map: DictMap = new Map([]);
  header2Map.set(PDFName.of("Title"), PDFHexString.fromText("HEADER2"));
  header2Map.set(PDFName.of("Dest"), PDFName.of("Hash2"));
  header2Map.set(PDFName.of("Parent"), root);
  header12Map.set(PDFName.of("Prev"), header1);
  header2Map.set(PDFName.of("First"), header21);
  header2Map.set(PDFName.of("Last"), header22);
  header2Map.set(PDFName.of("Count"), PDFNumber.of(2));
  context.assign(header2, PDFDict.fromMapWithContext(header2Map, context));

  const header21Map: DictMap = new Map([]);
  header21Map.set(PDFName.of("Title"), PDFHexString.fromText("HEADER2.1"));
  header21Map.set(PDFName.of("Dest"), PDFName.of("Hash2.1"));
  header21Map.set(PDFName.of("Parent"), header2);
  header21Map.set(PDFName.of("Next"), header22);
  context.assign(header21, PDFDict.fromMapWithContext(header21Map, context));

  const header22Map: DictMap = new Map([]);
  header22Map.set(PDFName.of("Title"), PDFHexString.fromText("HEADER2.2"));
  header22Map.set(PDFName.of("Dest"), PDFName.of("Hash2.2"));
  header22Map.set(PDFName.of("Parent"), header2);
  header22Map.set(PDFName.of("Prev"), header21);
  context.assign(header22, PDFDict.fromMapWithContext(header22Map, context));

  const rootMap: DictMap = new Map([]);
  rootMap.set(PDFName.of("Type"), PDFName.of("Outlines"));
  rootMap.set(PDFName.of("First"), header1);
  rootMap.set(PDFName.of("Last"), header2);
  rootMap.set(PDFName.of("Count"), PDFNumber.of(6));
  context.assign(root, PDFDict.fromMapWithContext(rootMap, context));

  pdf.catalog.set(PDFName.of("Outlines"), root);
  const pdfBytes = await pdf.save();
  fs.writeFileSync(__dirname + "/doc-with-outline.pdf", pdfBytes);
};
main();

// https://pdf-lib.js.org/
// http://pdfmake.org/playground.html
// https://github.com/Hopding/pdf-lib
