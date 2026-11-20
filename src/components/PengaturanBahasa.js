"use client";

import { BAHASA, useBahasa } from "@/lib/i18n";

// Kartu pengaturan bahasa, dipasang di halaman Pengaturan
export default function PengaturanBahasa() {
  const { bahasa, ubahBahasa, t } = useBahasa();

  return (
    <div className="mt-6 rounded-2xl border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-1 text-sm font-bold uppercase tracking-wide text-slate-500">
        {t("bahasa")}
      </h2>
      <p className="mb-4 text-sm text-slate-400">
        {t("pilih bahasa tampilan aplikasi")}
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {BAHASA.map((b) => (
          <button
            key={b.kode}
            type="button"
            onClick={() => ubahBahasa(b.kode)}
            className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition ${
              b.kode === bahasa
                ? "border-brand bg-brand-50 font-semibold text-brand-dark shadow-sm"
                : "border-slate-200 text-slate-700 hover:border-brand-300 hover:bg-slate-50"
            }`}
          >
            <span className="text-lg">{b.bendera}</span>
            <span className="flex-1">{b.label}</span>
            {b.kode === bahasa && (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
