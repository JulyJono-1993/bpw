import { useState } from 'react';
import { useAppContext, type NewsItem } from '../../store/AppContext';
import { useBulkSelection } from '../../hooks/useBulkSelection';
import Checkbox from '../../components/admin/Checkbox';
import BulkActions from '../../components/admin/BulkActions';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export default function NewsAdmin() {
  const { news, setNews } = useAppContext();
  const [editing, setEditing] = useState<NewsItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const sel = useBulkSelection(news.map((n) => n.id));

  const startNew = () => {
    setEditing({
      id: generateId(),
      title: '',
      excerpt: '',
      content: '',
      imageUrl: '',
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      category: '',
    });
    setIsNew(true);
  };

  const startEdit = (item: NewsItem) => {
    setEditing({ ...item });
    setIsNew(false);
  };

  const save = () => {
    if (!editing) return;
    if (!editing.title.trim() || !editing.content.trim()) return;
    if (isNew) {
      setNews([editing, ...news]);
    } else {
      setNews(news.map((n) => (n.id === editing.id ? editing : n)));
    }
    setEditing(null);
  };

  const remove = (id: string) => {
    if (confirm('Hapus berita ini?')) {
      setNews(news.filter((n) => n.id !== id));
      sel.prune(news.map((n) => n.id).filter((x) => x !== id));
    }
  };

  const deleteSelected = () => {
    if (sel.selected.length === 0) return;
    if (confirm(`Hapus ${sel.selected.length} berita terpilih?`)) {
      setNews(news.filter((n) => !sel.selected.includes(n.id)));
      sel.clear();
    }
  };

  if (editing) {
    return (
      <div className="px-4 lg:px-0">
        <div className="lg:max-w-4xl">
          <div className="flex items-center gap-2 mb-4 lg:mb-6">
            <button onClick={() => setEditing(null)} className="text-on-surface-variant hover:text-on-surface">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_back</span>
            </button>
            <h2 className="text-lg font-bold text-on-surface">
              {isNew ? 'Tulis Berita' : 'Edit Berita'}
            </h2>
          </div>

          <div className="bg-surface-container rounded-xl border border-outline-variant/20 p-4 lg:p-6">
            <div className="space-y-4 lg:space-y-5">
              <div className="lg:grid lg:grid-cols-3 lg:gap-4">
                <div>
                  <label className="block text-on-surface-variant text-xs font-medium mb-1.5 uppercase tracking-wider">Kategori</label>
                  <input
                    type="text"
                    value={editing.category}
                    onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                    className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-primary/50 transition-all"
                    placeholder="contoh: Kebijakan, Edukasi"
                  />
                </div>

                <div className="mt-4 lg:mt-0">
                  <label className="block text-on-surface-variant text-xs font-medium mb-1.5 uppercase tracking-wider">Tanggal</label>
                  <input
                    type="text"
                    value={editing.date}
                    onChange={(e) => setEditing({ ...editing, date: e.target.value })}
                    className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-primary/50 transition-all"
                    placeholder="contoh: 15 Okt 2023"
                  />
                </div>

                <div className="mt-4 lg:mt-0">
                  <label className="block text-on-surface-variant text-xs font-medium mb-1.5 uppercase tracking-wider">URL Gambar</label>
                  <input
                    type="text"
                    value={editing.imageUrl}
                    onChange={(e) => setEditing({ ...editing, imageUrl: e.target.value })}
                    className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-primary/50 transition-all"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-on-surface-variant text-xs font-medium mb-1.5 uppercase tracking-wider">Judul</label>
                <input
                  type="text"
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-primary/50 transition-all"
                  placeholder="Judul berita"
                />
              </div>

              <div>
                <label className="block text-on-surface-variant text-xs font-medium mb-1.5 uppercase tracking-wider">Ringkasan</label>
                <textarea
                  value={editing.excerpt}
                  onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })}
                  rows={2}
                  className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-primary/50 transition-all resize-none"
                  placeholder="Ringkasan singkat berita"
                />
              </div>

              <div>
                <label className="block text-on-surface-variant text-xs font-medium mb-1.5 uppercase tracking-wider">Konten</label>
                <textarea
                  value={editing.content}
                  onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                  rows={8}
                  className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-primary/50 transition-all resize-none"
                  placeholder="Isi berita lengkap"
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
                  {isNew ? 'Publikasikan' : 'Simpan Perubahan'}
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
          <h2 className="text-lg font-bold text-on-surface lg:hidden">Berita ({news.length})</h2>
          <p className="hidden lg:block text-sm text-on-surface-variant">{news.length} berita dipublikasikan</p>
        </div>
        <button
          onClick={startNew}
          className="bg-primary text-on-primary-container px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg text-xs lg:text-sm font-bold flex items-center gap-1 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
          Tulis
        </button>
      </div>

      <BulkActions
        total={news.length}
        selected={sel.selected}
        allSelected={sel.allSelected}
        onToggleAll={sel.toggleAll}
        onDelete={deleteSelected}
        onClear={sel.clear}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-4">
        {news.map((item) => (
          <div
            key={item.id}
            className="bg-surface-container rounded-xl border border-outline-variant/20 overflow-hidden relative"
          >
            <div className="absolute top-2 right-2 z-10">
              <Checkbox checked={sel.selected.includes(item.id)} onChange={() => sel.toggle(item.id)} />
            </div>
            <div className="flex lg:flex-col gap-3 lg:gap-0">
              {item.imageUrl && (
                <div className="w-20 h-20 lg:w-full lg:h-36 flex-shrink-0">
                  <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1 py-2 pr-2 lg:p-4">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="bg-primary/20 text-primary text-[8px] lg:text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase">
                    {item.category}
                  </span>
                  <span className="text-[10px] lg:text-[11px] text-on-surface-variant">{item.date}</span>
                </div>
                <p className="text-xs lg:text-sm font-semibold text-on-surface line-clamp-2">{item.title}</p>
                <p className="hidden lg:block text-[11px] text-on-surface-variant mt-1 line-clamp-2">{item.excerpt}</p>
              </div>
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
      </div>

      {news.length === 0 && (
        <div className="text-center py-12 text-on-surface-variant">
          <span className="material-symbols-outlined text-4xl mb-2 block opacity-30">newspaper</span>
          <p className="text-sm">Belum ada berita</p>
        </div>
      )}
    </div>
  );
}
