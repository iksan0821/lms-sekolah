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

// KIRIM jawaban soal pilihan ganda milik tugas (bisa banyak soal sekaligus).
// Dipisahkan dari pengumpulan link/file supaya kedua cara tidak saling menimpa.
export async function PUT(request) {
  const session = await requireSiswa();
  if (!session) return NextResponse.json({ success: false, message: "Akses ditolak." }, { status: 403 });
  try {
    const b = await request.json();
    const { tugas_id, jawaban } = b; // jawaban: { soal_id: 'A'|'B'|'C'|'D' }
    if (!tugas_id || !jawaban || typeof jawaban !== "object") {
      return NextResponse.json({ success: false, message: "Data jawaban tidak lengkap." }, { status: 400 });
    }

    const info = await query("SELECT kelas_id FROM siswa WHERE user_id=?", [session.id]);
    const kelasId = info.length ? info[0].kelas_id : null;

    const tugas = await query(
      "SELECT id, mapel_id, kelas_id FROM tugas WHERE id=? AND kelas_id=?",
      [tugas_id, kelasId]
    );
    if (!tugas.length) {
      return NextResponse.json({ success: false, message: "Tugas tidak ditemukan." }, { status: 404 });
    }

    // Hanya soal milik tugas ini yang boleh dijawab, supaya siswa tidak
    // bisa mengirim soal_id milik tugas lain.
    const kunci = await query("SELECT id, jawaban_benar FROM soal WHERE tugas_id=?", [tugas_id]);
    if (!kunci.length) {
      return NextResponse.json({ success: false, message: "Tugas ini belum memiliki soal." }, { status: 400 });
    }

    // Upsert per soal:czyść dulu jawaban lama agar soal yang dihapus guru
    // tidak menyisakan data, lalu tulis ulang yang dikirim.
    await query(
      "DELETE FROM jawaban_siswa WHERE tugas_id=? AND siswa_id=?",
      [tugas_id, session.id]
    );

    let benar = 0;
    for (const s of kunci) {
      const jawab = ["A", "B", "C", "D"].includes(jawaban[s.id]) ? jawaban[s.id] : null;
      const isBenar = jawab && jawab === s.jawaban_benar ? 1 : 0;
      if (isBenar) benar++;
      await query(
        "INSERT INTO jawaban_siswa (ujian_id, tugas_id, soal_id, siswa_id, jawaban, benar) VALUES (NULL, ?, ?, ?, ?, ?)",
        [tugas_id, s.id, session.id, jawab, isBenar]
      );
    }

    const total = kunci.length;
    const nilai = Math.round((benar / total) * 100 * 100) / 100;

    // Tandai sudah dikerjakan dengan tetap menghormati pengumpulan yang sudah ada.
    const ada = await query("SELECT id, status FROM pengumpulan_tugas WHERE tugas_id=? AND siswa_id=?", [tugas_id, session.id]);
    if (ada.length) {
      if (ada[0].status !== "dinilai") {
        await query("UPDATE pengumpulan_tugas SET status='dikumpul' WHERE id=?", [ada[0].id]);
      }
    } else {
      await query(
        "INSERT INTO pengumpulan_tugas (tugas_id, siswa_id, tipe_pengumpulan, jawaban_teks, status) VALUES (?, ?, 'link', ?, 'dikumpul')",
        [tugas_id, session.id, "Menjawab " + benar + " dari " + total + " soal dengan benar."]
      );
      const jml = await query("SELECT COUNT(*) AS n FROM pengumpulan_tugas WHERE tugas_id=?", [tugas_id]);
      await query("UPDATE tugas SET jumlah_terkumpul=? WHERE id=?", [jml[0].n, tugas_id]);
    }

    return NextResponse.json({
      success: true,
      message: "Jawaban terkirim. Nilai Anda: " + nilai,
      data: { benar, total, nilai },
    });
  } catch (e) {
    console.error("Submit jawaban tugas error:", e);
    return NextResponse.json({ success: false, message: "Gagal mengirim jawaban." }, { status: 500 });
  }
}
