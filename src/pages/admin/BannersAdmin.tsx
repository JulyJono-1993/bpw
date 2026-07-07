import { useState } from 'react';
import { useAppContext, type Banner } from '../../store/AppContext';
import { useBulkSelection } from '../../hooks/useBulkSelection';
import Checkbox from '../../components/admin/Checkbox';
import BulkActions from '../../components/admin/BulkActions';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export default function BannersAdmin() {
  const { banners, setBanners } = useAppContext();
  const [editing, setEditing] = useState<Banner | null>(null);
  const [isNew, setIsNew] = useState(false);
  const sel = useBulkSelection(banners.map((b) => b.id));

  const startNew = () => {
    setEditing({ id: generateId(), tag: '', tagColor: 'primary', title: '', imageUrl: '' });
    setIsNew(true);
  };

  const startEdit = (banner: Banner) => {
    setEditing({ ...banner });
    setIsNew(false);
  };

  const save = () => {
    if (!editing) return;
    if (!editing.title.trim() || !editing.tag.trim()) return;
    if (isNew) {
      setBanners([...banners, editing]);
    } else {
      setBanners(banners.map((b) => (b.id === editing.id ? editing : b)));
    }
    setEditing(null);
  };

  const remove = (id: string) => {
    if (confirm('Hapus banner ini?')) {
      setBanners(banners.filter((b) => b.id !== id));
      sel.prune(banners.map((b) => b.id).filter((x) => x !== id));
    }
  };

  const deleteSelected = () => {
    if (sel.selected.length === 0) return;
    if (confirm(`Hapus ${sel.selected.length} banner terpilih?`)) {
      setBanners(banners.filter((b) => !sel.selected.includes(b.id)));
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
              {isNew ? 'Tambah Banner' : 'Edit Banner'}
            </h2>
          </div>

          <div className="bg-surface-container rounded-xl border border-outline-variant/20 p-4 lg:p-6">
            <div className="space-y-4 lg:space-y-5">
              <div className="lg:grid lg:grid-cols-2 lg:gap-4">
                <div>
                  <label className="block text-on-surface-variant text-xs font-medium mb-1.5 uppercase tracking-wider">Tag Label</label>
                  <input
                    type="text"
                    value={editing.tag}
                    onChange={(e) => setEditing({ ...editing, tag: e.target.value })}
                    className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-primary/50 transition-all"
                    placeholder="contoh: Update, Edukasi"
                  />
                </div>

                <div className="mt-4 lg:mt-0">
                  <label className="block text-on-surface-variant text-xs font-medium mb-1.5 uppercase tracking-wider">Warna Tag</label>
                  <div className="flex gap-3">
                    {(['primary', 'secondary'] as const).map((color) => (
                      <button
                        key={color}
                        onClick={() => setEditing({ ...editing, tagColor: color })}
                        className={`flex-1 lg:flex-none px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                          editing.tagColor === color
                            ? color === 'primary'
                              ? 'bg-primary text-on-primary-container'
                              : 'bg-secondary text-on-secondary-container'
                            : 'bg-surface-container-high border border-outline-variant/30 text-on-surface-variant'
                        }`}
                      >
                        {color === 'primary' ? 'Primary' : 'Secondary'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-on-surface-variant text-xs font-medium mb-1.5 uppercase tracking-wider">Judul</label>
                <input
                  type="text"
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-primary/50 transition-all"
                  placeholder="Judul banner"
                />
              </div>

              <div>
                <label className="block text-on-surface-variant text-xs font-medium mb-1.5 uppercase tracking-wider">URL Gambar</label>
                <input
                  type="text"
                  value={editing.imageUrl}
                  onChange={(e) => setEditing({ ...editing, imageUrl: e.target.value })}
                  className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-primary/50 transition-all"
                  placeholder="https://..."
                />
              </div>

              {editing.imageUrl && (
                <div className="rounded-xl overflow-hidden h-32 lg:h-48 border border-outline-variant/20">
                  <img src={editing.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}

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
                  {isNew ? 'Tambah Banner' : 'Simpan Perubahan'}
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
          <h2 className="text-lg font-bold text-on-surface lg:hidden">Banner ({banners.length})</h2>
          <p className="hidden lg:block text-sm text-on-surface-variant">{banners.length} banner aktif</p>
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
        total={banners.length}
        selected={sel.selected}
        allSelected={sel.allSelected}
        onToggleAll={sel.toggleAll}
        onDelete={deleteSelected}
        onClear={sel.clear}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-4">
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="bg-surface-container rounded-xl border border-outline-variant/20 overflow-hidden relative"
          >
            <div className="absolute top-2 right-2 z-10">
              <Checkbox checked={sel.selected.includes(banner.id)} onChange={() => sel.toggle(banner.id)} />
            </div>
            <div className="h-24 lg:h-32 bg-cover bg-center relative" style={{ backgroundImage: `url('${banner.imageUrl}')` }}>
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container to-transparent" />
              <div className="absolute bottom-2 left-3">
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                  banner.tagColor === 'primary' ? 'bg-primary text-on-primary-container' : 'bg-secondary text-on-secondary-container'
                }`}>
                  {banner.tag}
                </span>
              </div>
            </div>
            <div className="p-3 flex items-center justify-between">
              <p className="text-sm font-medium text-on-surface line-clamp-1 flex-1">{banner.title}</p>
              <div className="flex gap-1 ml-2">
                <button
                  onClick={() => startEdit(banner)}
                  className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: '16px' }}>edit</span>
                </button>
                <button
                  onClick={() => remove(banner.id)}
                  className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <span className="material-symbols-outlined text-error" style={{ fontSize: '16px' }}>delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {banners.length === 0 && (
        <div className="text-center py-12 text-on-surface-variant">
          <span className="material-symbols-outlined text-4xl mb-2 block opacity-30">view_carousel</span>
          <p className="text-sm">Belum ada banner</p>
        </div>
      )}
    </div>
  );
}
