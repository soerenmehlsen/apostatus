/**
 * Client-side CSV export helpers tuned for Danish Excel:
 * - semicolon (`;`) field separator (Excel's default list separator in da-DK)
 * - comma decimal separator for numbers
 * - UTF-8 with a BOM so æ/ø/å render correctly when opened in Excel
 */

/** Format a number with a Danish comma decimal separator (no thousand grouping). */
export function csvNumber(value: number, decimals = 2): string {
  return value.toFixed(decimals).replace(".", ",");
}

function escapeCell(cell: string | number): string {
  const text = String(cell ?? "");
  return /[";\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** Build a CSV string from a header row and data rows. */
export function toCsv(
  header: string[],
  rows: (string | number)[][]
): string {
  return [header, ...rows]
    .map((row) => row.map(escapeCell).join(";"))
    .join("\r\n");
}

/** Trigger a browser download of `csv` as `filename`. */
export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob(["﻿" + csv], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
