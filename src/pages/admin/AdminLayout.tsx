import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../../store/AppContext';

const menuItems = [
  { icon: 'dashboard', label: 'Dashboard', path: '/admin/dashboard' },
  { icon: 'monitoring', label: 'Data Panen', path: '/admin/harvest' },
  { icon: 'view_carousel', label: 'Banner', path: '/admin/banners' },
  { icon: 'sell', label: 'Harga Udang', path: '/admin/prices' },
  { icon: 'newspaper', label: 'Berita', path: '/admin/news' },
  { icon: 'campaign', label: 'Promosi', path: '/admin/promos' },
  { icon: 'info', label: 'Info', path: '/admin/info' },
  { icon: 'tune', label: 'Pengaturan', path: '/admin/settings' },
  { icon: 'download', label: 'Download Data', path: '/admin/download' },
  { icon: 'manage_accounts', label: 'Akun Admin', path: '/admin/accounts' },
];

export default function AdminLayout() {
  const { logout, settings } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar - Hidden on mobile */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-surface-container-lowest border-r border-outline-variant/30">
        {/* Sidebar Header */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-outline-variant/30">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: '28px' }}>admin_panel_settings</span>
          <div>
            <h1 className="text-base font-bold text-primary">{settings.orgName}</h1>
            <p className="text-[10px] text-on-surface-variant">{settings.regionName || 'Admin Panel'}</p>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary/20 text-primary'
                    : 'text-on-surface-variant hover:bg-white/5 hover:text-on-surface'
                }`}
              >
                <span 
                  className="material-symbols-outlined" 
                  style={{ fontSize: '22px', fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {item.icon}
                </span>
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-outline-variant/30">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-on-surface-variant hover:bg-white/5 hover:text-on-surface transition-all mb-2"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>visibility</span>
            Lihat Website
          </button>
          <button
            onClick={() => { logout(); navigate('/admin'); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-error hover:bg-error/10 transition-all"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>logout</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64">
        {/* Mobile Header - Hidden on desktop */}
        <header className="lg:hidden fixed top-0 left-0 right-0 z-60 bg-surface-container-lowest/90 backdrop-blur-xl h-14 flex justify-between items-center px-4 border-b border-outline-variant/30">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>admin_panel_settings</span>
            <h1 className="text-sm font-bold text-primary">{settings.orgName}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/')}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-on-surface-variant"
              title="Lihat Situs"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>visibility</span>
            </button>
            <button
              onClick={() => { logout(); navigate('/admin'); }}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-error"
              title="Logout"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>logout</span>
            </button>
          </div>
        </header>

        {/* Mobile Nav - Hidden on desktop */}
        <div className="lg:hidden fixed top-14 left-0 right-0 z-50 bg-surface-container/90 backdrop-blur-xl border-b border-outline-variant/20 overflow-x-auto no-scrollbar">
          <div className="flex px-2 py-2 gap-1 min-w-max">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-primary/20 text-primary'
                      : 'text-on-surface-variant hover:bg-white/5'
                  }`}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Desktop Header */}
        <header className="hidden lg:flex h-16 items-center justify-between px-8 border-b border-outline-variant/30 bg-surface-container-lowest/50 backdrop-blur-sm sticky top-0 z-40">
          <div>
            <h2 className="text-lg font-bold text-on-surface">
              {menuItems.find(item => item.path === location.pathname)?.label || 'Admin'}
            </h2>
            <p className="text-xs text-on-surface-variant">Kelola konten website BPW P3UW</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-on-surface-variant hover:bg-white/5 hover:text-on-surface transition-all border border-outline-variant/30"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>visibility</span>
              Lihat Website
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="pt-[104px] lg:pt-0 pb-6 lg:pb-8">
          <div className="max-w-[390px] lg:max-w-none mx-auto lg:px-8 lg:py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
