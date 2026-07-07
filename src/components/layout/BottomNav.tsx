import { useNavigate, useLocation } from 'react-router-dom';

const navItems = [
  { icon: 'home', label: 'Home', path: '/' },
  { icon: 'water_drop', label: 'Cuaca', path: '/cuaca' },
  { icon: 'newspaper', label: 'Berita', path: '/berita' },
  { icon: 'info', label: 'Info', path: '/info' },
  { icon: 'admin_panel_settings', label: 'Admin', path: '/admin' },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show on admin pages (except the login/admin entry)
  if (location.pathname.startsWith('/admin/')) return null;

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] z-60 bg-surface-container-lowest/90 backdrop-blur-2xl flex items-center py-3 px-2 rounded-t-2xl shadow-2xl border-t border-outline-variant/30 justify-around">
      {navItems.map((item) => {
        const isActive = item.path === '/'
          ? location.pathname === '/'
          : location.pathname.startsWith(item.path);

        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center justify-center active:scale-90 transition-transform flex-1 cursor-pointer ${
              isActive ? 'text-primary' : 'text-on-surface-variant/70 hover:text-primary'
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: '24px',
                fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              {item.icon}
            </span>
            <span className={`text-[10px] mt-1 ${isActive ? 'font-bold' : 'font-medium'}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
