import Checkbox from './Checkbox';

interface BulkActionsProps {
  total: number;
  selected: string[];
  allSelected: boolean;
  onToggleAll: () => void;
  onDelete: () => void;
  onClear: () => void;
}

export default function BulkActions({
  total,
  selected,
  allSelected,
  onToggleAll,
  onDelete,
  onClear,
}: BulkActionsProps) {
  const count = selected.length;
  const indeterminate = count > 0 && !allSelected;

  if (total === 0) return null;

  return (
    <div className="flex items-center justify-between gap-3 bg-surface-container-high rounded-xl border border-outline-variant/20 px-3 py-2.5 mb-3">
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <Checkbox checked={allSelected} indeterminate={indeterminate} onChange={onToggleAll} />
        <span className="text-xs text-on-surface-variant">
          Pilih Semua {total > 0 && <span className="text-on-surface">({total})</span>}
        </span>
      </label>

      {count > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-on-surface font-medium hidden sm:inline">{count} terpilih</span>
          <button
            onClick={onClear}
            className="text-xs text-on-surface-variant hover:text-on-surface px-2 py-1.5 rounded-lg transition-colors"
          >
            Batal
          </button>
          <button
            onClick={onDelete}
            className="flex items-center gap-1 bg-error text-on-error-container px-3 py-1.5 rounded-lg text-xs font-bold active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
            Hapus ({count})
          </button>
        </div>
      )}
    </div>
  );
}
