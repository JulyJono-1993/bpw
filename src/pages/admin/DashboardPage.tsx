import { useAppContext } from '../../store/AppContext';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const { banners, shrimpPrices, news, promos, infoItems, harvestData } = useAppContext();
  const navigate = useNavigate();

  const totalTonase = harvestData.reduce((sum, item) => sum + item.tonase, 0);
  const totalInvestasi = totalTonase * 1000 * 1000; // 1 kg = Rp 1000

  const stats = [
    { icon: 'monitoring', label: 'Data Panen', count: harvestData.length, path: '/admin/harvest', color: 'text-primary', suffix: ` (${totalTonase.toFixed(1)} ton)` },
    { icon: 'account_balance_wallet', label: 'Total Investasi', count: `Rp ${(totalInvestasi / 1000000).toFixed(1)}jt`, path: '/admin/harvest', color: 'text-secondary', isText: true },
    { icon: 'view_carousel', label: 'Banner', count: banners.length, path: '/admin/banners', color: 'text-primary' },
    { icon: 'sell', label: 'Harga Udang', count: shrimpPrices.length, path: '/admin/prices', color: 'text-secondary' },
    { icon: 'newspaper', label: 'Berita', count: news.length, path: '/admin/news', color: 'text-primary' },
    { icon: 'campaign', label: 'Promosi', count: promos.length, path: '/admin/promos', color: 'text-secondary' },
    { icon: 'info', label: 'Info', count: infoItems.length, path: '/admin/info', color: 'text-primary' },
  ];

  const quickActions = [
    { icon: 'add_chart', label: 'Input Data Panen Baru', path: '/admin/harvest' },
    { icon: 'add_photo_alternate', label: 'Tambah Banner Baru', path: '/admin/banners' },
    { icon: 'edit_note', label: 'Tulis Berita Baru', path: '/admin/news' },
    { icon: 'price_change', label: 'Update Harga Udang', path: '/admin/prices' },
  ];

  return (
    <div className="px-4 lg:px-0">
      <h2 className="text-lg font-bold text-on-surface mb-4 lg:hidden">Dashboard</h2>

      {/* Welcome card */}
      <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl p-4 lg:p-6 border border-primary/20 mb-4 lg:mb-6">
        <div className="flex items-center gap-3 lg:gap-4">
          <div className="bg-primary/20 rounded-full p-2 lg:p-3">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: '24px' }}>waving_hand</span>
          </div>
          <div>
            <p className="text-on-surface font-semibold text-sm lg:text-base">Selamat Datang, Admin!</p>
            <p className="text-on-surface-variant text-xs lg:text-sm">Kelola konten website dari sini</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3 lg:gap-4 mb-4 lg:mb-6">
        {stats.map((stat) => (
          <button
            key={stat.label}
            onClick={() => navigate(stat.path)}
            className="bg-surface-container rounded-xl border border-outline-variant/20 p-4 text-left active:scale-[0.97] transition-all hover:border-primary/30"
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`material-symbols-outlined ${stat.color}`} style={{ fontSize: '22px' }}>
                {stat.icon}
              </span>
              <span className={`font-bold text-on-surface ${'isText' in stat ? 'text-sm' : 'text-2xl'}`}>
                {stat.count}
              </span>
            </div>
            <p className="text-xs text-on-surface-variant font-medium">
              {stat.label}
              {'suffix' in stat && <span className="text-primary">{stat.suffix}</span>}
            </p>
          </button>
        ))}
      </div>

      {/* Quick actions */}
      <h3 className="text-sm lg:text-base font-bold text-on-surface mb-3">Aksi Cepat</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-2 lg:gap-3">
        {quickActions.map((action) => (
          <button
            key={action.label}
            onClick={() => navigate(action.path)}
            className="w-full bg-surface-container-high rounded-xl border border-outline-variant/20 p-3 lg:p-4 flex items-center gap-3 active:bg-white/5 transition-colors text-left hover:border-primary/30"
          >
            <div className="bg-primary/10 text-primary rounded-lg w-9 h-9 lg:w-10 lg:h-10 flex items-center justify-center">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{action.icon}</span>
            </div>
            <span className="text-sm text-on-surface font-medium flex-1">{action.label}</span>
            <span className="material-symbols-outlined text-on-surface-variant/50" style={{ fontSize: '18px' }}>chevron_right</span>
          </button>
        ))}
      </div>

      {/* Recent Activity - Desktop only */}
      <div className="hidden lg:block mt-8">
        <h3 className="text-base font-bold text-on-surface mb-4">Data Panen Terbaru</h3>
        <div className="bg-surface-container rounded-xl border border-outline-variant/20 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-variant/20 bg-surface-container-high/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Nama</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Alamat Tambak</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Tonase</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Size</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {harvestData.slice(0, 5).map((item) => (
                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 text-sm text-on-surface font-medium">{item.nama}</td>
                  <td className="px-4 py-3 text-sm text-on-surface-variant truncate max-w-xs">{item.alamatTambak}</td>
                  <td className="px-4 py-3 text-sm text-primary font-semibold text-center">{item.tonase} ton</td>
                  <td className="px-4 py-3 text-sm text-secondary font-semibold text-center">{item.size}</td>
                  <td className="px-4 py-3 text-sm text-on-surface-variant text-center">{item.tanggal}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {harvestData.length > 5 && (
            <div className="px-4 py-3 border-t border-outline-variant/20 bg-surface-container-high/30">
              <button
                onClick={() => navigate('/admin/harvest')}
                className="text-sm text-primary font-medium hover:underline"
              >
                Lihat semua {harvestData.length} data →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
