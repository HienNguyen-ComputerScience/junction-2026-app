// The Word and Excel writers (lib/export): the files are valid ZIP packages with the parts
// Office expects, text is escaped, numbers stay numbers.
// Run: node --test tests/export.test.mjs   (Node 24 strips the TypeScript types.)
// Set EXPORT_OUT=<dir> to also write sample.docx and sample.xlsx there, for opening by hand.

import "./exa-relevance-hooks.mjs";

import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { join } from "node:path";
import { describe, test } from "node:test";
import { crc32, inflateRawSync } from "node:zlib";

const root = new URL("../", import.meta.url);
registerHooks({
  resolve(specifier, context, next) {
    if (specifier.startsWith("@/") && !/\.\w+$/.test(specifier)) {
      return next(new URL(specifier.slice(2) + ".ts", root).href, context);
    }
    return next(specifier, context);
  },
});

const { zip, xml } = await import("../lib/export/zip.ts");
const { buildXlsx, sheetName } = await import("../lib/export/xlsx.ts");
const { buildDocx } = await import("../lib/export/docx.ts");

/** Read a ZIP back with nothing but zlib: path → text, checking every CRC on the way. */
function unzip(bytes) {
  const buf = Buffer.from(bytes);
  const end = buf.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  assert.ok(end >= 0, "end of central directory");
  const count = buf.readUInt16LE(end + 10);
  let at = buf.readUInt32LE(end + 16);
  const files = new Map();
  for (let i = 0; i < count; i++) {
    assert.equal(buf.readUInt32LE(at), 0x02014b50, "central header");
    const checksum = buf.readUInt32LE(at + 16);
    const packed = buf.readUInt32LE(at + 20);
    const size = buf.readUInt32LE(at + 24);
    const nameLength = buf.readUInt16LE(at + 28);
    const local = buf.readUInt32LE(at + 42);
    const name = buf.subarray(at + 46, at + 46 + nameLength).toString("utf8");
    assert.equal(buf.readUInt32LE(local), 0x04034b50, "local header");
    const dataAt = local + 30 + buf.readUInt16LE(local + 26) + buf.readUInt16LE(local + 28);
    const raw = inflateRawSync(buf.subarray(dataAt, dataAt + packed));
    assert.equal(raw.length, size, `${name}: size`);
    assert.equal(crc32(raw), checksum, `${name}: crc`);
    files.set(name, raw.toString("utf8"));
    at += 46 + nameLength;
  }
  return files;
}

describe("zip", () => {
  test("round-trips entries, UTF-8 included", () => {
    const files = unzip(zip([{ path: "a.txt", content: "Päijät-Häme" }, { path: "dir/b.xml", content: "<x/>" }]));
    assert.deepEqual([...files.keys()], ["a.txt", "dir/b.xml"]);
    assert.equal(files.get("a.txt"), "Päijät-Häme");
  });

  test("the same input gives the same bytes", () => {
    const entries = [{ path: "a.txt", content: "x" }];
    assert.deepEqual(zip(entries), zip(entries));
  });

  test("xml escapes the five entities and drops control characters", () => {
    assert.equal(xml(`a<b & "c" > 'd'\u0001`), "a&lt;b &amp; &quot;c&quot; &gt; &apos;d&apos;");
  });
});

describe("xlsx", () => {
  const sheets = [
    {
      name: "Where the area stands",
      widths: [30, 12, 12],
      rows: [
        ["Step", "Area, %", "Finland, %"],
        ["Getting to a GP <7 days & more", 85.4, 54.7],
        ["GP recognises warning signs", null, null],
      ],
    },
    { name: "Sources: all / of [them]", widths: [40], rows: [["Source"], ["Sotkanet 6411"]] },
  ];
  const files = unzip(buildXlsx(sheets));

  test("has the parts Excel needs", () => {
    for (const part of ["[Content_Types].xml", "_rels/.rels", "xl/workbook.xml", "xl/_rels/workbook.xml.rels", "xl/styles.xml", "xl/worksheets/sheet1.xml", "xl/worksheets/sheet2.xml"]) {
      assert.ok(files.has(part), part);
    }
  });

  test("numbers are numeric cells, text is escaped inline text, empty cells are left out", () => {
    const sheet = files.get("xl/worksheets/sheet1.xml");
    assert.match(sheet, /<c r="B2" s="2"><v>85\.4<\/v><\/c>/);
    assert.match(sheet, /<c r="A2" s="2" t="inlineStr"><is><t xml:space="preserve">Getting to a GP &lt;7 days &amp; more<\/t>/);
    assert.doesNotMatch(sheet, /r="B3"/);
    assert.match(sheet, /<c r="A1" s="1"/); // bold header
  });

  test("sheet names are made safe for Excel", () => {
    assert.equal(sheetName("Sources: all / of [them]"), "Sources  all   of  them ");
    assert.ok(sheetName("x".repeat(40)).length === 31);
    assert.match(files.get("xl/workbook.xml"), /<sheet name="Sources {2}all {3}of {2}them " sheetId="2"/);
  });
});

describe("docx", () => {
  const blocks = [
    { type: "title", text: "Action plan: Vantaa and Kerava" },
    { type: "h1", text: "Where the area stands" },
    { type: "p", runs: ["Share of visits: ", { b: "85.4%" }, " (Finland 54.7%)."] },
    { type: "note", runs: ["Source: Sotkanet 6411 & others"] },
    { type: "table", widths: [2, 1], rows: [[["Step"], ["Value"]], [["Getting to a GP\nline two"], [{ b: "85.4%" }]]] },
  ];
  const files = unzip(buildDocx(blocks));

  test("has the parts Word needs", () => {
    for (const part of ["[Content_Types].xml", "_rels/.rels", "word/document.xml", "word/styles.xml", "word/_rels/document.xml.rels"]) {
      assert.ok(files.has(part), part);
    }
  });

  test("carries headings, bold runs, escaped text, a table with a repeating header row", () => {
    const doc = files.get("word/document.xml");
    assert.match(doc, /<w:pStyle w:val="Title"\/>/);
    assert.match(doc, /<w:pStyle w:val="Heading1"\/>/);
    assert.match(doc, /<w:b\/><\/w:rPr><w:t xml:space="preserve">85\.4%<\/w:t>/);
    assert.match(doc, /Sotkanet 6411 &amp; others/);
    assert.match(doc, /<w:tblHeader\/>/);
    assert.match(doc, /Getting to a GP<\/w:t><w:br\/><w:t xml:space="preserve">line two/);
    assert.equal(doc.match(/<w:tr>/g).length, 2);
  });

  if (process.env.EXPORT_OUT) {
    test("writes samples for opening by hand", () => {
      mkdirSync(process.env.EXPORT_OUT, { recursive: true });
      writeFileSync(join(process.env.EXPORT_OUT, "sample.docx"), buildDocx(blocks));
      writeFileSync(
        join(process.env.EXPORT_OUT, "sample.xlsx"),
        buildXlsx([
          { name: "Where the area stands", widths: [30, 12, 12], rows: [["Step", "Area, %", "Finland, %"], ["Getting to a GP", 85.4, 54.7]] },
          { name: "Sources", widths: [40], rows: [["Source"], ["Sotkanet 6411"]] },
        ]),
      );
    });
  }
});
