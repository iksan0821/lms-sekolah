"use client";

import { useState, useRef, useEffect } from "react";
import { BAHASA, useBahasa } from "@/lib/i18n";

export default function PengalihBahasa() {
  const { bahasa, ubahBahasa, t } = useBahasa();
  const [buka, setBuka] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function klikLuar(e) {
      if (ref.current && !ref.current.contains(e.target)) setBuka(false);
    }
    document.addEventListener("mousedown", klikLuar);
    return () => document.removeEventListener("mousedown", klikLuar);
  }, []);

  const aktif = BAHASA.find((b) => b.kode === bahasa) || BAHASA[0];

  return (
    <div ref={ref} className="relative px-5 pb-2">
      <button
        onClick={() => setBuka((v) => !v)}
        className="flex w-full items-center gap-2 rounded-xl bg-white/10 px-3 py-2.5 text-sm font-medium text-white/90 transition hover:bg-white/20"
        aria-label={t("bahasa")}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        <span className="flex-1 text-left">{t("bahasa")}</span>
        <span>
          {aktif.bendera} {aktif.kode.toUpperCase()}
        </span>
      </button>

      {buka && (
        <div className="absolute bottom-full left-5 right-5 z-10 mb-1 overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-slate-200">
          {BAHASA.map((b) => (
            <button
              key={b.kode}
              onClick={() => {
                ubahBahasa(b.kode);
                setBuka(false);
              }}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-slate-50 ${
                b.kode === bahasa
                  ? "bg-brand-50 font-semibold text-brand-dark"
                  : "text-slate-700"
              }`}
            >
              <span>{b.bendera}</span>
              <span>{b.label}</span>
              {b.kode === bahasa && (
                <svg
                  className="ml-auto"
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
      )}
    </div>
  );
}
