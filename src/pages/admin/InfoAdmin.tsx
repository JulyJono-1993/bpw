import { useState } from 'react';
import { useAppContext, type InfoItem } from '../../store/AppContext';
import { useBulkSelection } from '../../hooks/useBulkSelection';
import Checkbox from '../../components/admin/Checkbox';
import BulkActions from '../../components/admin/BulkActions';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export default function InfoAdmin() {
  const { infoItems, setInfoItems } = useAppContext();
  const [editing, setEditing] = useState<InfoItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const sel = useBulkSelection(infoItems.map((i) => i.id));

  const startNew = () => {
    setEditing({ id: generateId(), title: '', content: '', icon: 'info' });
    setIsNew(true);
  };

  const startEdit = (item: InfoItem) => {
    setEditing({ ...item });
    setIsNew(false);
  };

  const save = () => {
    if (!editing) return;
    if (!editing.title.trim() || !editing.content.trim()) return;
    if (isNew) {
      setInfoItems([...infoItems, editing]);
    } else {
      setInfoItems(infoItems.map((i) => (i.id === editing.id ? editing : i)));
    }
    setEditing(null);
  };

  const remove = (id: string) => {
    if (confirm('Hapus info ini?')) {
      setInfoItems(infoItems.filter((i) => i.id !== id));
      sel.prune(infoItems.map((i) => i.id).filter((x) => x !== id));
    }
  };

  const deleteSelected = () => {
    if (sel.selected.length === 0) return;
    if (confirm(`Hapus ${sel.selected.length} info terpilih?`)) {
      setInfoItems(infoItems.filter((i) => !sel.selected.includes(i.id)));
      sel.clear();
    }
  };

  if (editing) {
    return (
      <div className="px-4 lg:px-0">
        <div className="lg:max-w-3xl">
          <div className="flex items-center gap-2 mb-4 lg:mb-6">
            <button onClick={() => setEditing(null)} className="text-on-surface-variant hover:text-on-surface">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_back</span>
            </button>
            <h2 className="text-lg font-bold text-on-surface">
              {isNew ? 'Tambah Info' : 'Edit Info'}
            </h2>
          </div>

          <div className="bg-surface-container rounded-xl border border-outline-variant/20 p-4 lg:p-6">
            <div className="space-y-4 lg:space-y-5">
              <div className="lg:grid lg:grid-cols-2 lg:gap-4">
                <div>
                  <label className="block text-on-surface-variant text-xs font-medium mb-1.5 uppercase tracking-wider">Judul</label>
                  <input
                    type="text"
                    value={editing.title}
                    onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                    className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-primary/50 transition-all"
                    placeholder="Judul info"
                  />
                </div>

                <div className="mt-4 lg:mt-0">
                  <label className="block text-on-surface-variant text-xs font-medium mb-1.5 uppercase tracking-wider">Icon (Material Symbols)</label>
                  <input
                    type="text"
                    value={editing.icon}
                    onChange={(e) => setEditing({ ...editing, icon: e.target.value })}
                    className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-primary/50 transition-all"
                    placeholder="contoh: info, visibility, contact_support"
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
                <label className="block text-on-surface-variant text-xs font-medium mb-1.5 uppercase tracking-wider">Konten</label>
                <textarea
                  value={editing.content}
                  onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                  rows={10}
                  className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-primary/50 transition-all resize-none"
                  placeholder="Isi konten informasi"
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
                  {isNew ? 'Tambah Info' : 'Simpan Perubahan'}
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
          <h2 className="text-lg font-bold text-on-surface lg:hidden">Info ({infoItems.length})</h2>
          <p className="hidden lg:block text-sm text-on-surface-variant">{infoItems.length} informasi tersedia</p>
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
        total={infoItems.length}
        selected={sel.selected}
        allSelected={sel.allSelected}
        onToggleAll={sel.toggleAll}
        onDelete={deleteSelected}
        onClear={sel.clear}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
        {infoItems.map((item) => (
          <div
            key={item.id}
            className="bg-surface-container rounded-xl border border-outline-variant/20 p-3 lg:p-4 relative"
          >
            <div className="absolute top-2 right-2 z-10">
              <Checkbox checked={sel.selected.includes(item.id)} onChange={() => sel.toggle(item.id)} />
            </div>
            <div className="flex items-start gap-3 mb-2">
              <div className="bg-primary/10 text-primary rounded-full w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{item.icon}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm lg:text-base font-bold text-on-surface">{item.title}</p>
                <p className="text-[11px] lg:text-xs text-on-surface-variant line-clamp-3 whitespace-pre-line">{item.content}</p>
              </div>
            </div>
            <div className="flex border-t border-outline-variant/20 pt-2 -mx-3 lg:-mx-4 px-3 lg:px-4 mt-2">
              <button
                onClick={() => startEdit(item)}
                className="flex-1 flex items-center justify-center gap-1 text-primary text-xs font-medium py-1"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>edit</span>
                Edit
              </button>
              <button
                onClick={() => remove(item.id)}
                className="flex-1 flex items-center justify-center gap-1 text-error text-xs font-medium py-1"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>delete</span>
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>

      {infoItems.length === 0 && (
        <div className="text-center py-12 text-on-surface-variant">
          <span className="material-symbols-outlined text-4xl mb-2 block opacity-30">info</span>
          <p className="text-sm">Belum ada info</p>
        </div>
      )}
    </div>
  );
}
