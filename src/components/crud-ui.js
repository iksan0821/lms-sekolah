"use client";

// Gaya input global dipakai lewat class .input (lihat crudStyles)
export const inputStyle = {
  width: "100%",
  borderRadius: "0.5rem",
  border: "1px solid #cbd5e1",
  padding: "0.5rem 0.75rem",
  fontSize: "0.875rem",
  outline: "none",
  background: "#fff",
  color: "#1e293b",
};

export function Field({ label, children, required }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-600">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

export function ModalShell({ title, onClose, children, wide }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`max-h-[90vh] w-full overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl ${
          wide ? "max-w-2xl" : "max-w-lg"
        }`}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Tutup"
          >
            X
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Notice({ msg }) {
  if (!msg) return null;
  const ok = msg.type === "success";
  return (
    <div
      className={`mb-4 rounded-lg px-4 py-2.5 text-sm ${
        ok ? "bg-brand-50 text-brand-dark" : "bg-red-50 text-red-700"
      }`}
    >
      {msg.text}
    </div>
  );
}

export function PageHeader({ title, subtitle, actionLabel, onAction }) {
  return (
    <div className="mb-6 flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>
      {actionLabel && (
        <button
          onClick={onAction}
          className="rounded-lg brand-gradient px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-brand/30 transition hover:brightness-110"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

// Tombol aksi standar pada tabel
export function RowActions({ onEdit, onDelete, deleteDisabled }) {
  return (
    <div className="flex justify-end gap-2">
      <button
        onClick={onEdit}
        className="rounded-md border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
      >
        Edit
      </button>
      <button
        onClick={onDelete}
        disabled={deleteDisabled}
        className="rounded-md border-red-100 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Hapus
      </button>
    </div>
  );
}
