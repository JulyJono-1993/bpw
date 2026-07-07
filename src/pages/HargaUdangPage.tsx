import { useState } from 'react';
import { useAppContext } from '../store/AppContext';

const ITEMS_PER_PAGE = 10;

function formatRupiah(num: number) {
  return 'Rp ' + num.toLocaleString('id-ID');
}

export default function HargaUdangPage() {
  const { shrimpPrices } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter data
  const filteredData = shrimpPrices.filter((item) =>
    item.namaBuyer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Calculate average price
  const avgPrice = filteredData.length > 0
    ? filteredData.reduce((sum, item) => sum + item.hargaStandar, 0) / filteredData.length
    : 0;

  return (
    <div className="px-4 mt-4 pb-6">
      <h2 className="text-xl font-bold text-on-surface mb-2">Harga Udang</h2>
      <p className="text-xs text-on-surface-variant mb-4">
        Daftar harga standar dari buyer yang terdaftar
      </p>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl p-4 border border-primary/20">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>
              store
            </span>
            <span className="text-xs text-on-surface-variant">Total Buyer</span>
          </div>
          <p className="text-2xl font-bold text-on-surface">{filteredData.length}</p>
        </div>
        <div className="bg-gradient-to-br from-secondary/20 to-secondary/5 rounded-xl p-4 border border-secondary/20">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-secondary" style={{ fontSize: '20px' }}>
              price_check
            </span>
            <span className="text-xs text-on-surface-variant">Rata-rata Harga</span>
          </div>
          <p className="text-lg font-bold text-on-surface">{formatRupiah(Math.round(avgPrice))}</p>
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
          placeholder="Cari nama buyer..."
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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="bg-primary/10 text-primary rounded-xl w-12 h-12 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
                      store
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-on-surface text-sm truncate">{item.namaBuyer}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="material-symbols-outlined text-on-surface-variant/60" style={{ fontSize: '14px' }}>
                        schedule
                      </span>
                      <p className="text-[11px] text-on-surface-variant">Update: {item.tanggalUpdate}</p>
                    </div>
                  </div>
                </div>
                <div className="text-right ml-3">
                  <p className="text-xs text-on-surface-variant mb-0.5">Harga Standar</p>
                  <p className="text-lg font-bold text-primary">{formatRupiah(item.hargaStandar)}</p>
                  <p className="text-[10px] text-on-surface-variant">per kg</p>
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
          <span className="material-symbols-outlined text-4xl mb-2 block opacity-30">storefront</span>
          <p className="text-sm">
            {searchQuery ? 'Tidak ada buyer yang cocok' : 'Belum ada data buyer'}
          </p>
        </div>
      )}
    </div>
  );
}
