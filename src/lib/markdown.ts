// Minimal, dependency-free Markdown -> HTML renderer for AI reports.
// Supports headings, bold/italic/code, bullet & numbered lists, tables,
// horizontal rules and paragraphs. Output is used for on-screen preview
// and for Word/PDF export, so it intentionally produces clean semantic HTML.

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function inline(s: string): string {
  let out = escapeHtml(s);
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");
  out = out.replace(/`([^`]+)`/g, "<code>$1</code>");
  out = out.replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, '<a href="$2">$1</a>');
  return out;
}

export function markdownToHtml(md: string): string {
  const lines = (md ?? "").replace(/\r\n/g, "\n").split("\n");
  const html: string[] = [];
  let i = 0;

  const flushParagraph = (buf: string[]) => {
    if (buf.length) {
      html.push(`<p>${inline(buf.join(" "))}</p>`);
      buf.length = 0;
    }
  };

  const para: string[] = [];

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // blank line
    if (!trimmed) {
      flushParagraph(para);
      i++;
      continue;
    }

    // horizontal rule
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      flushParagraph(para);
      html.push("<hr/>");
      i++;
      continue;
    }

    // heading
    const h = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      flushParagraph(para);
      const level = h[1].length;
      html.push(`<h${level}>${inline(h[2])}</h${level}>`);
      i++;
      continue;
    }

    // table (header row followed by separator row of ---)
    if (trimmed.startsWith("|") && i + 1 < lines.length && /^\s*\|?[\s:|-]+\|?\s*$/.test(lines[i + 1]) && lines[i + 1].includes("-")) {
      flushParagraph(para);
      const splitRow = (r: string) =>
        r.replace(/^\s*\|/, "").replace(/\|\s*$/, "").split("|").map((c) => c.trim());
      const headers = splitRow(trimmed);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        rows.push(splitRow(lines[i].trim()));
        i++;
      }
      const thead = `<thead><tr>${headers.map((c) => `<th>${inline(c)}</th>`).join("")}</tr></thead>`;
      const tbody = `<tbody>${rows
        .map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`)
        .join("")}</tbody>`;
      html.push(`<table>${thead}${tbody}</table>`);
      continue;
    }

    // unordered list
    if (/^[-*+]\s+/.test(trimmed)) {
      flushParagraph(para);
      const items: string[] = [];
      while (i < lines.length && /^[-*+]\s+/.test(lines[i].trim())) {
        items.push(`<li>${inline(lines[i].trim().replace(/^[-*+]\s+/, ""))}</li>`);
        i++;
      }
      html.push(`<ul>${items.join("")}</ul>`);
      continue;
    }

    // ordered list
    if (/^\d+\.\s+/.test(trimmed)) {
      flushParagraph(para);
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(`<li>${inline(lines[i].trim().replace(/^\d+\.\s+/, ""))}</li>`);
        i++;
      }
      html.push(`<ol>${items.join("")}</ol>`);
      continue;
    }

    // paragraph text
    para.push(trimmed);
    i++;
  }
  flushParagraph(para);
  return html.join("\n");
}

const REPORT_STYLES = `
  body { font-family: Calibri, Arial, sans-serif; color: #1a1a1a; line-height: 1.5; max-width: 800px; margin: 0 auto; padding: 32px; }
  h1 { font-size: 24px; border-bottom: 2px solid #2563eb; padding-bottom: 8px; }
  h2 { font-size: 19px; color: #1e3a8a; margin-top: 24px; }
  h3 { font-size: 16px; color: #1e40af; }
  table { border-collapse: collapse; width: 100%; margin: 12px 0; }
  th, td { border: 1px solid #cbd5e1; padding: 6px 10px; text-align: left; font-size: 13px; }
  th { background: #eff6ff; }
  ul, ol { margin: 8px 0 8px 20px; }
  li { margin: 3px 0; }
  hr { border: none; border-top: 1px solid #e2e8f0; margin: 16px 0; }
  code { background: #f1f5f9; padding: 1px 4px; border-radius: 3px; font-size: 12px; }
  .report-meta { color: #64748b; font-size: 12px; margin-bottom: 16px; }
`;

function reportDocument(title: string, bodyHtml: string): string {
  const date = new Date().toLocaleString();
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title><style>${REPORT_STYLES}</style></head>
<body><h1>${title}</h1><div class="report-meta">Generated ${date}</div>${bodyHtml}</body></html>`;
}

// ---------------------------------------------------------------------------
// Word export — real Office Open XML (.docx), generated in the browser.
// ---------------------------------------------------------------------------

type Docx = typeof import("docx");

// Split a markdown line into docx TextRuns honouring **bold**, *italic* and `code`.
function runsFromInline(d: Docx, text: string, base?: { bold?: boolean; size?: number }) {
  const runs: InstanceType<Docx["TextRun"]>[] = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\((?:https?:[^)]+)\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  const push = (t: string, extra: { bold?: boolean; italics?: boolean; font?: string } = {}) => {
    if (!t) return;
    runs.push(new d.TextRun({ text: t, font: "Calibri", size: base?.size ?? 22, bold: base?.bold, ...extra }));
  };
  while ((m = re.exec(text))) {
    push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith("**")) push(tok.slice(2, -2), { bold: true });
    else if (tok.startsWith("`")) push(tok.slice(1, -1), { font: "Consolas" });
    else if (tok.startsWith("[")) push(tok.slice(1, tok.indexOf("]")));
    else push(tok.slice(1, -1), { italics: true });
    last = m.index + tok.length;
  }
  push(text.slice(last));
  if (runs.length === 0) push(" ");
  return runs;
}

function docxBlocks(d: Docx, md: string) {
  const lines = (md ?? "").replace(/\r\n/g, "\n").split("\n");
  const blocks: (InstanceType<Docx["Paragraph"]> | InstanceType<Docx["Table"]>)[] = [];
  const HEADING_SIZES = [32, 28, 26, 24, 22, 22];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      blocks.push(
        new d.Paragraph({
          text: "",
          border: { bottom: { style: d.BorderStyle.SINGLE, size: 6, color: "D9D9D9", space: 1 } },
        }),
      );
      i++;
      continue;
    }

    const h = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      const level = h[1].length;
      blocks.push(
        new d.Paragraph({
          spacing: { before: 240, after: 120 },
          children: runsFromInline(d, h[2], { bold: true, size: HEADING_SIZES[level - 1] }),
        }),
      );
      i++;
      continue;
    }

    // table
    if (
      trimmed.startsWith("|") &&
      i + 1 < lines.length &&
      /^\s*\|?[\s:|-]+\|?\s*$/.test(lines[i + 1]) &&
      lines[i + 1].includes("-")
    ) {
      const splitRow = (r: string) =>
        r.replace(/^\s*\|/, "").replace(/\|\s*$/, "").split("|").map((c) => c.trim());
      const headers = splitRow(trimmed);
      i += 2;
      const bodyRows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        bodyRows.push(splitRow(lines[i].trim()));
        i++;
      }
      const cols = Math.max(headers.length, ...bodyRows.map((r) => r.length), 1);
      const tableWidth = 9360;
      const colWidth = Math.floor(tableWidth / cols);
      const columnWidths = Array.from({ length: cols }, () => colWidth);
      const border = { style: d.BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
      const borders = { top: border, bottom: border, left: border, right: border };
      const makeRow = (cells: string[], head: boolean) =>
        new d.TableRow({
          children: Array.from({ length: cols }, (_, c) => {
            return new d.TableCell({
              borders,
              width: { size: colWidth, type: d.WidthType.DXA },
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              ...(head ? { shading: { fill: "EFF6FF", type: d.ShadingType.CLEAR, color: "auto" } } : {}),
              children: [
                new d.Paragraph({ children: runsFromInline(d, cells[c] ?? "", { bold: head, size: 20 }) }),
              ],
            });
          }),
        });
      blocks.push(
        new d.Table({
          width: { size: tableWidth, type: d.WidthType.DXA },
          columnWidths,
          rows: [makeRow(headers, true), ...bodyRows.map((r) => makeRow(r, false))],
        }),
      );
      continue;
    }

    // unordered list
    if (/^[-*+]\s+/.test(trimmed)) {
      while (i < lines.length && /^[-*+]\s+/.test(lines[i].trim())) {
        blocks.push(
          new d.Paragraph({
            numbering: { reference: "report-bullets", level: 0 },
            children: runsFromInline(d, lines[i].trim().replace(/^[-*+]\s+/, "")),
          }),
        );
        i++;
      }
      continue;
    }

    // ordered list
    if (/^\d+\.\s+/.test(trimmed)) {
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        blocks.push(
          new d.Paragraph({
            numbering: { reference: "report-numbers", level: 0 },
            children: runsFromInline(d, lines[i].trim().replace(/^\d+\.\s+/, "")),
          }),
        );
        i++;
      }
      continue;
    }

    // paragraph (collect consecutive text lines)
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(#{1,6}\s|[-*+]\s|\d+\.\s|\|)/.test(lines[i].trim())) {
      para.push(lines[i].trim());
      i++;
    }
    blocks.push(
      new d.Paragraph({ spacing: { after: 120 }, children: runsFromInline(d, para.join(" ")) }),
    );
  }

  return blocks;
}

export async function downloadReportAsWord(title: string, markdown: string) {
  const d = await import("docx");
  const doc = new d.Document({
    numbering: {
      config: [
        {
          reference: "report-bullets",
          levels: [
            {
              level: 0,
              format: d.LevelFormat.BULLET,
              text: "\u2022",
              alignment: d.AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 720, hanging: 360 } } },
            },
          ],
        },
        {
          reference: "report-numbers",
          levels: [
            {
              level: 0,
              format: d.LevelFormat.DECIMAL,
              text: "%1.",
              alignment: d.AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 720, hanging: 360 } } },
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: 12240, height: 15840 },
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        children: [
          new d.Paragraph({
            spacing: { after: 80 },
            children: [new d.TextRun({ text: title, bold: true, size: 36, font: "Calibri" })],
          }),
          new d.Paragraph({
            spacing: { after: 240 },
            children: [
              new d.TextRun({
                text: `Generated ${new Date().toLocaleString()}`,
                size: 18,
                color: "64748B",
                font: "Calibri",
              }),
            ],
          }),
          ...docxBlocks(d, markdown),
        ],
      },
    ],
  });

  const blob = await d.Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.docx`;
  a.click();
  URL.revokeObjectURL(url);
}


export function downloadReportAsPdf(title: string, markdown: string) {
  const html = reportDocument(title, markdownToHtml(markdown));
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  // Give the new window a tick to render before invoking the print dialog.
  setTimeout(() => win.print(), 350);
}
