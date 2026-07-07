import { useState, useMemo } from 'react';
import { useAppContext } from '../store/AppContext';

const ITEMS_PER_PAGE = 10;

function formatRupiah(num: number) {
  return 'Rp ' + num.toLocaleString('id-ID');
}

const BULAN_ID: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, Mei: 4, Jun: 5,
  Jul: 6, Ags: 7, Sep: 8, Okt: 9, Nov: 10, Des: 11,
};

// Mengubah "10 Okt 2023" -> Date
function parseTanggal(s: string): Date | null {
  const m = s.match(/(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})/);
  if (!m) return null;
  const bulan = BULAN_ID[m[2]];
  if (bulan === undefined) return null;
  return new Date(Number(m[3]), bulan, Number(m[1]));
}

type FilterMode = 'all' | 'day' | 'month' | 'year';

export default function Investasi1000Page() {
  const { harvestData } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [filterDate, setFilterDate] = useState(() => {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
  });
  const [filterMonth, setFilterMonth] = useState(() => {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}`;
  });
  const [filterYear, setFilterYear] = useState(() => String(new Date().getFullYear()));

  // Convert tonase -> kg & investasi (1 kg = Rp 1.000)
  const investmentData = useMemo(() => {
    return harvestData.map((item) => ({
      ...item,
      totalKg: item.tonase * 1000,
      investasi: item.tonase * 1000 * 1000,
    }));
  }, [harvestData]);

  // Tahun yang tersedia (untuk filter tahun)
  const availableYears = useMemo(() => {
    const set = new Set<number>();
    investmentData.forEach((i) => {
      const d = parseTanggal(i.tanggal);
      if (d) set.add(d.getFullYear());
    });
    return Array.from(set).sort((a, b) => b - a);
  }, [investmentData]);

  const filteredData = useMemo(() => {
    let data = investmentData;

    if (searchQuery) {
      data = data.filter(
        (item) =>
          item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.alamatTambak.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterMode !== 'all') {
      const year = filterMode === 'year' ? Number(filterYear || availableYears[0]) : null;
      const [my, mm] = filterMode === 'month' ? filterMonth.split('-').map(Number) : [0, 0];
      const dSel =
        filterMode === 'day' ? new Date(filterDate + 'T00:00:00') : null;

      data = data.filter((item) => {
        const d = parseTanggal(item.tanggal);
        if (!d) return false;
        if (filterMode === 'day' && dSel) {
          return (
            d.getFullYear() === dSel.getFullYear() &&
            d.getMonth() === dSel.getMonth() &&
            d.getDate() === dSel.getDate()
          );
        }
        if (filterMode === 'month') {
          return d.getFullYear() === my && d.getMonth() === mm - 1;
        }
        if (filterMode === 'year' && year) {
          return d.getFullYear() === year;
        }
        return false;
      });
    }

    return data;
  }, [investmentData, searchQuery, filterMode, filterDate, filterMonth, filterYear, availableYears]);

  // Totals (mengikuti filter)
  const totalInvestasi = filteredData.reduce((sum, item) => sum + item.investasi, 0);
  const totalTonase = filteredData.reduce((sum, item) => sum + item.tonase, 0);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const setMode = (mode: FilterMode) => {
    if (mode === 'year' && availableYears.length && !availableYears.includes(Number(filterYear))) {
      setFilterYear(String(availableYears[0]));
    }
    setFilterMode(mode);
    setCurrentPage(1);
  };

  const periodLabel =
    filterMode === 'day'
      ? `Periode: ${filterDate}`
      : filterMode === 'month'
      ? `Periode: ${filterMonth}`
      : filterMode === 'year'
      ? `Periode: ${filterYear || availableYears[0] || '-'}`
      : 'Menampilkan semua periode';

  return (
    <div className="px-4 mt-4 pb-6">
      <h2 className="text-xl font-bold text-on-surface mb-2">Investasi 1000</h2>
      <p className="text-xs text-on-surface-variant mb-4">
        Program kontribusi Rp 1.000 per kg hasil panen untuk pengembangan bersama
      </p>

      {/* Filter Periode */}
      <div className="flex gap-1 bg-surface-container-high rounded-xl p-1 mb-3">
        {([
          ['all', 'Semua'],
          ['day', 'Hari'],
          ['month', 'Bulan'],
          ['year', 'Tahun'],
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

      {filterMode !== 'all' && (
        <div className="mb-3">
          {filterMode === 'day' && (
            <input
              type="date"
              value={filterDate}
              onChange={(e) => { setFilterDate(e.target.value); setCurrentPage(1); }}
              className="w-full bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:outline-none focus:border-primary/50 transition-all"
            />
          )}
          {filterMode === 'month' && (
            <input
              type="month"
              value={filterMonth}
              onChange={(e) => { setFilterMonth(e.target.value); setCurrentPage(1); }}
              className="w-full bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:outline-none focus:border-primary/50 transition-all"
            />
          )}
          {filterMode === 'year' && (
            <select
              value={filterYear}
              onChange={(e) => { setFilterYear(e.target.value); setCurrentPage(1); }}
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

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 mb-2">
        <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl p-4 border border-primary/20">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>
              account_balance_wallet
            </span>
            <span className="text-xs text-on-surface-variant">Total Investasi</span>
          </div>
          <p className="text-lg font-bold text-on-surface">{formatRupiah(totalInvestasi)}</p>
        </div>
        <div className="bg-gradient-to-br from-secondary/20 to-secondary/5 rounded-xl p-4 border border-secondary/20">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-secondary" style={{ fontSize: '20px' }}>
              scale
            </span>
            <span className="text-xs text-on-surface-variant">Total Tonase</span>
          </div>
          <p className="text-lg font-bold text-on-surface">
            {totalTonase.toFixed(1)} <span className="text-sm font-normal text-on-surface-variant">ton</span>
          </p>
        </div>
      </div>

      <p className="text-[11px] text-on-surface-variant mb-4">{periodLabel}</p>

      {/* Info Card */}
      <div className="bg-surface-container rounded-xl border border-outline-variant/20 p-3 mb-4">
        <div className="flex items-start gap-2">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px' }}>info</span>
          <div className="flex-1">
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Setiap <span className="text-primary font-semibold">1 kg</span> hasil panen dikontribusikan sebesar{' '}
              <span className="text-primary font-semibold">Rp 1.000</span> untuk program Investasi 1000.
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <span
          className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant/50"
          style={{ fontSize: '20px' }}
        >
          search
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          className="w-full bg-surface-container border border-outline-variant/30 rounded-xl pl-10 pr-4 py-2.5 text-on-surface text-sm focus:outline-none focus:border-primary/50 transition-all placeholder:text-on-surface-variant/40"
          placeholder="Cari nama atau alamat..."
        />
      </div>

      {/* Data List */}
      <div className="space-y-3">
        {paginatedData.map((item) => (
          <div
            key={item.id}
            className="bg-surface-container rounded-xl border border-outline-variant/20 overflow-hidden"
          >
            <div className="p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 text-primary rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                      person
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-on-surface text-sm">{item.nama}</p>
                    <p className="text-[11px] text-on-surface-variant">{item.tanggal}</p>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-2 mb-3 bg-surface-container-high/50 rounded-lg p-2.5">
                <span
                  className="material-symbols-outlined text-on-surface-variant/70 flex-shrink-0 mt-0.5"
                  style={{ fontSize: '16px' }}
                >
                  location_on
                </span>
                <p className="text-xs text-on-surface-variant leading-relaxed">{item.alamatTambak}</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-surface-container-lowest rounded-lg p-2.5 border border-outline-variant/10">
                  <p className="text-[9px] text-on-surface-variant uppercase tracking-wider mb-0.5">Tonase</p>
                  <p className="text-sm font-bold text-on-surface">
                    {item.tonase} <span className="text-[10px] font-normal text-on-surface-variant">ton</span>
                  </p>
                </div>
                <div className="bg-surface-container-lowest rounded-lg p-2.5 border border-outline-variant/10">
                  <p className="text-[9px] text-on-surface-variant uppercase tracking-wider mb-0.5">Total Kg</p>
                  <p className="text-sm font-bold text-on-surface">
                    {item.totalKg.toLocaleString('id-ID')} <span className="text-[10px] font-normal text-on-surface-variant">kg</span>
                  </p>
                </div>
                <div className="bg-primary/10 rounded-lg p-2.5 border border-primary/20">
                  <p className="text-[9px] text-primary uppercase tracking-wider mb-0.5">Investasi</p>
                  <p className="text-sm font-bold text-primary">
                    {formatRupiah(item.investasi)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-outline-variant/20">
          <p className="text-xs text-on-surface-variant">
            Halaman {currentPage} dari {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-container-high text-on-surface disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chevron_left</span>
              Prev
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-on-primary-container disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
            >
              Next
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chevron_right</span>
            </button>
          </div>
        </div>
      )}

      {filteredData.length === 0 && (
        <div className="text-center py-12 text-on-surface-variant">
          <span className="material-symbols-outlined text-4xl mb-2 block opacity-30">inbox</span>
          <p className="text-sm">
            {searchQuery || filterMode !== 'all'
              ? 'Tidak ada data pada filter ini'
              : 'Belum ada data investasi'}
          </p>
        </div>
      )}
    </div>
  );
}
