import { useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';

interface TableDef {
  key: string;
  table: string;
  label: string;
}

const TABLES: TableDef[] = [
  { key: 'banners', table: 'banners', label: 'Banner' },
  { key: 'shrimp_prices', table: 'shrimp_prices', label: 'Harga Udang' },
  { key: 'news', table: 'news', label: 'Berita' },
  { key: 'promos', table: 'promos', label: 'Promosi' },
  { key: 'info_items', table: 'info_items', label: 'Info' },
  { key: 'harvest_data', table: 'harvest_data', label: 'Data Panen' },
  { key: 'site_settings', table: 'site_settings', label: 'Pengaturan Situs' },
  { key: 'weather_cache', table: 'weather_cache', label: 'Cache Cuaca' },
  { key: 'admin_users', table: 'admin_users', label: 'Akun Admin' },
];

// Tabel yang dihapus saat "Hapus Semua Data" (admin_users dikecualikan agar
// panel tidak terkunci).
const TRUNCATE_TABLES = TABLES.filter((t) => t.key !== 'admin_users');

interface BackupFile {
  __meta?: { app?: string; version?: number; createdAt?: string };
  [key: string]: unknown;
}

type StatusKind = 'idle' | 'busy' | 'success' | 'error';

interface Status {
  kind: StatusKind;
  message: string;
}

export default function BackupAdmin() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>({ kind: 'idle', message: '' });
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteText, setDeleteText] = useState('');

  const setMsg = (kind: StatusKind, message: string) => setStatus({ kind, message });

  async function deleteAll(table: string) {
    const { data, error } = await supabase.from(table).select('id');
    if (error) throw error;
    const ids: string[] = (data || []).map((r: { id: unknown }) => r.id as string);
    if (ids.length) {
      const { error: delErr } = await supabase.from(table).delete().in('id', ids);
      if (delErr) throw delErr;
    }
  }

  async function handleBackup() {
    setBusy(true);
    setMsg('busy', 'Membuat cadangan data...');
    try {
      const backup: BackupFile = {
        __meta: {
          app: 'BPW P3UW',
          version: 1,
          createdAt: new Date().toISOString(),
        },
      };
      const skipped: string[] = [];
      for (const t of TABLES) {
        const { data, error } = await supabase.from(t.table).select('*');
        if (error) {
          skipped.push(t.label);
          backup[t.key] = [];
          continue;
        }
        backup[t.key] = data ?? [];
      }
      const blob = new Blob([JSON.stringify(backup, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
      a.href = url;
      a.download = `backup-bpw-${stamp}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setMsg(
        'success',
        skipped.length
          ? `Cadangan diunduh (melewati tabel yang tidak ada: ${skipped.join(', ')}).`
          : 'Cadangan berhasil diunduh.'
      );
    } catch (e) {
      console.error(e);
      setMsg('error', 'Gagal membuat cadangan: ' + (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function handleRestore(file: File) {
    setBusy(true);
    setMsg('busy', 'Memulihkan data...');
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as BackupFile;
      const keys = Object.keys(parsed).filter((k) => !k.startsWith('__'));
      if (keys.length === 0) {
        throw new Error('File cadangan tidak valid (tidak ada tabel).');
      }
      const skipped: string[] = [];
      for (const t of TABLES) {
        const rows = (parsed[t.key] as unknown[]) || [];
        if (!Array.isArray(rows)) continue;
        if (rows.length) {
          const { error } = await supabase.from(t.table).upsert(rows, {
            onConflict: 'id',
          });
          if (error) skipped.push(t.label);
        }
      }
      setMsg(
        'success',
        skipped.length
          ? `Data dipulihkan (melewati tabel yang gagal: ${skipped.join(', ')}).`
          : 'Data berhasil dipulihkan dari cadangan.'
      );
    } catch (e) {
      console.error(e);
      setMsg('error', 'Gagal memulihkan data: ' + (e as Error).message);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function handleDeleteAll() {
    if (deleteText !== 'HAPUS SEMUA') return;
    setBusy(true);
    setMsg('busy', 'Menghapus semua data...');
    try {
      for (const t of TRUNCATE_TABLES) {
        try {
          await deleteAll(t.table);
        } catch (e) {
          console.warn(`Lewati penghapusan tabel ${t.table}:`, e);
        }
      }
      setConfirmDelete(false);
      setDeleteText('');
      setMsg('success', 'Semua data konten berhasil dihapus (akun admin dipertahankan).');
    } catch (e) {
      console.error(e);
      setMsg('error', 'Gagal menghapus data: ' + (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const statusColor =
    status.kind === 'error'
      ? 'text-error'
      : status.kind === 'success'
      ? 'text-primary'
      : status.kind === 'busy'
      ? 'text-on-surface-variant'
      : 'text-on-surface-variant';

  return (
    <div className="px-4 lg:px-0 space-y-4">
      <div className="mb-2 lg:mb-4">
        <h2 className="text-lg font-bold text-on-surface lg:hidden">Backup &amp; Restore</h2>
        <p className="hidden lg:block text-sm text-on-surface-variant">
          Cadangkan, pulihkan, atau kosongkan seluruh data database
        </p>
      </div>

      {status.message && (
        <div
          className={`text-sm rounded-xl px-4 py-3 border ${
            status.kind === 'error'
              ? 'bg-error/10 border-error/30'
              : status.kind === 'success'
              ? 'bg-primary/10 border-primary/30'
              : 'bg-surface-container border-outline-variant/30'
          } ${statusColor}`}
        >
          {status.message}
        </div>
      )}

      {/* Backup */}
      <section className="bg-surface-container rounded-xl p-4 border border-outline-variant/20">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>
            download_for_offline
          </span>
          <h3 className="text-sm font-semibold text-on-surface">Backup Database</h3>
        </div>
        <p className="text-xs text-on-surface-variant mb-3">
          Unduh seluruh isi tabel ke dalam satu file JSON sebagai cadangan.
        </p>
        <button
          onClick={handleBackup}
          disabled={busy}
          className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary-container font-bold py-3 rounded-xl text-sm active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>download</span>
          Backup Sekarang
        </button>
      </section>

      {/* Restore */}
      <section className="bg-surface-container rounded-xl p-4 border border-outline-variant/20">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>
            restore
          </span>
          <h3 className="text-sm font-semibold text-on-surface">Restore Database</h3>
        </div>
        <p className="text-xs text-on-surface-variant mb-3">
          Pilih file cadangan (.json) untuk mengembalikan data. Data yang
          memiliki ID sama akan diperbarui (upsert).
        </p>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleRestore(f);
          }}
        />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="w-full flex items-center justify-center gap-2 bg-secondary text-on-secondary-container font-bold py-3 rounded-xl text-sm active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>upload</span>
          Pilih File &amp; Restore
        </button>
      </section>

      {/* Delete All */}
      <section className="bg-error/5 rounded-xl p-4 border border-error/30">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-error" style={{ fontSize: '20px' }}>
            delete_forever
          </span>
          <h3 className="text-sm font-semibold text-error">Hapus Semua Data</h3>
        </div>
        <p className="text-xs text-on-surface-variant mb-3">
          Mengosongkan seluruh data konten (banner, harga, berita, promosi,
          info, data panen, pengaturan, cache cuaca). Akun admin dipertahankan
          agar panel tidak terkunci. Tindakan ini tidak dapat dibatalkan.
        </p>

        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            disabled={busy}
            className="w-full flex items-center justify-center gap-2 bg-error text-on-error font-bold py-3 rounded-xl text-sm active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete_forever</span>
            Hapus Semua Database
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-xs font-medium text-error">
              Ketik <span className="font-bold">HAPUS SEMUA</span> untuk konfirmasi:
            </p>
            <input
              type="text"
              value={deleteText}
              onChange={(e) => setDeleteText(e.target.value)}
              placeholder="HAPUS SEMUA"
              className="w-full bg-surface-container border border-error/40 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:outline-none focus:border-error transition-all"
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setConfirmDelete(false);
                  setDeleteText('');
                }}
                disabled={busy}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-on-surface-variant border border-outline-variant/30 hover:bg-white/5 transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteAll}
                disabled={busy || deleteText !== 'HAPUS SEMUA'}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-error text-on-error transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Hapus Permanen
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
