import "server-only";

// CSV for US Excel / Google Sheets / email-tool imports: "," separator,
// "." decimals, UTF-8 BOM, CRLF line endings.

type Cell = string | number | boolean | null | undefined;

const escape = (cell: Cell) => {
  if (cell === null || cell === undefined) return "";
  const s = String(cell);
  // Quote when needed; neutralize formulas (=, +, -, @) against CSV injection.
  const isNumber = /^[+-]?[\d.,]+$/.test(s);
  const safe = /^[=+\-@]/.test(s) && !isNumber ? `'${s}` : s;
  return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};

export function toCsv(headers: string[], rows: Cell[][]) {
  const lines = [headers, ...rows].map((row) => row.map(escape).join(","));
  return `﻿${lines.join("\r\n")}\r\n`;
}

/** "2026-10-12 14:05" in UTC (unambiguous for imports). */
export const csvDate = (date: Date | null | undefined) => (date ? date.toISOString().slice(0, 16).replace("T", " ") : "");

export function csvResponseHeaders(filenamePrefix: string) {
  const day = new Date().toISOString().slice(0, 10);
  return {
    "Content-Type": "text/csv; charset=utf-8",
    "Content-Disposition": `attachment; filename="${filenamePrefix}-${day}.csv"`,
    "Cache-Control": "no-store",
  };
}
