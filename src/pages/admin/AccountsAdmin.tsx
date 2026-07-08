import { useState } from 'react';
import { useAppContext } from '../../store/AppContext';

export default function AccountsAdmin() {
  const { adminUsers, removeAdmin, adminProfile } = useAppContext();
  const [error, setError] = useState('');

  const handleDelete = async (userId: string, email: string) => {
    if (adminUsers.length <= 1) {
      setError('Tidak bisa menghapus akun admin terakhir');
      return;
    }
    if (!confirm(`Hapus akun "${email}" dari panel admin?`)) return;
    setError('');
    const ok = await removeAdmin(userId);
    if (!ok) setError('Gagal menghapus akun');
  };

  return (
    <div className="px-4 lg:px-0">
      <div className="mb-4 lg:mb-6">
        <h2 className="text-lg font-bold text-on-surface lg:hidden">Akun Admin</h2>
        <p className="hidden lg:block text-sm text-on-surface-variant">{adminUsers.length} akun terdaftar</p>
      </div>

      {error && (
        <div className="bg-error-container/30 border border-error/30 rounded-xl px-4 py-3 text-error text-sm flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span>
          {error}
        </div>
      )}

      <div className="bg-surface-container rounded-xl border border-outline-variant/20 p-4 lg:p-6 mb-4">
        <h3 className="text-sm font-bold text-on-surface mb-3">Daftar Akun</h3>
        <div className="space-y-2">
          {adminUsers.map((a) => (
            <div
              key={a.user_id}
              className="flex items-center justify-between bg-surface-container-high rounded-xl px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>person</span>
                </div>
                <span className="text-sm font-medium text-on-surface">{a.email}</span>
                {a.user_id === adminProfile?.user_id && (
                  <span className="text-xs text-primary border border-primary/30 px-2 py-0.5 rounded-full">Aktif</span>
                )}
              </div>
              <button
                onClick={() => handleDelete(a.user_id, a.email)}
                disabled={adminUsers.length <= 1 || a.user_id === adminProfile?.user_id}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-error hover:bg-error/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="Hapus"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-surface-container rounded-xl border border-outline-variant/20 p-4 lg:p-6">
        <h3 className="text-sm font-bold text-on-surface mb-2">Menambah Akun Baru</h3>
        <p className="text-sm text-on-surface-variant leading-relaxed">
          Karena autentikasi sekarang menggunakan Supabase Auth, tambah akun baru melalui dua langkah:<br />
          1. Buka <strong>Supabase Dashboard</strong> &gt; <strong>Authentication</strong> &gt; <strong>Add User</strong> (email + password).<br />
          2. Setelah akun dibuat, jalankan SQL berikut di <strong>SQL Editor</strong> untuk menjadikannya admin:
        </p>
        <pre className="mt-3 p-3 rounded-lg bg-surface-container-high text-xs text-on-surface overflow-x-auto border border-outline-variant/20">
{`insert into admin_users (user_id, email, role)
values ('AUTH_USER_ID_DISINI', 'email-akun@baru.com', 'admin');`}
        </pre>
      </div>
    </div>
  );
}
