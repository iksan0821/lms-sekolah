import MonitorLayout from "@/components/MonitorLayout";

export const metadata = { title: "Dashboard Kurikulum - SMK Citra Negara" };

export default function Layout({ children }) {
  return (
    <MonitorLayout role="kurikulum" base="/kurikulum" title="Kurikulum">
      {children}
    </MonitorLayout>
  );
}
