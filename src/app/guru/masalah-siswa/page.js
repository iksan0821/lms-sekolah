import MasalahSiswa from "@/components/MasalahSiswa";

export const metadata = { title: "Permasalahan Siswa - SMK Citra Negara" };

export default function Page() {
  return (
    <MasalahSiswa
      role="guru"
      judul="Permasalahan Siswa"
      subtitle="Catat dan tindakuti masalah siswa di kelas yang Anda ajar."
    />
  );
}
