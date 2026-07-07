import { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { useAppContext, type HarvestData } from '../../store/AppContext';

const NAMA_BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const BULAN_ID: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, Mei: 4, Jun: 5,
  Jul: 6, Ags: 7, Sep: 8, Okt: 9, Nov: 10, Des: 11,
};

function parseTanggal(s: string): Date | null {
  const m = s.match(/(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})/);
  if (!m) return null;
  const bulan = BULAN_ID[m[2]];
  if (bulan === undefined) return null;
  return new Date(Number(m[3]), bulan, Number(m[1]));
}

function formatRupiah(num: number) {
  return 'Rp ' + num.toLocaleString('id-ID');
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

type Style = Record<string, unknown>;

const thin = { style: 'thin', color: { rgb: 'BFBFBF' } };
const border = { top: thin, bottom: thin, left: thin, right: thin };

const HEADER_STYLE: Style = {
  font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 },
  fill: { fgColor: { rgb: '00A8A8' } },
  alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
  border,
};

const TITLE_STYLE: Style = {
  font: { bold: true, size: 14, color: { rgb: '003333' } },
};

const SUB_STYLE: Style = {
  font: { italic: true, color: { rgb: '666666' }, sz: 10 },
};

const TOTAL_LABEL_STYLE: Style = {
  font: { bold: true },
  fill: { fgColor: { rgb: 'E6F7F7' } },
  border,
  alignment: { horizontal: 'left' },
};

const TOTAL_NUM_STYLE: Style = {
  font: { bold: true },
  fill: { fgColor: { rgb: 'E6F7F7' } },
  border,
  alignment: { horizontal: 'right' },
};

const NUMFMT_TONASE = '0.0';
const NUMFMT_INT = '#,##0';

interface Cell {
  v: string | number;
  s?: Style;
  z?: string;
}

function sheetFromCells(rows: Cell[][], colWidths: { wch: number }[]): XLSX.WorkSheet {
  const ws: XLSX.WorkSheet = {};
  const range = { s: { r: 0, c: 0 }, e: { r: rows.length - 1, c: 0 } };
  let maxC = 0;
  rows.forEach((row, r) => {
    row.forEach((cell, c) => {
      if (c > maxC) maxC = c;
      if (cell === undefined || cell.v === undefined) return;
      const ref = XLSX.utils.encode_cell({ r, c });
      const isNum = typeof cell.v === 'number';
      const o: XLSX.CellObject = { v: cell.v, t: isNum ? 'n' : 's' };
      if (cell.z) o.z = cell.z;
      if (cell.s) o.s = cell.s;
      ws[ref] = o;
    });
  });
  range.e.c = maxC;
  ws['!ref'] = XLSX.utils.encode_range(range);
  ws['!cols'] = colWidths;
  return ws;
}

function triggerXlsxDownload(filename: string, sheets: { name: string; ws: XLSX.WorkSheet; merges?: XLSX.Range[] }[]) {
  const wb = XLSX.utils.book_new();
  sheets.forEach((s) => {
    if (s.merges) s.ws['!merges'] = s.merges;
    XLSX.utils.book_append_sheet(wb, s.ws, s.name);
  });
  const data = XLSX.write(wb, { bookType: 'xlsx', type: 'array', cellStyles: true });
  const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

interface Enriched extends HarvestData {
  totalKg: number;
  investasi: number;
}

type DataType = 'panen' | 'investasi';
type FilterMode = 'day' | 'month' | 'year' | 'all';

interface GroupTotal {
  label: string;
  count: number;
  tonase: number;
  totalKg: number;
  investasi: number;
}

export default function DownloadAdmin() {
  const { harvestData } = useAppContext();
  const [dataType, setDataType] = useState<DataType>('panen');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [filterDate, setFilterDate] = useState(() => {
    const t = new Date();
    return `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`;
  });
  const [filterMonth, setFilterMonth] = useState(() => {
    const t = new Date();
    return `${t.getFullYear()}-${pad(t.getMonth() + 1)}`;
  });
  const [filterYear, setFilterYear] = useState(() => String(new Date().getFullYear()));

  // Enrich harvest data with investment figures
  const enriched = useMemo<Enriched[]>(
    () =>
      harvestData.map((item) => ({
        ...item,
        totalKg: item.tonase * 1000,
        investasi: item.tonase * 1000 * 1000,
      })),
    [harvestData]
  );

  const availableYears = useMemo(() => {
    const set = new Set<number>();
    enriched.forEach((i) => {
      const d = parseTanggal(i.tanggal);
      if (d) set.add(d.getFullYear());
    });
    return Array.from(set).sort((a, b) => b - a);
  }, [enriched]);

  // Filter records sesuai periode
  const filtered = useMemo<Enriched[]>(() => {
    if (filterMode === 'all') return enriched;

    return enriched.filter((item) => {
      const d = parseTanggal(item.tanggal);
      if (!d) return false;
      if (filterMode === 'day') {
        const dSel = new Date(filterDate + 'T00:00:00');
        return (
          d.getFullYear() === dSel.getFullYear() &&
          d.getMonth() === dSel.getMonth() &&
          d.getDate() === dSel.getDate()
        );
      }
      if (filterMode === 'month') {
        const [y, m] = filterMonth.split('-').map(Number);
        return d.getFullYear() === y && d.getMonth() === m - 1;
      }
      if (filterMode === 'year') {
        const y = Number(filterYear || availableYears[0]);
        return d.getFullYear() === y;
      }
      return false;
    });
  }, [enriched, filterMode, filterDate, filterMonth, filterYear, availableYears]);

  // Rincian total per filter (breakdown satu level di bawah filter)
  const groups = useMemo<GroupTotal[]>(() => {
    const map = new Map<string, GroupTotal>();

    const ensure = (label: string): GroupTotal => {
      if (!map.has(label)) {
        map.set(label, { label, count: 0, tonase: 0, totalKg: 0, investasi: 0 });
      }
      return map.get(label)!;
    };

    filtered.forEach((item) => {
      const d = parseTanggal(item.tanggal);
      if (!d) return;
      let label = item.tanggal;
      if (filterMode === 'day') {
        label = item.tanggal;
      } else if (filterMode === 'month') {
        label = `${pad(d.getDate())} ${NAMA_BULAN[d.getMonth()].slice(0, 3)}`;
      } else if (filterMode === 'year') {
        label = NAMA_BULAN[d.getMonth()];
      } else {
        label = String(d.getFullYear());
      }
      const g = ensure(label);
      g.count += 1;
      g.tonase += item.tonase;
      g.totalKg += item.totalKg;
      g.investasi += item.investasi;
    });

    const sorted = Array.from(map.values());
    // Urutkan agar ringkas (tahun & bulan berurutan)
    if (filterMode === 'year') {
      sorted.sort((a, b) => NAMA_BULAN.indexOf(a.label) - NAMA_BULAN.indexOf(b.label));
    } else {
      sorted.sort((a, b) => a.label.localeCompare(b.label));
    }
    return sorted;
  }, [filtered, filterMode]);

  const grand = useMemo<GroupTotal>(() => {
    return filtered.reduce<GroupTotal>(
      (acc, item) => {
        acc.count += 1;
        acc.tonase += item.tonase;
        acc.totalKg += item.totalKg;
        acc.investasi += item.investasi;
        return acc;
      },
      { label: 'TOTAL', count: 0, tonase: 0, totalKg: 0, investasi: 0 }
    );
  }, [filtered]);

  const periodLabel = (() => {
    if (filterMode === 'day') return `Harian - ${filterDate}`;
    if (filterMode === 'month') return `Bulanan - ${filterMonth}`;
    if (filterMode === 'year') return `Tahunan - ${filterYear || availableYears[0] || '-'}`;
    return 'Semua Periode';
  })();

  const handleDownload = () => {
    const isPanen = dataType === 'panen';
    const dataTypeLabel = isPanen ? 'Data Panen' : 'Investasi 1000';
    const safePeriod = periodLabel.replace(/[^\w\-]+/g, '_');
    const filename = `download_${isPanen ? 'panen' : 'investasi1000'}_${safePeriod}.xlsx`;

    // --- Sheet Ringkasan ---
    const sumHeader: Cell[] = [
      { v: 'Periode', s: HEADER_STYLE },
      { v: 'Jumlah Data', s: HEADER_STYLE },
      { v: 'Total Tonase (ton)', s: HEADER_STYLE },
    ];
    if (!isPanen) {
      sumHeader.push({ v: 'Total Kg', s: HEADER_STYLE });
      sumHeader.push({ v: 'Total Investasi (Rp)', s: HEADER_STYLE });
    }

    const sumRows: Cell[][] = [
      [{ v: `RINGKASAN ${dataTypeLabel.toUpperCase()}`, s: TITLE_STYLE }],
      [{ v: `Periode: ${periodLabel}`, s: SUB_STYLE }],
      [{ v: '' }],
      sumHeader,
    ];

    groups.forEach((g) => {
      const row: Cell[] = [
        { v: g.label, s: { border } },
        { v: g.count, s: { border, alignment: { horizontal: 'center' } } },
        { v: Number(g.tonase.toFixed(1)), s: { border, alignment: { horizontal: 'right' } }, z: NUMFMT_TONASE },
      ];
      if (!isPanen) {
        row.push({ v: Math.round(g.totalKg), s: { border, alignment: { horizontal: 'right' } }, z: NUMFMT_INT });
        row.push({ v: Math.round(g.investasi), s: { border, alignment: { horizontal: 'right' } }, z: NUMFMT_INT });
      }
      sumRows.push(row);
    });

    sumRows.push(
      isPanen
        ? [
            { v: 'TOTAL', s: TOTAL_LABEL_STYLE },
            { v: grand.count, s: TOTAL_NUM_STYLE },
            { v: Number(grand.tonase.toFixed(1)), s: { ...TOTAL_NUM_STYLE }, z: NUMFMT_TONASE },
          ]
        : [
            { v: 'TOTAL', s: TOTAL_LABEL_STYLE },
            { v: grand.count, s: TOTAL_NUM_STYLE },
            { v: Number(grand.tonase.toFixed(1)), s: TOTAL_NUM_STYLE, z: NUMFMT_TONASE },
            { v: Math.round(grand.totalKg), s: TOTAL_NUM_STYLE, z: NUMFMT_INT },
            { v: Math.round(grand.investasi), s: TOTAL_NUM_STYLE, z: NUMFMT_INT },
          ]
    );

    const sumWidths = isPanen
      ? [{ wch: 22 }, { wch: 12 }, { wch: 18 }]
      : [{ wch: 22 }, { wch: 12 }, { wch: 18 }, { wch: 14 }, { wch: 18 }];

    const summaryWs = sheetFromCells(sumRows, sumWidths);
    const sumMerges: XLSX.Range[] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: sumWidths.length - 1 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: sumWidths.length - 1 } },
    ];

    // --- Sheet Data Detail ---
    const detHeader: Cell[] = [
      { v: 'No', s: HEADER_STYLE },
      { v: 'Nama Petambak', s: HEADER_STYLE },
      { v: 'Alamat Tambak', s: HEADER_STYLE },
      { v: 'Tonase (ton)', s: HEADER_STYLE },
      { v: 'Size (ekor/kg)', s: HEADER_STYLE },
      { v: 'Tanggal', s: HEADER_STYLE },
    ];
    if (!isPanen) {
      detHeader.splice(5, 0, { v: 'Total Kg', s: HEADER_STYLE });
      detHeader.push({ v: 'Investasi (Rp)', s: HEADER_STYLE });
    }

    const detRows: Cell[][] = [
      [{ v: `DATA DETAIL ${dataTypeLabel.toUpperCase()}`, s: TITLE_STYLE }],
      detHeader,
    ];

    filtered.forEach((item, idx) => {
      if (isPanen) {
        detRows.push([
          { v: idx + 1, s: { border, alignment: { horizontal: 'center' } } },
          { v: item.nama, s: { border } },
          { v: item.alamatTambak, s: { border } },
          { v: Number(item.tonase.toFixed(1)), s: { border, alignment: { horizontal: 'right' } }, z: NUMFMT_TONASE },
          { v: item.size, s: { border, alignment: { horizontal: 'center' } } },
          { v: item.tanggal, s: { border, alignment: { horizontal: 'center' } } },
        ]);
      } else {
        detRows.push([
          { v: idx + 1, s: { border, alignment: { horizontal: 'center' } } },
          { v: item.nama, s: { border } },
          { v: item.alamatTambak, s: { border } },
          { v: Number(item.tonase.toFixed(1)), s: { border, alignment: { horizontal: 'right' } }, z: NUMFMT_TONASE },
          { v: item.size, s: { border, alignment: { horizontal: 'center' } } },
          { v: Math.round(item.totalKg), s: { border, alignment: { horizontal: 'right' } }, z: NUMFMT_INT },
          { v: Math.round(item.investasi), s: { border, alignment: { horizontal: 'right' } }, z: NUMFMT_INT },
          { v: item.tanggal, s: { border, alignment: { horizontal: 'center' } } },
        ]);
      }
    });

    const detWidths = isPanen
      ? [{ wch: 5 }, { wch: 24 }, { wch: 40 }, { wch: 12 }, { wch: 14 }, { wch: 16 }]
      : [{ wch: 5 }, { wch: 24 }, { wch: 36 }, { wch: 12 }, { wch: 14 }, { wch: 12 }, { wch: 18 }, { wch: 16 }];

    const detailWs = sheetFromCells(detRows, detWidths);

    triggerXlsxDownload(filename, [
      { name: 'Ringkasan', ws: summaryWs, merges: sumMerges },
      { name: 'Data Detail', ws: detailWs },
    ]);
  };

  const setMode = (mode: FilterMode) => {
    if (mode === 'year' && availableYears.length && !availableYears.includes(Number(filterYear))) {
      setFilterYear(String(availableYears[0]));
    }
    setFilterMode(mode);
  };

  const dataTypeLabel = dataType === 'panen' ? 'Data Panen' : 'Investasi 1000';

  return (
    <div className="px-4 lg:px-0">
      {/* Header */}
      <div className="mb-4 lg:mb-6">
        <h2 className="text-lg font-bold text-on-surface lg:hidden">Download Data</h2>
        <p className="hidden lg:block text-sm text-on-surface-variant">
          Unduh data {dataTypeLabel} berdasarkan periode harian, bulanan, dan tahunan
        </p>
      </div>

      {/* Pilihan Jenis Data */}
      <div className="flex gap-1 bg-surface-container-high rounded-xl p-1 mb-4">
        {([
          ['panen', 'Data Panen'],
          ['investasi', 'Investasi 1000'],
        ] as const).map(([type, label]) => (
          <button
            key={type}
            onClick={() => setDataType(type)}
            className={`flex-1 py-2.5 rounded-lg text-xs font-medium transition-colors ${
              dataType === type
                ? 'bg-primary text-on-primary-container'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Pilihan Filter Periode */}
      <div className="flex gap-1 bg-surface-container-high rounded-xl p-1 mb-3">
        {([
          ['all', 'Semua'],
          ['day', 'Harian'],
          ['month', 'Bulanan'],
          ['year', 'Tahunan'],
        ] as const).map(([mode, label]) => (
          <button
            key={mode}
            onClick={() => setMode(mode)}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
              filterMode === mode
                ? 'bg-primary text-on-primary-container'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Pemilih periode */}
      {filterMode !== 'all' && (
        <div className="mb-4">
          {filterMode === 'day' && (
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:outline-none focus:border-primary/50 transition-all"
            />
          )}
          {filterMode === 'month' && (
            <input
              type="month"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="w-full bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:outline-none focus:border-primary/50 transition-all"
            />
          )}
          {filterMode === 'year' && (
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="w-full bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:outline-none focus:border-primary/50 transition-all"
            >
              {availableYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Preview Rincian Total */}
      <div className="bg-gradient-to-br from-primary/10 to-transparent rounded-xl p-3 lg:p-4 border border-primary/20 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>
            analytics
          </span>
          <span className="text-sm font-medium text-on-surface">Rincian Total ({periodLabel})</span>
        </div>

        <div className="bg-surface-container rounded-lg border border-outline-variant/20 overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-outline-variant/20 bg-surface-container-high/50 text-on-surface-variant">
                <th className="text-left px-3 py-2 font-semibold">Periode</th>
                <th className="text-center px-3 py-2 font-semibold">Data</th>
                <th className="text-right px-3 py-2 font-semibold">Tonase</th>
                {dataType === 'investasi' && (
                  <th className="text-right px-3 py-2 font-semibold">Investasi</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {groups.map((g) => (
                <tr key={g.label} className="text-on-surface">
                  <td className="px-3 py-2">{g.label}</td>
                  <td className="px-3 py-2 text-center text-on-surface-variant">{g.count}</td>
                  <td className="px-3 py-2 text-right font-semibold">{g.tonase.toFixed(1)}</td>
                  {dataType === 'investasi' && (
                    <td className="px-3 py-2 text-right font-semibold text-primary">
                      {formatRupiah(g.investasi)}
                    </td>
                  )}
                </tr>
              ))}
              {groups.length === 0 && (
                <tr>
                  <td
                    colSpan={dataType === 'investasi' ? 4 : 3}
                    className="px-3 py-4 text-center text-on-surface-variant"
                  >
                    Tidak ada data pada periode ini
                  </td>
                </tr>
              )}
              <tr className="border-t border-outline-variant/30 bg-primary/10 font-bold text-on-surface">
                <td className="px-3 py-2">TOTAL</td>
                <td className="px-3 py-2 text-center">{grand.count}</td>
                <td className="px-3 py-2 text-right">{grand.tonase.toFixed(1)}</td>
                {dataType === 'investasi' && (
                  <td className="px-3 py-2 text-right text-primary">{formatRupiah(grand.investasi)}</td>
                )}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Tombol Download */}
      <button
        onClick={handleDownload}
        disabled={filtered.length === 0}
        className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary-container font-bold py-3 rounded-xl text-sm active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>download</span>
        Download {dataTypeLabel} ({filtered.length} data)
      </button>
      <p className="text-[11px] text-on-surface-variant mt-2 text-center">
        File Excel (.xlsx) dengan 2 sheet: Ringkasan &amp; Data Detail
      </p>
    </div>
  );
}
