import { useState } from 'react';
import { useAppContext, type ShrimpPrice } from '../../store/AppContext';
import { useBulkSelection } from '../../hooks/useBulkSelection';
import Checkbox from '../../components/admin/Checkbox';
import BulkActions from '../../components/admin/BulkActions';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

function formatRupiah(num: number) {
  return 'Rp ' + num.toLocaleString('id-ID');
}

export default function PricesAdmin() {
  const { shrimpPrices, setShrimpPrices } = useAppContext();
  const [editing, setEditing] = useState<ShrimpPrice | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const startNew = () => {
    setEditing({
      id: generateId(),
      namaBuyer: '',
      hargaStandar: 0,
      tanggalUpdate: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
    });
    setIsNew(true);
  };

  const startEdit = (price: ShrimpPrice) => {
    setEditing({ ...price });
    setIsNew(false);
  };

  const save = () => {
    if (!editing) return;
    if (!editing.namaBuyer.trim() || !editing.hargaStandar) return;
    if (isNew) {
      setShrimpPrices([editing, ...shrimpPrices]);
    } else {
      setShrimpPrices(shrimpPrices.map((p) => (p.id === editing.id ? editing : p)));
    }
    setEditing(null);
  };

  const remove = (id: string) => {
    if (confirm('Hapus data buyer ini?')) {
      setShrimpPrices(shrimpPrices.filter((p) => p.id !== id));
      sel.prune(shrimpPrices.map((p) => p.id).filter((x) => x !== id));
    }
  };

  const filteredData = shrimpPrices.filter((item) =>
    item.namaBuyer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sel = useBulkSelection(filteredData.map((i) => i.id));

  const deleteSelected = () => {
    if (sel.selected.length === 0) return;
    if (confirm(`Hapus ${sel.selected.length} harga terpilih?`)) {
      setShrimpPrices(shrimpPrices.filter((p) => !sel.selected.includes(p.id)));
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
              {isNew ? 'Tambah Buyer' : 'Edit Buyer'}
            </h2>
          </div>

          <div className="bg-surface-container rounded-xl border border-outline-variant/20 p-4 lg:p-6">
            <div className="space-y-4 lg:space-y-5">
              <div>
                <label className="block text-on-surface-variant text-xs font-medium mb-1.5 uppercase tracking-wider">Nama Buyer</label>
                <input
                  type="text"
                  value={editing.namaBuyer}
                  onChange={(e) => setEditing({ ...editing, namaBuyer: e.target.value })}
                  className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-primary/50 transition-all"
                  placeholder="contoh: PT. Udang Makmur"
                />
              </div>

              <div className="lg:grid lg:grid-cols-2 lg:gap-4">
                <div>
                  <label className="block text-on-surface-variant text-xs font-medium mb-1.5 uppercase tracking-wider">Harga Standar (Rp/Kg)</label>
                  <input
                    type="number"
                    value={editing.hargaStandar || ''}
                    onChange={(e) => setEditing({ ...editing, hargaStandar: Number(e.target.value) })}
                    className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-primary/50 transition-all"
                    placeholder="contoh: 85000"
                  />
                </div>

                <div className="mt-4 lg:mt-0">
                  <label className="block text-on-surface-variant text-xs font-medium mb-1.5 uppercase tracking-wider">Tanggal Update</label>
                  <input
                    type="text"
                    value={editing.tanggalUpdate}
                    onChange={(e) => setEditing({ ...editing, tanggalUpdate: e.target.value })}
                    className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-primary/50 transition-all"
                    placeholder="contoh: 12 Okt 2023"
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
                  {isNew ? 'Tambah Buyer' : 'Simpan Perubahan'}
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
      <div className="flex items-center justify-between mb-4 lg:mb-6">
        <div>
          <h2 className="text-lg font-bold text-on-surface lg:hidden">Harga Udang ({shrimpPrices.length})</h2>
          <p className="hidden lg:block text-sm text-on-surface-variant">{shrimpPrices.length} buyer terdaftar</p>
        </div>
        <button
          onClick={startNew}
          className="bg-primary text-on-primary-container px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg text-xs lg:text-sm font-bold flex items-center gap-1 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
          Tambah
        </button>
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
          placeholder="Cari nama buyer..."
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
              <th className="text-left px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Nama Buyer</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Harga Standar</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Tanggal Update</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20">
            {filteredData.map((item) => (
              <tr key={item.id} className="hover:bg-white/5 transition-colors">
                <td className="px-3 py-3">
                  <Checkbox checked={sel.selected.includes(item.id)} onChange={() => sel.toggle(item.id)} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>store</span>
                    </div>
                    <span className="text-sm text-on-surface font-medium">{item.namaBuyer}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-primary font-bold text-center">{formatRupiah(item.hargaStandar)}</td>
                <td className="px-4 py-3 text-sm text-on-surface-variant text-center">{item.tanggalUpdate}</td>
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
            <span className="material-symbols-outlined text-4xl mb-2 block opacity-30">sell</span>
            <p className="text-sm">{searchQuery ? 'Tidak ada data yang cocok' : 'Belum ada data buyer'}</p>
          </div>
        )}
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-2">
        {filteredData.map((item) => (
            <div
              key={item.id}
              className="bg-surface-container rounded-xl border border-outline-variant/20 p-3 relative"
            >
              <div className="absolute top-2 right-2 z-10">
                <Checkbox checked={sel.selected.includes(item.id)} onChange={() => sel.toggle(item.id)} />
              </div>
              <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>store</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-on-surface truncate">{item.namaBuyer}</p>
                  <p className="text-[11px] text-on-surface-variant">{item.tanggalUpdate}</p>
                </div>
              </div>
              <span className="text-sm font-bold text-primary ml-2">{formatRupiah(item.hargaStandar)}</span>
            </div>
            <div className="flex border-t border-outline-variant/20 pt-2 -mx-3 px-3 mt-2">
              <button
                onClick={() => startEdit(item)}
                className="flex-1 flex items-center justify-center gap-1 text-primary text-xs font-medium"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>edit</span>
                Edit
              </button>
              <button
                onClick={() => remove(item.id)}
                className="flex-1 flex items-center justify-center gap-1 text-error text-xs font-medium"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>delete</span>
                Hapus
              </button>
            </div>
          </div>
        ))}

        {filteredData.length === 0 && (
          <div className="text-center py-12 text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl mb-2 block opacity-30">sell</span>
            <p className="text-sm">{searchQuery ? 'Tidak ada data yang cocok' : 'Belum ada data buyer'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
