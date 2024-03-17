// https://unpkg.com/browse/source-han-sans-cn@1.0.0/
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfMake = require("../packages/utils/node_modules/pdfmake");
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
type PDF = typeof import("../packages/utils/node_modules/@types/pdfmake");
const PdfPrinter = pdfMake as PDF;
import fs from "fs";

const docDefinition = {
  content: [
    { text: "This is a header", bold: true },
    "No styling here, this is a standard paragraph",
    { text: "Another text", italics: true },
    { text: "Multiple styles applied" },
  ],
};

const FONT_PATH = "/Users/czy/Library/Fonts/";
const FONTS = {
  Roboto: {
    normal: FONT_PATH + "JetBrainsMono-Regular.ttf",
    bold: FONT_PATH + "JetBrainsMono-Bold.ttf",
    italics: FONT_PATH + "JetBrainsMono-Italic.ttf",
    bolditalics: FONT_PATH + "JetBrainsMono-BoldItalic.ttf",
  },
};

const printer = new PdfPrinter(FONTS);
const pdfDoc = printer.createPdfKitDocument(docDefinition);
pdfDoc.pipe(fs.createWriteStream(__dirname + "/doc.pdf"));
pdfDoc.end();
