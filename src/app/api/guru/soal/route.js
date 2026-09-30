import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

async function requireGuru() {
  const session = await getSession();
  if (!session || session.role !== "guru") return null;
  return session;
}

async function ownUjian(ujianId, guruId) {
  const r = await query("SELECT id FROM ujian_online WHERE id=? AND guru_id=?", [ujianId, guruId]);
  return r.length > 0;
}

async function ownTugas(tugasId, guruId) {
  const r = await query("SELECT id FROM tugas WHERE id=? AND guru_id=?", [tugasId, guruId]);
  return r.length > 0;
}

async function syncJumlahSoal(ujianId) {
  const n = await query("SELECT COUNT(*) AS n FROM soal WHERE ujian_id=?", [ujianId]);
  await query("UPDATE ujian_online SET jumlah_soal=? WHERE id=?", [n[0].n, ujianId]);
  return n[0].n;
}

async function syncJumlahSoalTugas(tugasId) {
  const n = await query("SELECT COUNT(*) AS n FROM soal WHERE tugas_id=?", [tugasId]);
  await query("UPDATE tugas SET jumlah_soal=? WHERE id=?", [n[0].n, tugasId]);
  return n[0].n;
}

function validasiSoal(b) {
  if (!b.pertanyaan || !b.pertanyaan.trim()) return "Pertanyaan wajib diisi.";
  if (!b.pilihan_a || !b.pilihan_b || !b.pilihan_c || !b.pilihan_d) return "Semua pilihan (A, B, C, D) wajib diisi.";
  if (!["A", "B", "C", "D"].includes(b.jawaban_benar)) return "Jawaban benar harus salah satu dari A, B, C, atau D.";
  return null;
}

export async function POST(request) {
  const session = await requireGuru();
  if (!session) return NextResponse.json({ success: false, message: "Akses ditolak." }, { status: 403 });
  try {
    const b = await request.json();
    const indukUjian = b.ujian_id || null;
    const indukTugas = b.tugas_id || null;
    if (!indukUjian && !indukTugas) {
      return NextResponse.json({ success: false, message: "Ujian atau tugas tidak dipilih." }, { status: 400 });
    }
    const err = validasiSoal(b);
    if (err) return NextResponse.json({ success: false, message: err }, { status: 400 });
    if (indukUjian && !(await ownUjian(indukUjian, session.id))) {
      return NextResponse.json({ success: false, message: "Ujian tidak ditemukan." }, { status: 404 });
    }
    if (indukTugas && !(await ownTugas(indukTugas, session.id))) {
      return NextResponse.json({ success: false, message: "Tugas tidak ditemukan." }, { status: 404 });
    }
    const r = await query(
      "INSERT INTO soal (ujian_id, tugas_id, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, jawaban_benar) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [indukUjian, indukTugas, b.pertanyaan, b.pilihan_a, b.pilihan_b, b.pilihan_c, b.pilihan_d, b.jawaban_benar]
    );
    const total = indukTugas ? await syncJumlahSoalTugas(indukTugas) : await syncJumlahSoal(indukUjian);
    return NextResponse.json({ success: true, message: "Soal ditambahkan. Total soal: " + total + ".", id: r.insertId, jumlah_soal: total });
  } catch (e) {
    console.error("Create soal error:", e);
    return NextResponse.json({ success: false, message: "Gagal menambah soal." }, { status: 500 });
  }
}

export async function PUT(request) {
  const session = await requireGuru();
  if (!session) return NextResponse.json({ success: false, message: "Akses ditolak." }, { status: 403 });
  try {
    const b = await request.json();
    if (!b.id) return NextResponse.json({ success: false, message: "ID soal tidak ada." }, { status: 400 });
    const err = validasiSoal(b);
    if (err) return NextResponse.json({ success: false, message: err }, { status: 400 });
    const so = await query("SELECT ujian_id, tugas_id FROM soal WHERE id=?", [b.id]);
    if (!so.length) {
      return NextResponse.json({ success: false, message: "Soal tidak ditemukan." }, { status: 404 });
    }
    const punyaUjian = so[0].ujian_id ? await ownUjian(so[0].ujian_id, session.id) : false;
    const punyaTugas = so[0].tugas_id ? await ownTugas(so[0].tugas_id, session.id) : false;
    if (!punyaUjian && !punyaTugas) {
      return NextResponse.json({ success: false, message: "Soal tidak ditemukan." }, { status: 404 });
    }
    await query(
      "UPDATE soal SET pertanyaan=?, pilihan_a=?, pilihan_b=?, pilihan_c=?, pilihan_d=?, jawaban_benar=? WHERE id=?",
      [b.pertanyaan, b.pilihan_a, b.pilihan_b, b.pilihan_c, b.pilihan_d, b.jawaban_benar, b.id]
    );
    if (so[0].tugas_id) await syncJumlahSoalTugas(so[0].tugas_id);
    if (so[0].ujian_id) await syncJumlahSoal(so[0].ujian_id);
    return NextResponse.json({ success: true, message: "Soal diperbarui." });
  } catch (e) {
    console.error("Update soal error:", e);
    return NextResponse.json({ success: false, message: "Gagal memperbarui soal." }, { status: 500 });
  }
}

export async function DELETE(request) {
  const session = await requireGuru();
  if (!session) return NextResponse.json({ success: false, message: "Akses ditolak." }, { status: 403 });
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const so = await query("SELECT ujian_id, tugas_id FROM soal WHERE id=?", [id]);
    if (!so.length) {
      return NextResponse.json({ success: false, message: "Soal tidak ditemukan." }, { status: 404 });
    }
    const punyaUjian = so[0].ujian_id ? await ownUjian(so[0].ujian_id, session.id) : false;
    const punyaTugas = so[0].tugas_id ? await ownTugas(so[0].tugas_id, session.id) : false;
    if (!punyaUjian && !punyaTugas) {
      return NextResponse.json({ success: false, message: "Soal tidak ditemukan." }, { status: 404 });
    }
    await query("DELETE FROM soal WHERE id=?", [id]);
    if (so[0].tugas_id) await syncJumlahSoalTugas(so[0].tugas_id);
    if (so[0].ujian_id) await syncJumlahSoal(so[0].ujian_id);
    return NextResponse.json({ success: true, message: "Soal dihapus." });
  } catch (e) {
    console.error("Delete soal error:", e);
    return NextResponse.json({ success: false, message: "Gagal menghapus soal." }, { status: 500 });
  }
}
