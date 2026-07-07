import { useState, useMemo } from 'react';
import { useAppContext } from '../store/AppContext';

const ITEMS_PER_PAGE = 10;

function formatRupiah(num: number) {
  return 'Rp ' + num.toLocaleString('id-ID');
}

export default function Investasi1000Page() {
  const { harvestData } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate investment: 1 kg = Rp 1.000, so 1 ton = 1000 kg = Rp 1.000.000
  const investmentData = useMemo(() => {
    return harvestData.map((item) => ({
      ...item,
      totalKg: item.tonase * 1000, // Convert ton to kg
      investasi: item.tonase * 1000 * 1000, // 1 kg = Rp 1000
    }));
  }, [harvestData]);

  // Filter data
  const filteredData = useMemo(() => {
    if (!searchQuery) return investmentData;
    return investmentData.filter(
      (item) =>
        item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.alamatTambak.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [investmentData, searchQuery]);

  // Calculate totals
  const totalInvestasi = filteredData.reduce((sum, item) => sum + item.investasi, 0);
  const totalTonase = filteredData.reduce((sum, item) => sum + item.tonase, 0);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="px-4 mt-4 pb-6">
      <h2 className="text-xl font-bold text-on-surface mb-2">Investasi 1000</h2>
      <p className="text-xs text-on-surface-variant mb-4">
        Program kontribusi Rp 1.000 per kg hasil panen untuk pengembangan bersama
      </p>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 mb-4">
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
          <p className="text-lg font-bold text-on-surface">{totalTonase.toFixed(1)} <span className="text-sm font-normal text-on-surface-variant">ton</span></p>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-surface-container rounded-xl border border-outline-variant/20 p-3 mb-4">
        <div className="flex items-start gap-2">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px' }}>info</span>
          <div className="flex-1">
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Setiap <span className="text-primary font-semibold">1 kg</span> hasil panen dikontribusikan sebesar <span className="text-primary font-semibold">Rp 1.000</span> untuk program Investasi 1000.
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
            {searchQuery ? 'Tidak ada data yang cocok' : 'Belum ada data investasi'}
          </p>
        </div>
      )}
    </div>
  );
}
