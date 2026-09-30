import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession, ROLE_HOME } from "@/lib/auth";
import { query } from "@/lib/db";

export const metadata = {
  title: "SMK Citra Negara",
  description:
    "Learning Management System SMK Citra Negara. Belajar, berkarya, dan bertumbuh bersama.",
};

const MOTIVASI = [
  {
    judul: "Setiap Hari Adalah Kesempatan",
    teks: "Jangan tunggu waktu yang sempurna. Satu langkah kecil hari ini lebih berharga daripada rencana besar yang tertunda.",
  },
  {
    judul: "Gagal Adalah Bagian dari Proses",
    teks: "Yang membedakan orang berhasil bukan tidak pernah gagal, tetapi tidak pernah menyerah ketika gagal.",
  },
  {
    judul: "Ilmu Itu Kekayaan",
    teks: "Pengetahuan yang kamu kumpulkan hari ini akan menjadi tangga, pekerjaan, dan masa depanmu sendiri.",
  },
  {
    judul: "Konsisten Lebih Kuat dari Motivasi",
    teks: "Motivasi datang dan pergi. Namun kebiasaan belajar yang disiplin adalah jalan paling pasti menuju target.",
  },
  {
    judul: "Bangga dengan Produk Dalam Negeri",
    teks: "Kamu sedang belajar keterampilan yang dibutuhkan dunia kerja. Manfaatkan setiap pelajaran dengan serius.",
  },
  {
    judul: "Yakin pada Kemampuanmu",
    teks: "Kepercayaan diri tumbuh dari latihan dan pengalaman nyata di kelas.",
  },
];

const FITUR = [
  {
    judul: "Materi & Tugas",
    teks: "Akses materi pelajaran, unggah tugas, dan kumpulkan jawaban tepat waktu.",
  },
  {
    judul: "Asesmen & Ujian",
    teks: "Kerjakan latihan dan ujian secara online dengan penilaian otomatis.",
  },
  {
    judul: "Nilai & Absensi",
    teks: "Pantau perkembangan nilai dan kehadiran tanpa harus datang ke kantor.",
  },
  {
    judul: "Pengumuman",
    teks: "Informasi resmi dari sekolah langsung sampai ke akun Anda.",
  },
];

// Angka statistik diambil dari database agar selalu sesuai data sekolah.
async function getStatistik() {
  try {
    const rows = await query(
      `SELECT
         (SELECT COUNT(*) FROM users u
            JOIN roles r ON r.id = u.role_id
           WHERE r.slug = 'siswa' AND u.status = 'aktif') AS siswa,
         (SELECT COUNT(*) FROM kelas) AS kelas,
         (SELECT COUNT(*) FROM mata_pelajaran) AS mapel,
         (SELECT COUNT(*) FROM jurusan) AS jurusan,
         (SELECT COUNT(*) FROM users u
            JOIN roles r ON r.id = u.role_id
           WHERE r.slug = 'guru' AND u.status = 'aktif') AS guru`
    );
    const d = rows[0] || {};
    return {
      siswa: Number(d.siswa) || 0,
      kelas: Number(d.kelas) || 0,
      mapel: Number(d.mapel) || 0,
      jurusan: Number(d.jurusan) || 0,
      guru: Number(d.guru) || 0,
    };
  } catch {
    // Database belum siap / belum terkoneksi, jangan gagalkan halaman.
    return { siswa: 0, kelas: 0, mapel: 0, jurusan: 0, guru: 0 };
  }
}

export default async function Home() {
  const session = await getSession();
  if (session) {
    redirect(ROLE_HOME[session.role] || "/");
  }

  const s = await getStatistik();
  const statistik = [
    [s.siswa.toLocaleString("id-ID"), "Siswa Aktif"],
    [s.kelas.toLocaleString("id-ID"), "Kelas Belajar"],
    [s.mapel.toLocaleString("id-ID"), "Mata Pelajaran"],
    [s.jurusan.toLocaleString("id-ID"), "Program Studi"],
  ];

  return (
    <main className="min-h-screen bg-white text-slate-800">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="brand-gradient flex h-11 w-11 items-center justify-center rounded-xl text-sm font-bold text-white">
              SCN
            </div>
            <div>
              <p className="text-base font-bold text-slate-900">
                SMK Citra Negara
              </p>
              <p className="text-xs text-slate-500">Learning Management System</p>
            </div>
          </div>
          <nav className="flex items-center gap-2">
            <a
              href="#motivasi"
              className="hidden rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 sm:block"
            >
              Motivasi
            </a>
            <a
              href="#fitur"
              className="hidden rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 sm:block"
            >
              Fitur
            </a>
            <Link
              href="/masuk"
              className="brand-gradient rounded-lg px-5 py-2 text-sm font-semibold text-white transition"
            >
              Masuk
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative isolate overflow-hidden bg-slate-900">
        {/* Background foto sekolah */}
        <img
          src="/img/sekolah.jpg"
          alt="Gedung dan lapangan SMK Citra Negara"
          width={1024}
          height={768}
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
        {/* Overlay supaya teks tetap terbaca */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-900/85 via-brand-800/80 to-slate-900/90" />

        <div className="relative mx-auto max-w-6xl px-4 py-24 text-center sm:py-32">
          <span className="inline-block rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-white ring-1 ring-white/30">
            Tahun Ajaran Berjalan
          </span>

          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold leading-tight text-white sm:text-5xl">
            Belajar Lebih Cerdas,{" "}
            <span className="text-brand-200">Tumbuh Setiap Hari</span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-brand-50/90 sm:text-lg">
            Selamat datang di Learning Management System SMK Citra Negara. Semua
            materi, tugas, ujian, dan informasi sekolah tersedia dalam satu tempat
            yang mudah diakses kapan saja dan di mana saja.
          </p>

          <blockquote className="mx-auto mt-8 max-w-2xl border-l-4 border-brand-400 bg-white/10 px-6 py-5 text-left shadow-lg backdrop-blur-sm">
            <p className="text-base italic leading-relaxed text-white">
              &ldquo;Masa depanmu ditentukan oleh apa yang kamu lakukan hari ini,
              bukan besok.&rdquo;
            </p>
            <footer className="mt-2 text-xs font-semibold uppercase tracking-wide text-brand-200">
              SMK Citra Negara
            </footer>
          </blockquote>

          <div className="mt-10 flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/masuk"
              className="brand-gradient w-full rounded-xl px-8 py-3 text-center text-base font-semibold text-white shadow-lg shadow-black/20 transition hover:brightness-110 sm:w-auto"
            >
              Masuk ke Portal
            </Link>
            <a
              href="#fitur"
              className="w-full rounded-xl border border-white/40 bg-white/10 px-8 py-3 text-center text-base font-semibold text-white backdrop-blur-sm transition hover:bg-white/20 sm:w-auto"
            >
              Lihat Fitur
            </a>
          </div>

          <div className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
            {statistik.map(([angka, label]) => (
              <div
                key={label}
                className="rounded-2xl border border-white/25 bg-white/10 px-4 py-6 shadow-lg backdrop-blur-md"
              >
                <p className="text-2xl font-bold text-white sm:text-3xl">
                  {angka}
                </p>
                <p className="mt-1 text-xs font-medium text-brand-100/80 sm:text-sm">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="motivasi"
        className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20"
      >
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-600">
            Semangat
          </p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
            Kata-Kata Motivasi
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600">
            Pengingat untuk tetap semangat menghadapi setiap tantangan di sekolah.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {MOTIVASI.map((m, i) => (
            <article
              key={m.judul}
              className="group rounded-2xl border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-brand-300 hover:shadow-lg"
            >
              <div className="mb-4 flex items-center gap-3">
                <span className="brand-gradient flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="text-base font-bold text-slate-900">{m.judul}</h3>
              </div>
              <p className="text-sm leading-relaxed text-slate-600">{m.teks}</p>
              <div className="mt-4 h-1 w-12 rounded-full bg-brand-500 transition-all duration-300 group-hover:w-24" />
            </article>
          ))}
        </div>

        <div className="mt-12 rounded-2xl bg-slate-900 px-8 py-12 text-center">
          <p className="text-2xl font-bold leading-relaxed text-white sm:text-3xl">
            &ldquo;Kegagalan bukan akhir &mdash; yang penting adalah terus
            mencoba.&rdquo;
          </p>
          <p className="mt-4 text-sm text-slate-400">Semangat belajar, siswa!</p>
        </div>
      </section>

      <section id="fitur" className="scroll-mt-20 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-600">
              Layanan
            </p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
              Fitur Platform
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-600">
              Semua kebutuhan belajar dan administrasi sekolah dalam satu sistem
              yang terintegrasi.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FITUR.map((f) => (
              <div
                key={f.judul}
                className="rounded-2xl border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <h3 className="text-base font-bold text-brand-700">{f.judul}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {f.teks}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="rounded-3xl bg-brand-600 px-8 py-14 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Siap Mulai Belajar Hari Ini?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-brand-50">
            Jangan menunda potensi terbaikmu. Buka akun kamu dan akses seluruh
            materi sekolah kapan saja.
          </p>
          <Link
            href="/masuk"
            className="mt-8 inline-block rounded-xl bg-white px-8 py-3 text-base font-semibold text-brand-700 transition hover:bg-brand-50"
          >
            Masuk Sekarang
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} SMK Citra Negara &mdash; Learning
            Management System
          </p>
          <p className="text-xs text-slate-400">
            Dibangun dengan Next.js + MySQL (Laragon)
          </p>
        </div>
      </footer>
    </main>
  );
}
