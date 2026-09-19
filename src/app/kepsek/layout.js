import MonitorLayout from "@/components/MonitorLayout";

export const metadata = { title: "Dashboard Kepala Sekolah - LMS Sekolah" };

export default function Layout({ children }) {
  return (
    <MonitorLayout role="kepsek" base="/kepsek" title="Kepala Sekolah">
      {children}
    </MonitorLayout>
  );
}
