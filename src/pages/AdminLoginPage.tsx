import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../store/AppContext';

export default function AdminLoginPage() {
  const { isAuthenticated, login, settings } = useAppContext();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username || !password) {
      setError('Username dan password harus diisi');
      return;
    }
    const success = await login(username, password);
    if (success) {
      navigate('/admin/dashboard', { replace: true });
    } else {
      setError('Username atau password salah');
    }
  };

  if (isAuthenticated) return null;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 lg:py-12">
      <div className="w-full max-w-sm lg:max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="bg-primary/10 w-20 h-20 lg:w-24 lg:h-24 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: '40px' }}>
              admin_panel_settings
            </span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-bold text-on-surface">{settings.orgName}</h2>
          <p className="text-on-surface-variant text-sm lg:text-base mt-1">
            {settings.regionName || 'Panel Admin'} - Masuk untuk mengelola konten
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-surface-container rounded-2xl border border-outline-variant/20 p-6 lg:p-8">
          <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-5">
            {error && (
              <div className="bg-error-container/30 border border-error/30 rounded-xl px-4 py-3 text-error text-sm flex items-center gap-2">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span>
                {error}
              </div>
            )}

            <div>
              <label className="block text-on-surface-variant text-xs font-medium mb-1.5 uppercase tracking-wider">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant/50" style={{ fontSize: '20px' }}>
                  person
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl pl-10 pr-4 py-3 text-on-surface text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all placeholder:text-on-surface-variant/30"
                  placeholder="Masukkan username"
                />
              </div>
            </div>

            <div>
              <label className="block text-on-surface-variant text-xs font-medium mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant/50" style={{ fontSize: '20px' }}>
                  lock
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl pl-10 pr-10 py-3 text-on-surface text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all placeholder:text-on-surface-variant/30"
                  placeholder="Masukkan password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 hover:text-on-surface-variant"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-on-primary-container font-bold py-3 rounded-xl text-sm active:scale-[0.98] transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 mt-2"
            >
              Masuk
            </button>
          </form>
        </div>

        <div className="mt-6 bg-surface-container rounded-xl border border-outline-variant/20 p-4">
          <p className="text-on-surface-variant text-xs text-center">
            <span className="material-symbols-outlined align-middle mr-1" style={{ fontSize: '14px' }}>info</span>
            Demo: username <span className="text-primary font-mono font-bold">admin</span> / password <span className="text-primary font-mono font-bold">bpw2024udang</span>
          </p>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-on-surface-variant text-sm hover:text-primary transition-colors inline-flex items-center gap-1"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
            Kembali ke Website
          </button>
        </div>
      </div>
    </div>
  );
}
