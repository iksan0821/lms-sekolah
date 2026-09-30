"use client";

// Grafik batang kehadiran harian, digambar dengan SVG supaya
// tidak perlu library grafik tambahan.

const WARNA = {
  hadir: "#068a57",
  izin: "#f59e0b",
  sakit: "#0ea5e9",
  alpa: "#e11d48",
};

export default function GrafikAbsensi({ data, onPilih, terpilih }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-slate-200 text-sm text-slate-400">
        Belum ada data absensi pada rentang ini.
      </div>
    );
  }

  const lebar = 900;
  const tinggi = 300;
  const padKiri = 44;
  const padBawah = 46;
  const padAtas = 16;
  const lebarPlot = lebar - padKiri - 16;
  const tinggiPlot = tinggi - padBawah - padAtas;

  const max = Math.max(4, ...data.map((d) => Number(d.total) || 0));
  const skalaY = (n) => tinggi - padBawah - (n / max) * tinggiPlot;
  const lebarSlot = lebarPlot / data.length;
  const lebarBatang = Math.max(4, Math.min(22, lebarSlot * 0.68));

  // Garis bantu(sumbu Y)
  const garisY = [];
  for (let i = 0; i <= 4; i++) {
    const nilai = Math.round((max / 4) * i);
    const y = skalaY(nilai);
    garisY.push(
      <g key={i}>
        <line x1={padKiri} y1={y} x2={lebar - 16} y2={y} stroke="#e2e8f0" strokeWidth={1} />
        <text x={padKiri - 8} y={y + 4} textAnchor="end" fontSize={11} fill="#94a3b8">
          {nilai}
        </text>
      </g>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${lebar} ${tinggi}`}
        className="min-w-full"
        style={{ height: 300 }}
        role="img"
        aria-label="Grafik kehadiran harian"
      >
        {garisY}

        {data.map((d, i) => {
          const cx = padKiri + lebarSlot * i + lebarSlot / 2;
          const tgl = String(d.tanggal);
          const aktif = terpilih === tgl;

          // Tumpuk batang: hadir (bawah), lalu izin, sakit, alpa di atasnya.
          let kumulatif = 0;
          const batang = ["hadir", "izin", "sakit", "alpa"].map((kunci) => {
            const nilai = Number(d[kunci]) || 0;
            if (nilai === 0) return null;
            const tinggiBatang = (nilai / max) * tinggiPlot;
            const y = skalaY(kumulatif + nilai);
            kumulatif += nilai;
            return (
              <rect
                key={kunci}
                x={cx - lebarBatang / 2}
                y={y}
                width={lebarBatang}
                height={Math.max(2, tinggiBatang)}
                rx={2}
                fill={WARNA[kunci]}
                opacity={aktif ? 1 : 0.85}
              />
            );
          });

          return (
            <g
              key={tgl}
              onClick={() => onPilih && onPilih(tgl)}
              className={onPilih ? "cursor-pointer" : undefined}
            >
              {/* Area klik dibuat lebar agar mudah disentuh di hp */}
              <rect
                x={padKiri + lebarSlot * i}
                y={padAtas}
                width={lebarSlot}
                height={tinggi - padBawah - padAtas}
                fill="transparent"
              />
              {aktif && (
                <rect
                  x={padKiri + lebarSlot * i}
                  y={padAtas}
                  width={lebarSlot}
                  height={tinggi - padBawah - padAtas}
                  fill="#068a57"
                  opacity={0.08}
                />
              )}
              {batang}
              <text
                x={cx}
                y={tinggi - padBawah + 16}
                textAnchor="middle"
                fontSize={11}
                fill={aktif ? "#057046" : "#94a3b8"}
                fontWeight={aktif ? 700 : 400}
              >
                {tgl.slice(8, 10)}/{tgl.slice(5, 7)}
              </text>
              <text
                x={cx}
                y={tinggi - padBawah + 30}
                textAnchor="middle"
                fontSize={10}
                fill="#cbd5e1"
              >
                {tgl.slice(0, 4)}
              </text>
            </g>
          );
        })}

        {/* Sumbu X */}
        <line
          x1={padKiri}
          y1={tinggi - padBawah}
          x2={lebar - 16}
          y2={tinggi - padBawah}
          stroke="#cbd5e1"
          strokeWidth={1}
        />
      </svg>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-600">
        {[
          ["hadir", "Hadir"],
          ["izin", "Izin"],
          ["sakit", "Sakit"],
          ["alpa", "Alpa"],
        ].map(([kunci, label]) => (
          <span key={kunci} className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: WARNA[kunci] }}
            />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
