import { useState } from 'react';
import { useAppContext, type Promo } from '../../store/AppContext';
import { useBulkSelection } from '../../hooks/useBulkSelection';
import Checkbox from '../../components/admin/Checkbox';
import BulkActions from '../../components/admin/BulkActions';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export default function PromosAdmin() {
  const { promos, setPromos } = useAppContext();
  const [editing, setEditing] = useState<Promo | null>(null);
  const [isNew, setIsNew] = useState(false);
  const sel = useBulkSelection(promos.map((p) => p.id));

  const startNew = () => {
    setEditing({
      id: generateId(),
      title: '',
      description: '',
      buttonText: '',
      icon: 'savings',
      imageUrl: '',
    });
    setIsNew(true);
  };

  const startEdit = (promo: Promo) => {
    setEditing({ ...promo });
    setIsNew(false);
  };

  const save = () => {
    if (!editing) return;
    if (!editing.title.trim() || !editing.buttonText.trim()) return;
    if (isNew) {
      setPromos([...promos, editing]);
    } else {
      setPromos(promos.map((p) => (p.id === editing.id ? editing : p)));
    }
    setEditing(null);
  };

  const remove = (id: string) => {
    if (confirm('Hapus promosi ini?')) {
      setPromos(promos.filter((p) => p.id !== id));
      sel.prune(promos.map((p) => p.id).filter((x) => x !== id));
    }
  };

  const deleteSelected = () => {
    if (sel.selected.length === 0) return;
    if (confirm(`Hapus ${sel.selected.length} promosi terpilih?`)) {
      setPromos(promos.filter((p) => !sel.selected.includes(p.id)));
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
              {isNew ? 'Tambah Promosi' : 'Edit Promosi'}
            </h2>
          </div>

          <div className="bg-surface-container rounded-xl border border-outline-variant/20 p-4 lg:p-6">
            <div className="space-y-4 lg:space-y-5">
              <div>
                <label className="block text-on-surface-variant text-xs font-medium mb-1.5 uppercase tracking-wider">Judul</label>
                <input
                  type="text"
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-primary/50 transition-all"
                  placeholder="Judul promosi"
                />
              </div>

              <div>
                <label className="block text-on-surface-variant text-xs font-medium mb-1.5 uppercase tracking-wider">Deskripsi</label>
                <textarea
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  rows={2}
                  className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-primary/50 transition-all resize-none"
                  placeholder="Deskripsi singkat"
                />
              </div>

              <div className="lg:grid lg:grid-cols-2 lg:gap-4">
                <div>
                  <label className="block text-on-surface-variant text-xs font-medium mb-1.5 uppercase tracking-wider">Teks Tombol</label>
                  <input
                    type="text"
                    value={editing.buttonText}
                    onChange={(e) => setEditing({ ...editing, buttonText: e.target.value })}
                    className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-primary/50 transition-all"
                    placeholder="contoh: Daftar Sekarang"
                  />
                </div>

                <div className="mt-4 lg:mt-0">
                  <label className="block text-on-surface-variant text-xs font-medium mb-1.5 uppercase tracking-wider">Icon (Material Symbols)</label>
                  <input
                    type="text"
                    value={editing.icon || ''}
                    onChange={(e) => setEditing({ ...editing, icon: e.target.value })}
                    className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-primary/50 transition-all"
                    placeholder="contoh: savings, local_offer"
                  />
                  {editing.icon && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[11px] text-on-surface-variant">Preview:</span>
                      <span className="material-symbols-outlined text-primary">{editing.icon}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-on-surface-variant text-xs font-medium mb-1.5 uppercase tracking-wider">URL Gambar (Opsional)</label>
                <input
                  type="text"
                  value={editing.imageUrl || ''}
                  onChange={(e) => setEditing({ ...editing, imageUrl: e.target.value })}
                  className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-primary/50 transition-all"
                  placeholder="https://... (kosongkan untuk tampilkan icon)"
                />
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
                  {isNew ? 'Tambah Promosi' : 'Simpan Perubahan'}
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
          <h2 className="text-lg font-bold text-on-surface lg:hidden">Promosi ({promos.length})</h2>
          <p className="hidden lg:block text-sm text-on-surface-variant">{promos.length} promosi aktif</p>
        </div>
        <button
          onClick={startNew}
          className="bg-primary text-on-primary-container px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg text-xs lg:text-sm font-bold flex items-center gap-1 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
          Tambah
        </button>
      </div>

      <BulkActions
        total={promos.length}
        selected={sel.selected}
        allSelected={sel.allSelected}
        onToggleAll={sel.toggleAll}
        onDelete={deleteSelected}
        onClear={sel.clear}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-4">
        {promos.map((promo) => (
          <div
            key={promo.id}
            className="bg-surface-container rounded-xl border border-outline-variant/20 p-3 lg:p-4 relative"
          >
            <div className="absolute top-2 right-2 z-10">
              <Checkbox checked={sel.selected.includes(promo.id)} onChange={() => sel.toggle(promo.id)} />
            </div>
            <div className="flex items-start gap-3 mb-2">
              <div className="bg-primary/10 text-primary rounded-lg w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                  {promo.icon || 'campaign'}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm lg:text-base font-bold text-on-surface">{promo.title}</p>
                <p className="text-[11px] lg:text-xs text-on-surface-variant line-clamp-2">{promo.description}</p>
                <span className="inline-block mt-1 text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium">
                  {promo.buttonText}
                </span>
              </div>
            </div>
            <div className="flex border-t border-outline-variant/20 pt-2 -mx-3 lg:-mx-4 px-3 lg:px-4 mt-2">
              <button
                onClick={() => startEdit(promo)}
                className="flex-1 flex items-center justify-center gap-1 text-primary text-xs font-medium py-1"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>edit</span>
                Edit
              </button>
              <button
                onClick={() => remove(promo.id)}
                className="flex-1 flex items-center justify-center gap-1 text-error text-xs font-medium py-1"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>delete</span>
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>

      {promos.length === 0 && (
        <div className="text-center py-12 text-on-surface-variant">
          <span className="material-symbols-outlined text-4xl mb-2 block opacity-30">campaign</span>
          <p className="text-sm">Belum ada promosi</p>
        </div>
      )}
    </div>
  );
}
