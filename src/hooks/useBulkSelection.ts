import { useState } from 'react';

export function useBulkSelection(allIds: string[]) {
  const [selected, setSelected] = useState<string[]>([]);
  const allSelected = allIds.length > 0 && selected.length === allIds.length;
  const someSelected = selected.length > 0;

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const toggleAll = () => setSelected(allSelected ? [] : [...allIds]);

  const clear = () => setSelected([]);

  // Buang id yang sudah tidak ada di daftar (mis. setelah dihapus)
  const prune = (ids: string[]) =>
    setSelected((prev) => (ids.length ? prev.filter((x) => ids.includes(x)) : []));

  return { selected, setSelected, toggle, toggleAll, clear, prune, allSelected, someSelected };
}
