// Utilitas unduh rekap nilai ke CSV, Excel, dan PDF.
// Sengaja tanpa library tambahan: Excel memakai format SpreadsheetML 2003
// (dibuka native oleh Excel/LibreOffice) dan PDF memakai dialog cetak
// browser dengan stylesheet cetak sendiri.

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

export function unduhCSV(rows, mapelNama, kelasNama) {
  const escape = (v) => `"${String(v).replace(/"/g, '""')}"`;
  const baris = rows.map((_, i) => sel(rows, i).map(escape).join(","));
  unduhBlob(
    ["\uFEFF" + [KOLOM.join(","), ...baris].join("\r\n")],
    "text/csv;charset=utf-8;",
    namaBerkas(mapelNama, kelasNama, "csv")
  );
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

// PDF: buka jendela cetak berisi tabel berformat, lalu panggil print().
// Browser membuat PDF dari dialog tersebut (pilih "Save as PDF").
export function cetakPDF(rows, mapelNama, kelasNama) {
  const esc = (s) =>
    String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  const kepala = KOLOM.map((k) => `<th>${esc(k)}</th>`).join("");
  const isi = rows
    .map((_, i) => {
      const v = sel(rows, i);
      return (
        "<tr>" +
        v
          .map((nilai, j) => {
            const cls = j === 0 || j >= 4 ? ' class="num"' : "";
            return `<td${cls}>${esc(nilai)}</td>`;
          })
          .join("") +
        "</tr>"
      );
    })
    .join("\n");

  const html = `<!DOCTYPE html>
<html lang="id"><head><meta charset="utf-8">
<title>Nilai ${esc(mapelNama)}</title>
<style>
  @page { size: A4 landscape; margin: 12mm; }
  body { font-family: "Segoe UI", Arial, sans-serif; color: #0f172a; margin: 0; }
  h1 { font-size: 16pt; margin: 0 0 2mm; }
  .sub { font-size: 10pt; color: #475569; margin: 0 0 4mm; }
  table { width: 100%; border-collapse: collapse; font-size: 9.5pt; }
  th, td { border: 1px solid #cbd5e1; padding: 1.6mm 2mm; }
  th { background: #068a57; color: #fff; font-weight: 600; }
  tbody tr:nth-child(even) { background: #f8fafc; }
  td.num { text-align: center; }
  .foot { margin-top: 4mm; font-size: 9pt; color: #64748b; }
</style></head><body>
<h1>Rekap Nilai Siswa</h1>
<p class="sub">Mata Pelajaran: <strong>${esc(mapelNama)}</strong>${kelasNama ? ` &middot; Kelas: <strong>${esc(kelasNama)}</strong>` : " (semua kelas)"} &middot; Jumlah siswa: ${rows.length}</p>
<table><thead><tr>${kepala}</tr></thead>
<tbody>
${isi}
</tbody></table>
<p class="foot">Dicetak pada ${new Date().toLocaleString("id-ID")}</p>
</body></html>`;

  const w = window.open("", "_blank", "width=1000,height=720");
  if (!w) {
    return false;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
  w.focus();
  // Beri waktu browser merender layout sebelum membuka dialog cetak.
  setTimeout(() => {
    w.print();
  }, 400);
  return true;
}
