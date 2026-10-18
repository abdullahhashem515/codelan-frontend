// The admin stores article bodies in a plain <textarea> — there is no rich text
// editor and no HTML, so a body arrives as text with newlines in it. Rendering
// that raw collapses every paragraph into one wall of text.
//
// This parses the few conventions a person naturally types in a textarea into
// blocks. Anything it does not recognise stays a paragraph, so a body written
// with no structure at all still reads correctly — the markers are an option,
// never a requirement.
//
//   ## Heading          →  h2
//   ### Heading         →  h3
//   - item  /  * item   →  unordered list
//   1. item             →  ordered list
//   > quote             →  blockquote
//   | a | b |           →  table (a --- separator row is the header rule)
//   ```code```          →  code block
//   blank line          →  paragraph break
//
// Inline `code` and **bold** are handled by renderInline at display time.

const HEADING   = /^(#{2,3})\s+(.*)$/;
const BULLET    = /^[-*]\s+(.*)$/;
const NUMBERED  = /^\d+[.)]\s+(.*)$/;
const QUOTE     = /^>\s?(.*)$/;
const TABLE_ROW = /^\|(.*)\|\s*$/;
// A separator row is the ---|--- line under a table header; it carries no data.
const TABLE_SEP = /^[\s|:-]+$/;
const FENCE     = /^```/;

export const parseArticle = (raw) => {
  if (!raw || typeof raw !== 'string') return [];

  // Normalise the line endings a Windows admin panel may submit.
  const lines = raw.replace(/\r\n?/g, '\n').split('\n');
  const blocks = [];
  let para = [];
  let list = null;      // { ordered, items: [] }
  let code = null;      // string[] while inside a fence
  let table = null;     // { head: string[]|null, rows: string[][] }

  const flushPara = () => {
    if (para.length) { blocks.push({ type: 'p', text: para.join(' ').trim() }); para = []; }
  };
  const flushList = () => {
    if (list) { blocks.push({ type: 'ul', ordered: list.ordered, items: list.items }); list = null; }
  };
  const flushTable = () => {
    if (table && (table.head || table.rows.length)) {
      blocks.push({ type: 'table', head: table.head, rows: table.rows });
    }
    table = null;
  };
  const flushAll = () => { flushPara(); flushList(); flushTable(); };

  const splitRow = (inner) => inner.split('|').map(c => c.trim());

  for (const line of lines) {
    if (code !== null) {
      if (FENCE.test(line.trim())) { blocks.push({ type: 'code', text: code.join('\n') }); code = null; }
      else code.push(line);
      continue;
    }
    if (FENCE.test(line.trim())) { flushAll(); code = []; continue; }

    const t = line.trim();

    if (t === '') { flushAll(); continue; }

    const h = t.match(HEADING);
    if (h) { flushAll(); blocks.push({ type: h[1].length === 2 ? 'h2' : 'h3', text: h[2].trim() }); continue; }

    const tr = t.match(TABLE_ROW);
    if (tr) {
      flushPara(); flushList();
      if (!table) table = { head: null, rows: [] };
      if (TABLE_SEP.test(tr[1]) && table.rows.length === 1 && !table.head) {
        // The row above the separator was the header, not data.
        table.head = table.rows.pop();
      } else if (!TABLE_SEP.test(tr[1])) {
        table.rows.push(splitRow(tr[1]));
      }
      continue;
    }
    flushTable();

    const q = t.match(QUOTE);
    if (q) { flushAll(); blocks.push({ type: 'quote', text: q[1].trim() }); continue; }

    const b = t.match(BULLET);
    const n = t.match(NUMBERED);
    if (b || n) {
      flushPara();
      const ordered = Boolean(n);
      // A switch between bullet and numbered starts a new list rather than
      // silently mixing the two under the first marker seen.
      if (list && list.ordered !== ordered) flushList();
      if (!list) list = { ordered, items: [] };
      list.items.push((b ? b[1] : n[1]).trim());
      continue;
    }

    flushList();
    para.push(t);
  }

  // An unterminated fence is still content — keep it rather than dropping it.
  if (code !== null && code.length) blocks.push({ type: 'code', text: code.join('\n') });
  flushAll();

  return blocks;
};

// Splits a line into runs so `code` and **bold** can be styled. Returns
// [{ text, code?, bold? }]. Unmatched markers are left as literal characters.
export const parseInline = (text) => {
  const out = [];
  const re = /`([^`]+)`|\*\*([^*]+)\*\*/g;
  let last = 0, m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push({ text: text.slice(last, m.index) });
    if (m[1] !== undefined) out.push({ text: m[1], code: true });
    else out.push({ text: m[2], bold: true });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last) });
  return out.length ? out : [{ text }];
};

// Arabic averages ~180 wpm; English ~230. The backend has no reading_time
// field, so this stands in for it rather than leaving the slot blank.
export const readingMinutes = (raw, ar) => {
  const words = String(raw ?? '').trim().split(/\s+/).filter(Boolean).length;
  if (!words) return 0;
  return Math.max(1, Math.round(words / (ar ? 180 : 230)));
};

// Falls back to the opening of the body when the admin left the excerpt empty,
// which is the case for every post currently published.
export const deriveExcerpt = (excerpt, content, limit = 180) => {
  if (excerpt && excerpt.trim()) return excerpt.trim();
  // Only prose — a heading, a code listing or a bullet fragment reads as noise
  // in a card summary, so the excerpt is built from paragraphs alone.
  const plain = parseArticle(content)
    .filter(b => b.type === 'p')
    .map(b => b.text)
    .join(' ')
    .replace(/[`*]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!plain) return '';
  if (plain.length <= limit) return plain;
  const cut = plain.slice(0, limit);
  const sp = cut.lastIndexOf(' ');
  return (sp > limit * 0.6 ? cut.slice(0, sp) : cut).trim() + '…';
};
