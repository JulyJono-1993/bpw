import { useState } from 'react';
import { useAppContext } from '../../store/AppContext';

export default function AccountsAdmin() {
  const { admins, addAdmin, deleteAdmin } = useAppContext();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!username || !password) {
      setError('Username dan password harus diisi');
      return;
    }
    if (password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }
    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak cocok');
      return;
    }
    const ok = await addAdmin(username, password);
    if (ok) {
      setSuccess(`Akun "${username}" berhasil ditambahkan`);
      setUsername('');
      setPassword('');
      setConfirmPassword('');
    } else {
      setError('Gagal menambahkan akun (username mungkin sudah digunakan)');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (admins.length <= 1) {
      setError('Tidak bisa menghapus akun admin terakhir');
      return;
    }
    if (!confirm(`Hapus akun "${name}"?`)) return;
    setError('');
    const ok = await deleteAdmin(id);
    if (!ok) setError('Gagal menghapus akun');
  };

  return (
    <div className="px-4 lg:px-0">
      <div className="mb-4 lg:mb-6">
        <h2 className="text-lg font-bold text-on-surface lg:hidden">Akun Admin</h2>
        <p className="hidden lg:block text-sm text-on-surface-variant">{admins.length} akun terdaftar</p>
      </div>

      {error && (
        <div className="bg-error-container/30 border border-error/30 rounded-xl px-4 py-3 text-error text-sm flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span>
          {error}
        </div>
      )}
      {success && (
        <div className="bg-primary-container/40 border border-primary/30 rounded-xl px-4 py-3 text-on-primary-container text-sm flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check_circle</span>
          {success}
        </div>
      )}

      {/* Daftar akun */}
      <div className="bg-surface-container rounded-xl border border-outline-variant/20 p-4 lg:p-6 mb-4">
        <h3 className="text-sm font-bold text-on-surface mb-3">Daftar Akun</h3>
        <div className="space-y-2">
          {admins.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between bg-surface-container-high rounded-xl px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>person</span>
                </div>
                <span className="text-sm font-medium text-on-surface">{a.username}</span>
              </div>
              <button
                onClick={() => handleDelete(a.id, a.username)}
                disabled={admins.length <= 1}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-error hover:bg-error/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="Hapus"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Tambah akun */}
      <form onSubmit={handleAdd} className="bg-surface-container rounded-xl border border-outline-variant/20 p-4 lg:p-6 space-y-4">
        <h3 className="text-sm font-bold text-on-surface">Tambah Akun Baru</h3>
        <div>
          <label className="block text-on-surface-variant text-xs font-medium mb-1.5 uppercase tracking-wider">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-primary/50 transition-all"
            placeholder="username baru"
          />
        </div>
        <div className="lg:grid lg:grid-cols-2 lg:gap-4">
          <div>
            <label className="block text-on-surface-variant text-xs font-medium mb-1.5 uppercase tracking-wider">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-primary/50 transition-all"
              placeholder="min. 6 karakter"
            />
          </div>
          <div className="mt-4 lg:mt-0">
            <label className="block text-on-surface-variant text-xs font-medium mb-1.5 uppercase tracking-wider">Konfirmasi Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-primary/50 transition-all"
              placeholder="ulangi password"
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full lg:w-auto bg-primary text-on-primary-container font-bold py-3 lg:px-8 rounded-xl text-sm active:scale-[0.98] transition-all"
        >
          Tambah Akun
        </button>
      </form>
    </div>
  );
}
