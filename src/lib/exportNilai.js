// Utilitas unduh rekap nilai ke Excel dan PDF.
// Excel memakai format SpreadsheetML 2003 (dibuka native oleh Excel/LibreOffice)
// dan PDF dibuat langsung sebagai berkas .pdf memakai jsPDF + jspdf-autotable.

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const KOLOM = [
  "No",
  "Nama Siswa",
  "NIS",
  "Kelas",
  "Tugas",
  "Harian",
  "Ujian",
  "Rata-rata",
];

function namaBerkas(mapelNama, kelasNama, ext) {
  const dasar = kelasNama ? `${mapelNama}_${kelasNama}` : mapelNama;
  return `nilai_${dasar.replace(/[\\/:*?"<>|\s]+/g, "_")}.${ext}`;
}

function sel(rows, i) {
  return [
    i + 1,
    rows[i].siswa ?? "-",
    rows[i].nis || "-",
    rows[i].kelas || "-",
    rows[i].tugas ?? "-",
    rows[i].harian ?? "-",
    rows[i].ujian ?? "-",
    rows[i].rata ?? "-",
  ];
}

function unduhBlob(konten, tipe, nama) {
  const blob = new Blob([konten], { type: tipe });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nama;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// SpreadsheetML 2003: satu sheet dengan baris <Row> dan sel <Cell>.
export function unduhExcel(rows, mapelNama, kelasNama) {
  const esc = (v) =>
    String(v)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  const selBaris = (nilai, bold) => {
    const sel = nilai.map((v) => {
      const angka = v !== "-" && /^-?\d+(\.\d+)?$/.test(String(v));
      const gaya = bold ? ' ss:StyleID="kepala"' : angka ? ' ss:StyleID="angka"' : "";
      return `<Cell${gaya}><Data ss:Type="${angka ? "Number" : "String"}">${esc(v)}</Data></Cell>`;
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
  <Worksheet ss:Name="${esc(mapelNama.slice(0, 28))}">
    <Table>
      <Column ss:Width="45"/>
      <Column ss:Width="200"/>
      <Column ss:Width="90"/>
      <Column ss:Width="90"/>
      <Column ss:Width="65"/>
      <Column ss:Width="65"/>
      <Column ss:Width="65"/>
      <Column ss:Width="80"/>
      ${selBaris(KOLOM, true)}
      ${rows.map((_, i) => selBaris(sel(rows, i), false)).join("\n      ")}
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

  unduhBlob(
    xml,
    "application/vnd.ms-excel;charset=utf-8;",
    namaBerkas(mapelNama, kelasNama, "xls")
  );
}

// PDF: susun dokumen A4 landscape berisi tabel nilai, lalu unduh sebagai berkas .pdf.
export function unduhPDF(rows, mapelNama, kelasNama) {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const lebar = doc.internal.pageSize.getWidth();

  doc.setFontSize(15);
  doc.text("Rekap Nilai Siswa", 40, 42);
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Mata Pelajaran: ${mapelNama}${kelasNama ? `  -  Kelas: ${kelasNama}` : " (semua kelas)"}  -  Jumlah siswa: ${rows.length}`,
    40,
    60
  );

  autoTable(doc, {
    head: [KOLOM],
    body: rows.map((_, i) => sel(rows, i)),
    startY: 76,
    margin: { left: 40, right: 40 },
    styles: { fontSize: 9, cellPadding: 4, textColor: [15, 23, 42], lineColor: [203, 213, 225], lineWidth: 0.5 },
    headStyles: { fillColor: [6, 138, 87], textColor: 255, fontStyle: "bold", halign: "center" },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { halign: "center", cellWidth: 34 },
      1: { cellWidth: 190 },
      2: { halign: "center", cellWidth: 80 },
      3: { halign: "center", cellWidth: 80 },
      4: { halign: "center", cellWidth: 60 },
      5: { halign: "center", cellWidth: 60 },
      6: { halign: "center", cellWidth: 60 },
      7: { halign: "center", cellWidth: 70 },
    },
    didDrawPage: () => {
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(`Dicetak pada ${new Date().toLocaleString("id-ID")}`, 40, doc.internal.pageSize.getHeight() - 24);
    },
  });

  doc.save(namaBerkas(mapelNama, kelasNama, "pdf"));
  return true;
}
