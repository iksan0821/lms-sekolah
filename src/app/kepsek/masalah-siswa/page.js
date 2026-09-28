import MasalahSiswa from "@/components/MasalahSiswa";

export const metadata = { title: "Permasalahan Siswa - SMK Citra Negara" };

export default function Page() {
  return (
    <MasalahSiswa
      role="kepsek"
      judul="Permasalahan Siswa"
      subtitle="Catat dan tindakuti masalah siswa yang perlu penanganan lebih lanjut."
    />
  );
}
