import MasalahSiswa from "@/components/MasalahSiswa";

export const metadata = { title: "Permasalahan Siswa - SMK Citra Negara" };

export default function Page() {
  return (
    <MasalahSiswa
      role="kurikulum"
      judul="Permasalahan Siswa"
      subtitle="Pantau masalah siswa terkait nilai dan pembelajaran, lalu tentukan tindak lanjutnya."
    />
  );
}
