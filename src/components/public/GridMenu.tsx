import { useNavigate } from 'react-router-dom';

const menuItems = [
  { icon: 'monitoring', label: 'Data Panen', path: '/data-panen' },
  { icon: 'sell', label: 'Harga Udang', path: '/harga-udang' },
  { icon: 'account_balance_wallet', label: 'Investasi 1000', path: '/investasi-1000' },
  { icon: 'newspaper', label: 'Berita', path: '/berita' },
];

export default function GridMenu() {
  const navigate = useNavigate();

  return (
    <section className="px-4 mt-6">
      <div className="grid grid-cols-2 gap-3">
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className="bg-surface-container p-4 rounded-xl border border-outline-variant/20 flex flex-col items-center justify-center gap-2 active:scale-95 transition-all aspect-square cursor-pointer"
          >
            <div className="bg-primary/10 text-primary rounded-full flex items-center justify-center w-10 h-10">
              <span className="material-symbols-outlined">{item.icon}</span>
            </div>
            <span className="font-geist text-sm font-medium text-on-surface">{item.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
