import { useState } from 'react';
import { useAppContext, type HarvestData } from '../../store/AppContext';
import { useBulkSelection } from '../../hooks/useBulkSelection';
import Checkbox from '../../components/admin/Checkbox';
import BulkActions from '../../components/admin/BulkActions';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export default function HarvestAdmin() {
  const { harvestData, setHarvestData } = useAppContext();
  const [editing, setEditing] = useState<HarvestData | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [tonaseText, setTonaseText] = useState('');

  const startNew = () => {
    setEditing({
      id: generateId(),
      nama: '',
      alamatTambak: '',
      tonase: 0,
      size: 0,
      tanggal: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
    });
    setTonaseText('');
    setIsNew(true);
  };

  const startEdit = (item: HarvestData) => {
    setEditing({ ...item });
    setTonaseText(String(item.tonase));
    setIsNew(false);
  };

  const save = () => {
    if (!editing) return;
    if (!editing.nama.trim() || !editing.alamatTambak.trim()) return;
    const saved: HarvestData = { ...editing, tonase: parseFloat(tonaseText) || 0 };
    if (isNew) {
      setHarvestData([saved, ...harvestData]);
    } else {
      setHarvestData(harvestData.map((h) => (h.id === saved.id ? saved : h)));
    }
    setEditing(null);
  };

  const remove = (id: string) => {
    if (confirm('Hapus data panen ini?')) {
      setHarvestData(harvestData.filter((h) => h.id !== id));
      sel.prune(harvestData.map((h) => h.id).filter((x) => x !== id));
    }
  };

  // Calculate totals
  const totalTonase = harvestData.reduce((sum, item) => sum + item.tonase, 0);

  // Filter data
  const filteredData = harvestData.filter(
    (item) =>
      item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.alamatTambak.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sel = useBulkSelection(filteredData.map((i) => i.id));

  const deleteSelected = () => {
    if (sel.selected.length === 0) return;
    if (confirm(`Hapus ${sel.selected.length} data panen terpilih?`)) {
      setHarvestData(harvestData.filter((h) => !sel.selected.includes(h.id)));
      sel.clear();
    }
  };

  if (editing) {
    return (
      <div className="px-4 lg:px-0">
        <div className="lg:max-w-2xl">
          <div className="flex items-center gap-2 mb-4 lg:mb-6">
            <button onClick={() => setEditing(null)} className="text-on-surface-variant hover:text-on-surface">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_back</span>
            </button>
            <h2 className="text-lg font-bold text-on-surface">
              {isNew ? 'Tambah Data Panen' : 'Edit Data Panen'}
            </h2>
          </div>

          <div className="bg-surface-container rounded-xl border border-outline-variant/20 p-4 lg:p-6">
            <div className="space-y-4 lg:space-y-5">
              <div className="lg:grid lg:grid-cols-2 lg:gap-4">
                <div>
                  <label className="block text-on-surface-variant text-xs font-medium mb-1.5 uppercase tracking-wider">
                    Nama Petambak
                  </label>
                  <input
                    type="text"
                    value={editing.nama}
                    onChange={(e) => setEditing({ ...editing, nama: e.target.value })}
                    className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-primary/50 transition-all"
                    placeholder="Nama lengkap petambak"
                  />
                </div>

                <div className="mt-4 lg:mt-0">
                  <label className="block text-on-surface-variant text-xs font-medium mb-1.5 uppercase tracking-wider">
                    Tanggal Panen
                  </label>
                  <input
                    type="text"
                    value={editing.tanggal}
                    onChange={(e) => setEditing({ ...editing, tanggal: e.target.value })}
                    className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-primary/50 transition-all"
                    placeholder="contoh: 10 Okt 2023"
                  />
                </div>
              </div>

              <div>
                <label className="block text-on-surface-variant text-xs font-medium mb-1.5 uppercase tracking-wider">
                  Alamat Tambak
                </label>
                <textarea
                  value={editing.alamatTambak}
                  onChange={(e) => setEditing({ ...editing, alamatTambak: e.target.value })}
                  rows={3}
                  className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-primary/50 transition-all resize-none"
                  placeholder="Alamat lengkap lokasi tambak"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 lg:gap-4">
                <div>
                  <label className="block text-on-surface-variant text-xs font-medium mb-1.5 uppercase tracking-wider">
                    Tonase (ton)
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={tonaseText}
                    onChange={(e) => setTonaseText(e.target.value.replace(',', '.'))}
                    className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-primary/50 transition-all"
                    placeholder="contoh: 0.5 atau 2.5"
                  />
                </div>

                <div>
                  <label className="block text-on-surface-variant text-xs font-medium mb-1.5 uppercase tracking-wider">
                    Size (ekor/kg)
                  </label>
                  <input
                    type="number"
                    value={editing.size || ''}
                    onChange={(e) => setEditing({ ...editing, size: Number(e.target.value) })}
                    className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-primary/50 transition-all"
                    placeholder="contoh: 30"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setEditing(null)}
                  className="flex-1 lg:flex-none lg:px-8 py-3 rounded-xl text-sm font-medium border border-outline-variant/30 text-on-surface-variant hover:bg-white/5 transition-all"
                >
                  Batal
                </button>
                <button
                  onClick={save}
                  className="flex-1 lg:flex-none lg:px-8 bg-primary text-on-primary-container font-bold py-3 rounded-xl text-sm active:scale-[0.98] transition-all"
                >
                  {isNew ? 'Tambah Data' : 'Simpan Perubahan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 lg:px-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 lg:mb-6">
        <div>
          <h2 className="text-lg font-bold text-on-surface lg:hidden">Data Panen ({harvestData.length})</h2>
          <p className="hidden lg:block text-sm text-on-surface-variant">{harvestData.length} data panen tercatat</p>
        </div>
        <button
          onClick={startNew}
          className="bg-primary text-on-primary-container px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg text-xs lg:text-sm font-bold flex items-center gap-1 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
          <span className="hidden sm:inline">Tambah Data</span>
          <span className="sm:hidden">Tambah</span>
        </button>
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-br from-primary/10 to-transparent rounded-xl p-3 lg:p-4 border border-primary/20 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>analytics</span>
          <span className="text-sm text-on-surface-variant">Total Panen</span>
        </div>
        <span className="text-lg font-bold text-primary">{totalTonase.toFixed(1)} ton</span>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant/50" style={{ fontSize: '20px' }}>
          search
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-surface-container border border-outline-variant/30 rounded-xl pl-10 pr-4 py-2.5 text-on-surface text-sm focus:outline-none focus:border-primary/50 transition-all placeholder:text-on-surface-variant/40"
          placeholder="Cari nama atau alamat..."
        />
      </div>

      <BulkActions
        total={filteredData.length}
        selected={sel.selected}
        allSelected={sel.allSelected}
        onToggleAll={sel.toggleAll}
        onDelete={deleteSelected}
        onClear={sel.clear}
      />

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-surface-container rounded-xl border border-outline-variant/20 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-outline-variant/20 bg-surface-container-high/50">
              <th className="w-10 px-3 py-3">
                <Checkbox checked={sel.allSelected} indeterminate={sel.selected.length > 0 && !sel.allSelected} onChange={sel.toggleAll} />
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Nama</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Alamat Tambak</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Tonase</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Size</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Tanggal</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20">
            {filteredData.map((item) => (
              <tr key={item.id} className="hover:bg-white/5 transition-colors">
                <td className="px-3 py-3">
                  <Checkbox checked={sel.selected.includes(item.id)} onChange={() => sel.toggle(item.id)} />
                </td>
                <td className="px-4 py-3 text-sm text-on-surface font-medium">{item.nama}</td>
                <td className="px-4 py-3 text-sm text-on-surface-variant truncate max-w-xs">{item.alamatTambak}</td>
                <td className="px-4 py-3 text-sm text-primary font-semibold text-center">{item.tonase} ton</td>
                <td className="px-4 py-3 text-sm text-secondary font-semibold text-center">{item.size}</td>
                <td className="px-4 py-3 text-sm text-on-surface-variant text-center">{item.tanggal}</td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => startEdit(item)}
                      className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                      title="Edit"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                    </button>
                    <button
                      onClick={() => remove(item.id)}
                      className="p-1.5 rounded-lg hover:bg-error/10 text-error transition-colors"
                      title="Hapus"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredData.length === 0 && (
          <div className="text-center py-12 text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl mb-2 block opacity-30">monitoring</span>
            <p className="text-sm">{searchQuery ? 'Tidak ada data yang cocok' : 'Belum ada data panen'}</p>
          </div>
        )}
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3">
        {filteredData.map((item) => (
            <div
              key={item.id}
              className="bg-surface-container rounded-xl border border-outline-variant/20 overflow-hidden relative"
            >
              <div className="absolute top-2 right-2 z-10">
                <Checkbox checked={sel.selected.includes(item.id)} onChange={() => sel.toggle(item.id)} />
              </div>
              <div className="p-3">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold text-on-surface text-sm">{item.nama}</p>
                  <p className="text-[10px] text-on-surface-variant">{item.tanggal}</p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium">
                    {item.tonase} ton
                  </span>
                  <span className="bg-secondary/20 text-secondary px-2 py-0.5 rounded-full font-medium">
                    Size {item.size}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-on-surface-variant line-clamp-2">{item.alamatTambak}</p>
            </div>
            <div className="flex border-t border-outline-variant/20">
              <button
                onClick={() => startEdit(item)}
                className="flex-1 py-2 flex items-center justify-center gap-1 text-primary text-xs font-medium hover:bg-white/5 transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>edit</span>
                Edit
              </button>
              <div className="w-px bg-outline-variant/20" />
              <button
                onClick={() => remove(item.id)}
                className="flex-1 py-2 flex items-center justify-center gap-1 text-error text-xs font-medium hover:bg-white/5 transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>delete</span>
                Hapus
              </button>
            </div>
          </div>
        ))}

        {filteredData.length === 0 && (
          <div className="text-center py-12 text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl mb-2 block opacity-30">monitoring</span>
            <p className="text-sm">{searchQuery ? 'Tidak ada data yang cocok' : 'Belum ada data panen'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
