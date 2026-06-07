import * as XLSX from 'xlsx';

// =============================================================
// Parse a CSV or XLSX File (from <input type="file">) into an
// array of row objects keyed by header name.
//
// • First row of the sheet is treated as headers.
// • Headers are lower-cased and whitespace-collapsed so the form's
//   accepted-column names stay forgiving ("School Name", "school_name",
//   "School name" all map to "school_name").
// • Empty rows are dropped.
// • All values come back as trimmed strings — the caller coerces to
//   booleans / numbers as needed.
// =============================================================

export type SheetRow = Record<string, string>;

function normaliseHeader(h: string): string {
  return h
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
}

export async function parseSheet(file: File): Promise<SheetRow[]> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: 'array' });
  const sheetName = wb.SheetNames[0];
  if (!sheetName) return [];
  const ws = wb.Sheets[sheetName];

  // Get raw rows as arrays so we control header normalisation.
  const aoa = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, blankrows: false, defval: '' });
  if (aoa.length === 0) return [];

  const rawHeaders = (aoa[0] as unknown[]).map((h) => String(h ?? ''));
  const headers = rawHeaders.map(normaliseHeader);

  const rows: SheetRow[] = [];
  for (let i = 1; i < aoa.length; i++) {
    const r = aoa[i] as unknown[];
    const obj: SheetRow = {};
    let hasValue = false;
    headers.forEach((h, idx) => {
      if (!h) return;
      const v = String(r[idx] ?? '').trim();
      obj[h] = v;
      if (v !== '') hasValue = true;
    });
    if (hasValue) rows.push(obj);
  }
  return rows;
}

// Truthy detector for boolean-ish columns: "yes", "y", "true", "1", "x".
export function parseBoolish(s: string | undefined): boolean {
  if (!s) return false;
  return /^(y(es)?|true|1|x)$/i.test(s.trim());
}

// Trigger a browser download for an in-memory CSV string.
export function downloadCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    a.remove();
    URL.revokeObjectURL(url);
  }, 0);
}

/**
 * Build and download an .xlsx file. `rows` is an array of arrays — first
 * row is treated as the header row. The resulting file has one sheet
 * called "Template".
 */
export function downloadXlsx(
  filename: string,
  rows: (string | number | boolean | null)[][],
  sheetName: string = 'Template',
) {
  const ws = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, filename);
}

// Escape a single CSV cell.
export function csvCell(s: string | number | boolean | null | undefined): string {
  if (s === null || s === undefined) return '';
  const str = String(s);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
