"use client";

import { useEffect, useState } from "react";

// Hook ambil data dari API guru
export function useGuru(bagian, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  function load() {
    setLoading(true);
    fetch(`/api/guru?bagian=${bagian}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setData(d.data); else setError(d.message); })
      .catch(() => setError("Tidak dapat terhubung ke server."))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error, reload: load };
}

export function PageTitle({ title, subtitle, action, onAction }) {
  return (
    <div className="mb-6 flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action && (
        <button onClick={onAction} className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600">
          {action}
        </button>
      )}
    </div>
  );
}

export function Card({ children, className = "" }) {
  return <div className={`rounded-2xl border-slate-200 bg-white p-5 shadow-sm ${className}`}>{children}</div>;
}

export function Loading({ text = "Memuat data..." }) {
  return <div className="rounded-2xl border-slate-200 bg-white p-10 text-center text-slate-400 shadow-sm">{text}</div>;
}

export function Notice({ msg, onClose }) {
  if (!msg) return null;
  const st = { error: "bg-rose-50 text-rose-700", success: "bg-brand-50 text-brand-dark", info: "bg-slate-100 text-slate-600" };
  return (
    <div className={`mb-4 flex items-center justify-between rounded-lg px-4 py-2.5 text-sm ${st[msg.type] || st.info}`}>
      <span>{msg.text}</span>
      {onClose && <button onClick={onClose} className="text-xs opacity-60 hover:opacity-100">Tutup</button>}
    </div>
  );
}

export function Table({ columns, children }) {
  return (
    <div className="overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>{columns.map((c) => <th key={c} className="px-4 py-3 whitespace-nowrap">{c}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">{children}</tbody>
        </table>
      </div>
    </div>
  );
}

export function EmptyRow({ colSpan, text = "Belum ada data." }) {
  return <tr><td colSpan={colSpan} className="px-4 py-10 text-center text-slate-400">{text}</td></tr>;
}

export function Modal({ title, onClose, children, wide }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`max-h-[90vh] w-full overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl ${wide ? "max-w-2xl" : "max-w-lg"}`}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">{title}</h2>
          <button onClick={onClose} className="rounded-lg px-2 py-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600" aria-label="Tutup">X</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Field({ label, required, children }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-600">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
    </div>
  );
}

export const inputCls = "w-full rounded-lg border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-500/20";

export function RowActions({ onEdit, onDelete }) {
  return (
    <div className="flex justify-end gap-2">
      <button onClick={onEdit} className="rounded-md border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">Edit</button>
      <button onClick={onDelete} className="rounded-md border-rose-100 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50">Hapus</button>
    </div>
  );
}

export const STATUS_ABSEN = {
  hadir: { label: "Hadir", cls: "bg-brand-50 text-brand-dark", solid: "bg-brand text-white" },
  izin: { label: "Izin", cls: "bg-amber-100 text-amber-700", solid: "bg-amber-500 text-white" },
  sakit: { label: "Sakit", cls: "bg-sky-100 text-sky-700", solid: "bg-sky-500 text-white" },
  alpa: { label: "Alpa", cls: "bg-rose-100 text-rose-700", solid: "bg-rose-500 text-white" },
};
