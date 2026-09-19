"use client";

import { useEffect, useState } from "react";

// Hook sederhana untuk mengambil data dari API monitor (read-only)
export function useMonitor(bagian) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let aktif = true;
    setLoading(true);
    fetch(`/api/monitor?bagian=${bagian}`)
      .then((r) => r.json())
      .then((d) => {
        if (!aktif) return;
        if (d.success) setData(d.data);
        else setError(d.message || "Gagal memuat data.");
      })
      .catch(() => aktif && setError("Tidak dapat terhubung ke server."))
      .finally(() => aktif && setLoading(false));
    return () => {
      aktif = false;
    };
  }, [bagian]);

  return { data, loading, error };
}

export function PageTitle({ title, subtitle }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
          Mode Pantau
        </span>
      </div>
      {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
    </div>
  );
}

export function Card({ children, className = "" }) {
  return (
    <div className={`rounded-2xl border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function Loading({ text = "Memuat data..." }) {
  return (
    <div className="rounded-2xl border-slate-200 bg-white p-10 text-center text-slate-400 shadow-sm">
      {text}
    </div>
  );
}

export function Table({ columns, children }) {
  return (
    <div className="overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              {columns.map((c) => (
                <th key={c} className="px-4 py-3 whitespace-nowrap">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">{children}</tbody>
        </table>
      </div>
    </div>
  );
}

export function EmptyRow({ colSpan, text = "Belum ada data." }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-10 text-center text-slate-400">
        {text}
      </td>
    </tr>
  );
}

export function StatusBadge({ status }) {
  const map = {
    selesai: "bg-brand-50 text-brand-dark",
    berlangsung: "bg-amber-100 text-amber-700",
    draft: "bg-slate-100 text-slate-500",
  };
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${map[status] || "bg-slate-100 text-slate-600"}`}>
      {status}
    </span>
  );
}
