import MonitorLayout from "@/components/MonitorLayout";

export const metadata = { title: "Dashboard Kurikulum - LMS Sekolah" };

export default function Layout({ children }) {
  return (
    <MonitorLayout role="kurikulum" base="/kurikulum" title="Kurikulum">
      {children}
    </MonitorLayout>
  );
}
