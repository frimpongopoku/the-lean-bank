import { format } from "date-fns";
import { saveAs } from "file-saver";

const stamp = () => format(new Date(), "yyyy-MM-dd_HHmm");

const csvCell = (v) => {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function downloadCSV(name, headers, rows) {
  const body = [headers, ...rows].map((r) => r.map(csvCell).join(",")).join("\n");
  saveAs(new Blob([body], { type: "text/csv;charset=utf-8;" }), `${name}-${stamp()}.csv`);
}

export async function downloadPDF(name, title, headers, rows) {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text(title, 14, 16);
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(`Exported ${format(new Date(), "d MMM yyyy, HH:mm")}`, 14, 22);
  autoTable(doc, {
    head: [headers],
    body: rows.map((r) => r.map((c) => (c === null || c === undefined ? "" : String(c)))),
    startY: 27,
    styles: { fontSize: 9, cellPadding: 2.5 },
    headStyles: { fillColor: [19, 21, 24], textColor: 240 },
    alternateRowStyles: { fillColor: [246, 247, 248] },
  });
  doc.save(`${name}-${stamp()}.pdf`);
}
