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

export function downloadReportAsWord(title: string, markdown: string) {
  const html = reportDocument(title, markdownToHtml(markdown));
  const blob = new Blob([html], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.doc`;
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
