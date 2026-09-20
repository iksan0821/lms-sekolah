import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

async function requireSiswa() {
  const session = await getSession();
  if (!session || session.role !== "siswa") return null;
  return session;
}

// KIRIM / UPDATE pengumpulan tugas (pilih: link atau file/PDF)
export async function POST(request) {
  const session = await requireSiswa();
  if (!session) return NextResponse.json({ success: false, message: "Akses ditolak." }, { status: 403 });
  try {
    const b = await request.json();
    const { tugas_id, tipe_pengumpulan, file_url, jawaban_teks } = b;

    if (!tugas_id) {
      return NextResponse.json({ success: false, message: "Tugas tidak dipilih." }, { status: 400 });
    }
    if (!["link", "file"].includes(tipe_pengumpulan)) {
      return NextResponse.json({ success: false, message: "Pilih metode pengumpulan (link atau file)." }, { status: 400 });
    }
    if (!file_url || !file_url.trim()) {
      return NextResponse.json(
        { success: false, message: tipe_pengumpulan === "link" ? "Link wajib diisi." : "Nama file / link file wajib diisi." },
        { status: 400 }
      );
    }

    // Validasi tugas untuk kelas siswa
    const info = await query("SELECT kelas_id FROM siswa WHERE user_id=?", [session.id]);
    const kelasId = info.length ? info[0].kelas_id : null;
    const tugas = await query("SELECT id, mapel_id FROM tugas WHERE id=? AND kelas_id=?", [tugas_id, kelasId]);
    if (!tugas.length) {
      return NextResponse.json({ success: false, message: "Tugas tidak ditemukan." }, { status: 404 });
    }

    const ada = await query("SELECT id FROM pengumpulan_tugas WHERE tugas_id=? AND siswa_id=?", [tugas_id, session.id]);
    if (ada.length) {
      await query(
        "UPDATE pengumpulan_tugas SET tipe_pengumpulan=?, file_url=?, jawaban_teks=?, status='dikumpul', catatan_guru=NULL WHERE id=?",
        [tipe_pengumpulan, file_url, jawaban_teks || null, ada[0].id]
      );
      return NextResponse.json({ success: true, message: "Pengumpulan tugas diperbarui." });
    }

    await query(
      "INSERT INTO pengumpulan_tugas (tugas_id, siswa_id, tipe_pengumpulan, file_url, jawaban_teks, status) VALUES (?, ?, ?, ?, ?, ?)",
      [tugas_id, session.id, tipe_pengumpulan, file_url, jawaban_teks || null, "dikumpul"]
    );

    // Perbarui hitungan jumlah_terkumpul pada tugas
    const jml = await query("SELECT COUNT(*) AS n FROM pengumpulan_tugas WHERE tugas_id=?", [tugas_id]);
    await query("UPDATE tugas SET jumlah_terkumpul=? WHERE id=?", [jml[0].n, tugas_id]);

    return NextResponse.json({ success: true, message: "Tugas berhasil dikumpulkan." });
  } catch (e) {
    console.error("Submit tugas error:", e);
    return NextResponse.json({ success: false, message: "Gagal mengumpulkan tugas." }, { status: 500 });
  }
}
