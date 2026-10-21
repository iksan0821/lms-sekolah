// Utilitas ekspor laporan ke Excel dan PDF (generik, header & baris apa saja).
// Excel memakai format SpreadsheetML 2003 (dibuka native oleh Excel/LibreOffice),
// PDF dibuat memakai jsPDF + jspdf-autotable.

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

function unduhBlob(konten, tipe, nama) {
  const blob = new Blob(["\uFEFF" + konten], { type: tipe });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nama;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function namaBerkas(judul, ext) {
  return `${judul.replace(/[\\/:*?"<>|\s]+/g, "_").toLowerCase()}_${Date.now()}.${ext}`;
}

const esc = (v) =>
  String(v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

/** Ekspor ke Excel (.xls SpreadsheetML). headers: array string; rows: array of array. */
export function unduhLaporanExcel(judul, headers, rows) {
  const selBaris = (nilai, bold) => {
    const sel = nilai.map((v) => {
      const teks = v == null || v === "" ? "-" : String(v);
      const angka = !bold && teks !== "-" && /^-?\d+(\.\d+)?$/.test(teks);
      const gaya = bold ? ' ss:StyleID="kepala"' : angka ? ' ss:StyleID="angka"' : "";
      return `<Cell${gaya}><Data ss:Type="${angka ? "Number" : "String"}">${esc(teks)}</Data></Cell>`;
    });
    return `<Row>${sel.join("")}</Row>`;
  };

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:x="urn:schemas-microsoft-com:office:excel"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Styles>
    <Style ss:ID="Default" ss:Name="Normal">
      <Alignment ss:Vertical="Center"/>
      <Font ss:FontName="Calibri" ss:Size="11"/>
    </Style>
    <Style ss:ID="kepala">
      <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
      <Interior ss:Color="#068A57" ss:Pattern="Solid"/>
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
    </Style>
    <Style ss:ID="angka">
      <NumberFormat ss:Format="0.##"/>
      <Alignment ss:Horizontal="Center"/>
    </Style>
  </Styles>
  <Worksheet ss:Name="${esc(judul.slice(0, 28))}">
    <Table>
      ${selBaris(headers, true)}
      ${rows.map((r) => selBaris(r, false)).join("\n      ")}
    </Table>
    <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
      <FreezePanes/>
      <FrozenNoSplit/>
      <SplitHorizontal>1</SplitHorizontal>
      <TopRowBottomPane>1</TopRowBottomPane>
      <ActivePane>2</ActivePane>
    </WorksheetOptions>
  </Worksheet>
</Workbook>`;

  unduhBlob(xml, "application/vnd.ms-excel;charset=utf-8;", namaBerkas(judul, "xls"));
}

/** Ekspor ke PDF (A4 landscape, tabel otomatis). */
export function unduhLaporanPDF(judul, headers, rows) {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });

  doc.setFontSize(15);
  doc.text(judul, 40, 42);
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text(`Jumlah baris: ${rows.length}`, 40, 60);

  autoTable(doc, {
    head: [headers],
    body: rows.map((r) => r.map((v) => (v == null || v === "" ? "-" : String(v)))),
    startY: 76,
    margin: { left: 40, right: 40 },
    styles: { fontSize: 8, cellPadding: 4, textColor: [15, 23, 42], lineColor: [203, 213, 225], lineWidth: 0.5 },
    headStyles: { fillColor: [6, 138, 87], textColor: 255, fontStyle: "bold", halign: "center" },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    didDrawPage: () => {
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(
        `Dicetak pada ${new Date().toLocaleString("id-ID")}`,
        40,
        doc.internal.pageSize.getHeight() - 24
      );
    },
  });

  doc.save(namaBerkas(judul, "pdf"));
  return true;
}
