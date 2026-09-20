import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

async function requireSiswa() {
  const session = await getSession();
  if (!session || session.role !== "siswa") return null;
  return session;
}

// KIRIM jawaban ujian -> otomatis dinilai
export async function POST(request) {
  const session = await requireSiswa();
  if (!session) return NextResponse.json({ success: false, message: "Akses ditolak." }, { status: 403 });
  try {
    const b = await request.json();
    const { ujian_id, jawaban } = b; // jawaban: { soal_id: 'A'|'B'|'C'|'D' }
    if (!ujian_id || !jawaban || typeof jawaban !== "object") {
      return NextResponse.json({ success: false, message: "Data jawaban tidak lengkap." }, { status: 400 });
    }

    const info = await query("SELECT kelas_id FROM siswa WHERE user_id=?", [session.id]);
    const kelasId = info.length ? info[0].kelas_id : null;

    // Validasi: ujian untuk kelas siswa & bukan draft
    const ujian = await query(
      "SELECT id, jumlah_soal FROM ujian_online WHERE id=? AND kelas_id=? AND status<>'draft'",
      [ujian_id, kelasId]
    );
    if (!ujian.length) {
      return NextResponse.json({ success: false, message: "Ujian tidak tersedia." }, { status: 404 });
    }

    // Ambil kunci jawaban
    const kunci = await query("SELECT id, jawaban_benar FROM soal WHERE ujian_id=?", [ujian_id]);
    if (!kunci.length) {
      return NextResponse.json({ success: false, message: "Ujian belum memiliki soal." }, { status: 400 });
    }

    // Sudah pernah selesai?
    const sudah = await query("SELECT selesai FROM hasil_ujian WHERE ujian_id=? AND siswa_id=?", [ujian_id, session.id]);
    if (sudah.length && sudah[0].selesai) {
      return NextResponse.json({ success: false, message: "Anda sudah mengerjakan ujian ini." }, { status: 400 });
    }

    // Hitung benar & simpan jawaban
    let benar = 0;
    for (const s of kunci) {
      const jawab = jawaban[s.id] || null;
      const isBenar = jawab && jawab === s.jawaban_benar ? 1 : 0;
      if (isBenar) benar++;

      const ada = await query(
        "SELECT id FROM jawaban_siswa WHERE ujian_id=? AND soal_id=? AND siswa_id=?",
        [ujian_id, s.id, session.id]
      );
      if (ada.length) {
        await query("UPDATE jawaban_siswa SET jawaban=?, benar=? WHERE id=?", [jawab, isBenar, ada[0].id]);
      } else {
        await query(
          "INSERT INTO jawaban_siswa (ujian_id, soal_id, siswa_id, jawaban, benar) VALUES (?, ?, ?, ?, ?)",
          [ujian_id, s.id, session.id, jawab, isBenar]
        );
      }
    }

    const total = kunci.length;
    const nilai = Math.round((benar / total) * 100 * 100) / 100;

    // Simpan / update hasil ujian
    const hasilAda = await query("SELECT id FROM hasil_ujian WHERE ujian_id=? AND siswa_id=?", [ujian_id, session.id]);
    if (hasilAda.length) {
      await query(
        "UPDATE hasil_ujian SET jumlah_benar=?, jumlah_soal=?, nilai=?, selesai=1 WHERE id=?",
        [benar, total, nilai, hasilAda[0].id]
      );
    } else {
      await query(
        "INSERT INTO hasil_ujian (ujian_id, siswa_id, jumlah_benar, jumlah_soal, nilai, selesai) VALUES (?, ?, ?, ?, ?, ?)",
        [ujian_id, session.id, benar, total, nilai, 1]
      );
    }

    // Simpan nilai ke tabel nilai (jenis ujian)
    const mapel = await query("SELECT mapel_id FROM ujian_online WHERE id=?", [ujian_id]);
    const mapelId = mapel.length ? mapel[0].mapel_id : null;
    const sudahNilai = await query(
      "SELECT id FROM nilai WHERE siswa_id=? AND mapel_id=? AND jenis='ujian' AND kelas_id=?",
      [session.id, mapelId, kelasId]
    );
    if (sudahNilai.length) {
      await query("UPDATE nilai SET nilai=? WHERE id=?", [nilai, sudahNilai[0].id]);
    } else {
      await query(
        "INSERT INTO nilai (siswa_id, mapel_id, kelas_id, jenis, nilai) VALUES (?, ?, ?, ?, ?)",
        [session.id, mapelId, kelasId, "ujian", nilai]
      );
    }

    return NextResponse.json({
      success: true,
      message: "Jawaban terkirim. Nilai Anda: " + nilai,
      data: { benar, total, nilai },
    });
  } catch (e) {
    console.error("Submit ujian error:", e);
    return NextResponse.json({ success: false, message: "Gagal mengirim jawaban." }, { status: 500 });
  }
}
