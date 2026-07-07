import { useState, useMemo } from 'react';
import { useAppContext } from '../store/AppContext';

const ITEMS_PER_PAGE = 10;

export default function DataPanenPage() {
  const { harvestData } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'date' | 'month' | 'year'>('all');
  const [filterValue, setFilterValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Parse date string to extract day, month, year
  const parseDate = (dateStr: string) => {
    // Format expected: "10 Okt 2023"
    const months: Record<string, number> = {
      'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'Mei': 5, 'Jun': 6,
      'Jul': 7, 'Agu': 8, 'Sep': 9, 'Okt': 10, 'Nov': 11, 'Des': 12
    };
    const parts = dateStr.split(' ');
    if (parts.length >= 3) {
      return {
        day: parseInt(parts[0]),
        month: months[parts[1]] || 0,
        year: parseInt(parts[2]),
        monthName: parts[1]
      };
    }
    return { day: 0, month: 0, year: 0, monthName: '' };
  };

  // Get unique months and years for filter options
  const filterOptions = useMemo(() => {
    const months = new Set<string>();
    const years = new Set<number>();
    const dates = new Set<string>();
    
    harvestData.forEach((item) => {
      const parsed = parseDate(item.tanggal);
      if (parsed.year) {
        years.add(parsed.year);
        months.add(`${parsed.monthName} ${parsed.year}`);
        dates.add(item.tanggal);
      }
    });
    
    return {
      months: Array.from(months).sort(),
      years: Array.from(years).sort((a, b) => b - a),
      dates: Array.from(dates).sort()
    };
  }, [harvestData]);

  // Filter data
  const filteredData = useMemo(() => {
    let data = harvestData;
    
    // Apply search filter
    if (searchQuery) {
      data = data.filter(
        (item) =>
          item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.alamatTambak.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply date filter
    if (filterValue && filterType !== 'all') {
      data = data.filter((item) => {
        const parsed = parseDate(item.tanggal);
        if (filterType === 'date') {
          return item.tanggal === filterValue;
        } else if (filterType === 'month') {
          return `${parsed.monthName} ${parsed.year}` === filterValue;
        } else if (filterType === 'year') {
          return parsed.year === parseInt(filterValue);
        }
        return true;
      });
    }
    
    return data;
  }, [harvestData, searchQuery, filterType, filterValue]);

  // Calculate totals from filtered data
  const totalPanen = filteredData.length;
  const totalTonase = filteredData.reduce((sum, item) => sum + item.tonase, 0);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to page 1 when filter changes
  const handleFilterChange = (type: typeof filterType, value: string) => {
    setFilterType(type);
    setFilterValue(value);
    setCurrentPage(1);
  };

  return (
    <div className="px-4 mt-4 pb-6">
      <h2 className="text-xl font-bold text-on-surface mb-4">Data Panen</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl p-4 border border-primary/20">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>
              inventory_2
            </span>
            <span className="text-xs text-on-surface-variant">Total Panen</span>
          </div>
          <p className="text-2xl font-bold text-on-surface">{totalPanen}</p>
        </div>
        <div className="bg-gradient-to-br from-secondary/20 to-secondary/5 rounded-xl p-4 border border-secondary/20">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-secondary" style={{ fontSize: '20px' }}>
              scale
            </span>
            <span className="text-xs text-on-surface-variant">Total Tonase</span>
          </div>
          <p className="text-2xl font-bold text-on-surface">{totalTonase.toFixed(1)} <span className="text-sm font-normal text-on-surface-variant">ton</span></p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-surface-container rounded-xl border border-outline-variant/20 p-3 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '18px' }}>filter_list</span>
          <span className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">Filter</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => handleFilterChange('all', '')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filterType === 'all' ? 'bg-primary text-on-primary-container' : 'bg-surface-container-high text-on-surface-variant'
            }`}
          >
            Semua
          </button>
          
          {/* Date Filter */}
          <select
            value={filterType === 'date' ? filterValue : ''}
            onChange={(e) => handleFilterChange('date', e.target.value)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-container-high text-on-surface border-none focus:outline-none focus:ring-1 focus:ring-primary/50"
          >
            <option value="">Pilih Tanggal</option>
            {filterOptions.dates.map((date) => (
              <option key={date} value={date}>{date}</option>
            ))}
          </select>

          {/* Month Filter */}
          <select
            value={filterType === 'month' ? filterValue : ''}
            onChange={(e) => handleFilterChange('month', e.target.value)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-container-high text-on-surface border-none focus:outline-none focus:ring-1 focus:ring-primary/50"
          >
            <option value="">Pilih Bulan</option>
            {filterOptions.months.map((month) => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>

          {/* Year Filter */}
          <select
            value={filterType === 'year' ? filterValue : ''}
            onChange={(e) => handleFilterChange('year', e.target.value)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-container-high text-on-surface border-none focus:outline-none focus:ring-1 focus:ring-primary/50"
          >
            <option value="">Pilih Tahun</option>
            {filterOptions.years.map((year) => (
              <option key={year} value={year.toString()}>{year}</option>
            ))}
          </select>
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
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-surface-container-lowest rounded-lg p-3 border border-outline-variant/10">
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">Tonase</p>
                  <p className="text-lg font-bold text-primary">
                    {item.tonase} <span className="text-xs font-normal text-on-surface-variant">ton</span>
                  </p>
                </div>
                <div className="bg-surface-container-lowest rounded-lg p-3 border border-outline-variant/10">
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">Size</p>
                  <p className="text-lg font-bold text-secondary">
                    {item.size} <span className="text-xs font-normal text-on-surface-variant">ekor/kg</span>
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
            {searchQuery || filterValue ? 'Tidak ada data yang cocok' : 'Belum ada data panen'}
          </p>
        </div>
      )}
    </div>
  );
}
