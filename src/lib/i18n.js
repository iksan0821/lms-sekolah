"use client";

import { useEffect, useState, useCallback } from "react";

// Daftar bahasa yang tersedia
export const BAHASA = [
  { kode: "id", label: "Indonesia", bendera: "\u{1F1EE}\u{1F1E9}" },
  { kode: "en", label: "English", bendera: "\u{1F1EC}\u{1F1E7}" },
];

// Kamus terjemahan menu & teks umum per role
// Kunci = label asli (Indonesia) huruf kecil
const KAMUS = {
  id: {
    // Umum
    dashboard: "Dashboard",
    keluar: "Keluar",
    menu: "Menu",
    tutup: "Tutup",
    bahasa: "Bahasa",
    "pilih bahasa tampilan aplikasi": "Pilih bahasa tampilan aplikasi",
    // Dashboard & teks umum
    "selamat datang": "Selamat datang",
    "memuat data": "Memuat data...",
    "belum ada data": "Belum ada data.",
    "belum ada aktivitas": "Belum ada aktivitas.",
    edit: "Edit",
    hapus: "Hapus",
    simpan: "Simpan",
    // Admin
    "total pengguna": "Total Pengguna",
    "semua role": "Semua role",
    "total kelas": "Total Kelas",
    "kelas aktif": "Kelas aktif",
    "mata pelajaran": "Mata Pelajaran",
    terdaftar: "Terdaftar",
    guru: "Guru",
    pengajar: "Pengajar",
    "kelola pengguna": "Kelola Pengguna",
    "distribusi pengguna per role": "Distribusi Pengguna per Role",
    "aktivitas terbaru": "Aktivitas Terbaru",
    orang: "orang",
    // Guru
    "kelas diajar": "Kelas Diajar",
    "total siswa": "Total Siswa",
    materi: "Materi",
    tugas: "Tugas",
    "ujian / latihan": "Ujian / Latihan",
    "rekap absensi": "Rekap Absensi",
    hadir: "Hadir",
    izin: "Izin",
    sakit: "Sakit",
    alpa: "Alpa",
    // Siswa
    "total tugas": "Total Tugas",
    "ujian tersedia": "Ujian Tersedia",
    "tugas dikumpul": "Tugas Dikumpul",
    "rata nilai": "Rata Nilai",
    "rekap kehadiran": "Rekap Kehadiran",
    // Monitor
    "ujian online": "Ujian Online",
    "ujian aktif": "Ujian Aktif",
    // Pengaturan
    "pengaturan sistem": "Pengaturan Sistem",
    "atur identitas sekolah, tahun ajaran, dan semester": "Atur identitas sekolah, tahun ajaran, dan semester.",
    "identitas sekolah, tahun ajaran, dan semester aktif": "Identitas sekolah, tahun ajaran, dan semester aktif.",
    "nama sekolah": "Nama Sekolah",
    alamat: "Alamat",
    "tahun ajaran aktif": "Tahun Ajaran Aktif",
    "semester aktif": "Semester Aktif",
    "memuat pengaturan": "Memuat pengaturan...",
    menyimpan: "Menyimpan...",
    "simpan pengaturan": "Simpan Pengaturan",
    "informasi aplikasi": "Informasi Aplikasi",
    // Admin
    "manajemen user": "Manajemen User",
    "data siswa": "Data Siswa",
    "data guru": "Data Guru",
    kelas: "Kelas",
    jurusan: "Jurusan",
    "mata pelajaran": "Mata Pelajaran",
    "monitor pembelajaran": "Monitor Pembelajaran",
    "pantau akun": "Pantau Akun",
    "riwayat aktivitas": "Riwayat Aktivitas",
    laporan: "Laporan",
    pengumuman: "Pengumuman",
    pengaturan: "Pengaturan",
    "backup & pemulihan": "Backup & Pemulihan",
    "panel administrator": "Panel Administrator",
    // Guru
    "siswa di kelas saya": "Siswa di Kelas Saya",
    absensi: "Absensi",
    asesmen: "Asesmen",
    "upload materi": "Upload Materi",
    "latihan soal / ujian": "Latihan Soal / Ujian",
    "download nilai": "Download Nilai",
    "panel guru": "Panel Guru",
    // Siswa
    "tugas / proyek": "Tugas / Proyek",
    "panel siswa": "Panel Siswa",
    // Monitor (kepsek/kurikulum)
    "kinerja guru": "Kinerja Guru",
    "tugas & materi": "Tugas & Materi",
    "pantau ujian online": "Pantau Ujian Online",
    "pantau jadwal pelajaran": "Pantau Jadwal Pelajaran",
    "permasalahan siswa": "Permasalahan Siswa",
    "mode pantau": "Mode Pantau",
  },
  en: {
    dashboard: "Dashboard",
    keluar: "Log out",
    menu: "Menu",
    tutup: "Close",
    bahasa: "Language",
    "pilih bahasa tampilan aplikasi": "Choose the application display language",
    // Dashboard & common text
    "selamat datang": "Welcome",
    "memuat data": "Loading data...",
    "belum ada data": "No data yet.",
    "belum ada aktivitas": "No recent activity.",
    edit: "Edit",
    hapus: "Delete",
    simpan: "Save",
    // Admin
    "total pengguna": "Total Users",
    "semua role": "All roles",
    "total kelas": "Total Classes",
    "kelas aktif": "Active classes",
    terdaftar: "Registered",
    guru: "Teachers",
    pengajar: "Teaching",
    "kelola pengguna": "Manage Users",
    "distribusi pengguna per role": "User Distribution per Role",
    "aktivitas terbaru": "Recent Activity",
    orang: "people",
    // Guru
    "kelas diajar": "Classes Taught",
    "total siswa": "Total Students",
    materi: "Materials",
    tugas: "Assignments",
    "ujian / latihan": "Exams / Exercises",
    "rekap absensi": "Attendance Summary",
    hadir: "Present",
    izin: "Excused",
    sakit: "Sick",
    alpa: "Absent",
    // Siswa
    "total tugas": "Total Assignments",
    "ujian tersedia": "Available Exams",
    "tugas dikumpul": "Submitted Assignments",
    "rata nilai": "Average Score",
    "rekap kehadiran": "Attendance Summary",
    // Monitor
    "ujian online": "Online Exams",
    "ujian aktif": "Active Exams",
    // Pengaturan
    "pengaturan sistem": "System Settings",
    "atur identitas sekolah, tahun ajaran, dan semester": "Set school identity, academic year, and semester.",
    "identitas sekolah, tahun ajaran, dan semester aktif": "School identity, academic year, and active semester.",
    "nama sekolah": "School Name",
    alamat: "Address",
    "tahun ajaran aktif": "Active Academic Year",
    "semester aktif": "Active Semester",
    "memuat pengaturan": "Loading settings...",
    menyimpan: "Saving...",
    "simpan pengaturan": "Save Settings",
    "informasi aplikasi": "Application Information",
    "manajemen user": "User Management",
    "data siswa": "Student Data",
    "data guru": "Teacher Data",
    kelas: "Classes",
    jurusan: "Majors",
    "mata pelajaran": "Subjects",
    "monitor pembelajaran": "Learning Monitor",
    "pantau akun": "Account Oversight",
    "riwayat aktivitas": "Activity History",
    laporan: "Reports",
    pengumuman: "Announcements",
    pengaturan: "Settings",
    "backup & pemulihan": "Backup & Recovery",
    "panel administrator": "Administrator Panel",
    "siswa di kelas saya": "Students in My Class",
    absensi: "Attendance",
    asesmen: "Assessment",
    "upload materi": "Upload Materials",
    "latihan soal / ujian": "Exercises / Exams",
    "download nilai": "Download Grades",
    "panel guru": "Teacher Panel",
    "tugas / proyek": "Assignments / Projects",
    "panel siswa": "Student Panel",
    "kinerja guru": "Teacher Performance",
    "tugas & materi": "Assignments & Materials",
    "pantau ujian online": "Online Exam Monitor",
    "pantau jadwal pelajaran": "Schedule Monitor",
    "permasalahan siswa": "Student Issues",
    "mode pantau": "Monitor Mode",
  },
};

const KUNCI_PENYIMPANAN = "lms_bahasa";
const PEMANTAU_SIFAR = new Set();

// Hook bahasa aktif (client-side)
export function useBahasa() {
  // Baca pilihan tersimpan saat state pertama kali dibuat (client-side).
  // Fungsi pembaca dipisah agar tidak double-read.
  const baca = useCallback(() => {
    if (typeof window === "undefined") return "id";
    const simpan = window.localStorage.getItem(KUNCI_PENYIMPANAN);
    return simpan && KAMUS[simpan] ? simpan : "id";
  }, []);

  const [kode, setKode] = useState(baca);

  // Sinkron saat tab lain mengubah bahasa, dan setelah mount
  useEffect(() => {
    const sinkron = () => setKode(baca());
    window.addEventListener("storage", sinkron);
    window.addEventListener("lms:bahasa", sinkron);
    return () => {
      window.removeEventListener("storage", sinkron);
      window.removeEventListener("lms:bahasa", sinkron);
    };
  }, [baca]);

  const ubah = useCallback(
    (k) => {
      if (!KAMUS[k]) return;
      window.localStorage.setItem(KUNCI_PENYIMPANAN, k);
      setKode(k);
      // Beri tahu semua komponen lain agar ikut berubah
      window.dispatchEvent(new Event("lms:bahasa"));
    },
    []
  );

  const t = useCallback(
    (teks) => KAMUS[kode]?.[String(teks).toLowerCase()] || teks,
    [kode]
  );

  return { bahasa: kode, ubahBahasa: ubah, t };
}

// Ambil label terjemahan langsung (tanpa hook)
export function ambilLabel(bahasa, label) {
  return KAMUS[bahasa]?.[String(label).toLowerCase()] || label;
}
