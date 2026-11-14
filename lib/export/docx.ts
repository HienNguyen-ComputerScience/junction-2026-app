// A minimal .docx writer: headings, paragraphs, bullet-style lines and bordered tables on A4.
// Enough for a board paper that opens in Word, can be edited there and prints cleanly.

import { xml, zip } from "@/lib/export/zip";

/** A run of text: plain, or `{ b: "bold text" }`. */
export type Run = string | { b: string };

export type Block =
  | { type: "title"; text: string }
  | { type: "h1"; text: string }
  | { type: "h2"; text: string }
  | { type: "p"; runs: Run[] }
  /** Smaller, grey: captions, source lines, notes. */
  | { type: "note"; runs: Run[] }
  /** A table. The first row is the header (bold, shaded, repeated on each page). `widths` are relative. */
  | { type: "table"; widths: number[]; rows: Run[][][] };

// A4 with 2 cm margins, in twentieths of a point. Text width: 11906 - 2 * 1134 = 9638.
const TEXT_WIDTH = 9638;

function runXml(run: Run, size?: number, color?: string): string {
  const bold = typeof run !== "string";
  const text = bold ? run.b : run;
  if (!text) return "";
  const props = `${bold ? "<w:b/>" : ""}${color ? `<w:color w:val="${color}"/>` : ""}${size ? `<w:sz w:val="${size}"/><w:szCs w:val="${size}"/>` : ""}`;
  // A line break inside a run is a <w:br/>, so multi-line cells keep their lines.
  const parts = text.split("\n").map((line) => `<w:t xml:space="preserve">${xml(line)}</w:t>`);
  return `<w:r>${props ? `<w:rPr>${props}</w:rPr>` : ""}${parts.join("<w:br/>")}</w:r>`;
}

function paragraph(runs: Run[], options: { style?: string; size?: number; color?: string; after?: number } = {}): string {
  const props = `${options.style ? `<w:pStyle w:val="${options.style}"/>` : ""}${options.after !== undefined ? `<w:spacing w:after="${options.after}"/>` : ""}`;
  return `<w:p>${props ? `<w:pPr>${props}</w:pPr>` : ""}${runs.map((run) => runXml(run, options.size, options.color)).join("")}</w:p>`;
}

function tableXml(widths: number[], rows: Run[][][]): string {
  const total = widths.reduce((sum, width) => sum + width, 0);
  const cols = widths.map((width) => Math.round((width / total) * TEXT_WIDTH));
  const border = (side: string) => `<w:${side} w:val="single" w:sz="4" w:space="0" w:color="808080"/>`;
  const grid = cols.map((width) => `<w:gridCol w:w="${width}"/>`).join("");
  const body = rows
    .map((row, r) => {
      const cells = row
        .map((cell, c) => {
          const shade = r === 0 ? `<w:shd w:val="clear" w:color="auto" w:fill="E7E6E6"/>` : "";
          const runs = r === 0 ? cell.map((run) => (typeof run === "string" ? { b: run } : run)) : cell;
          return `<w:tc><w:tcPr><w:tcW w:w="${cols[c] ?? cols[0]}" w:type="dxa"/>${shade}</w:tcPr>${paragraph(runs, { size: 18, after: 40 })}</w:tc>`;
        })
        .join("");
      return `<w:tr>${r === 0 ? "<w:trPr><w:tblHeader/></w:trPr>" : "<w:trPr><w:cantSplit/></w:trPr>"}${cells}</w:tr>`;
    })
    .join("");
  return `<w:tbl><w:tblPr><w:tblW w:w="${TEXT_WIDTH}" w:type="dxa"/><w:tblBorders>${["top", "left", "bottom", "right", "insideH", "insideV"].map(border).join("")}</w:tblBorders><w:tblLayout w:type="fixed"/><w:tblCellMar><w:top w:w="60" w:type="dxa"/><w:left w:w="90" w:type="dxa"/><w:bottom w:w="60" w:type="dxa"/><w:right w:w="90" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid>${grid}</w:tblGrid>${body}</w:tbl>${paragraph([], { after: 120 })}`;
}

function blockXml(block: Block): string {
  switch (block.type) {
    case "title":
      return paragraph([block.text], { style: "Title" });
    case "h1":
      return paragraph([block.text], { style: "Heading1" });
    case "h2":
      return paragraph([block.text], { style: "Heading2" });
    case "p":
      return paragraph(block.runs, { after: 120 });
    case "note":
      return paragraph(block.runs, { size: 18, color: "595959", after: 120 });
    case "table":
      return tableXml(block.widths, block.rows);
  }
}

const STYLES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/><w:sz w:val="21"/><w:szCs w:val="21"/><w:lang w:val="en-GB"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="100" w:line="264" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style><w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:pPr><w:spacing w:after="80"/></w:pPr><w:rPr><w:b/><w:sz w:val="40"/><w:szCs w:val="40"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:pPr><w:keepNext/><w:spacing w:before="320" w:after="100"/><w:outlineLvl w:val="0"/></w:pPr><w:rPr><w:b/><w:sz w:val="28"/><w:szCs w:val="28"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:pPr><w:keepNext/><w:spacing w:before="220" w:after="80"/><w:outlineLvl w:val="1"/></w:pPr><w:rPr><w:b/><w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr></w:style></w:styles>`;

export function buildDocx(blocks: Block[]): Uint8Array<ArrayBuffer> {
  const body = blocks.map(blockXml).join("");
  return zip([
    {
      path: "[Content_Types].xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>`,
    },
    {
      path: "_rels/.rels",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`,
    },
    {
      path: "word/_rels/document.xml.rels",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`,
    },
    { path: "word/styles.xml", content: STYLES },
    {
      path: "word/document.xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${body}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="567" w:footer="567" w:gutter="0"/></w:sectPr></w:body></w:document>`,
    },
  ]);
}

export const DOCX_TYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
