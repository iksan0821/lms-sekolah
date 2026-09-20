"use client";

export function PageTitle({ title, subtitle }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
    </div>
  );
}

export function Loading({ text = "Memuat data..." }) {
  return <div className="rounded-2xl border-slate-200 bg-white p-10 text-center text-slate-400 shadow-sm">{text}</div>;
}

export function Notice({ msg }) {
  if (!msg) return null;
  const st = { error: "bg-rose-50 text-rose-700", success: "bg-brand-50 text-brand-dark", info: "bg-slate-100 text-slate-600" };
  return <div className={"mb-4 rounded-lg px-4 py-2.5 text-sm " + (st[msg.type] || st.info)}>{msg.text}</div>;
}

export function Modal({ title, onClose, children, wide }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={"max-h-[90vh] w-full overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl " + (wide ? "max-w-2xl" : "max-w-lg")}>
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
      <label className="mb-1 block text-xs font-medium text-slate-600">{label} {required && <span className="text-rose-500">*</span>}</label>
      {children}
    </div>
  );
}

export const inputCls = "w-full rounded-lg border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-500/20";
