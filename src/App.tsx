import { HashRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './store/AppContext';
import Header from './components/layout/Header';
import BottomNav from './components/layout/BottomNav';
import HomePage from './pages/HomePage';
import BeritaPage from './pages/BeritaPage';
import InfoPage from './pages/InfoPage';
import DataPanenPage from './pages/DataPanenPage';
import HargaUdangPage from './pages/HargaUdangPage';
import Investasi1000Page from './pages/Investasi1000Page';
import CuacaPage from './pages/CuacaPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminLayout from './pages/admin/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import HarvestAdmin from './pages/admin/HarvestAdmin';
import BannersAdmin from './pages/admin/BannersAdmin';
import PricesAdmin from './pages/admin/PricesAdmin';
import NewsAdmin from './pages/admin/NewsAdmin';
import PromosAdmin from './pages/admin/PromosAdmin';
import InfoAdmin from './pages/admin/InfoAdmin';
import SettingsAdmin from './pages/admin/SettingsAdmin';
import AccountsAdmin from './pages/admin/AccountsAdmin';
import DownloadAdmin from './pages/admin/DownloadAdmin';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAppContext();
  if (!isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }
  return <>{children}</>;
}

function AppContent() {
  const location = useLocation();
  const { loading, authLoading } = useAppContext();
  const isAdminPanel = location.pathname.startsWith('/admin/');
  const isAdminLogin = location.pathname === '/admin';

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="material-symbols-outlined text-primary animate-spin" style={{ fontSize: '40px' }}>
          progress_activity
        </span>
      </div>
    );
  }

  // Admin routes get full width, public routes stay mobile-sized
  const containerClass = isAdminPanel || isAdminLogin
    ? 'min-h-screen bg-background'
    : 'app-shell flex flex-col min-h-screen max-w-[390px] mx-auto relative overflow-x-hidden bg-background';

  return (
    <div className={containerClass}>
      {!isAdminPanel && !isAdminLogin && <Header />}

      <main className={`${!isAdminPanel && !isAdminLogin ? 'pt-16 pb-24' : ''} flex-1 overflow-y-auto no-scrollbar`}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/berita" element={<BeritaPage />} />
          <Route path="/info" element={<InfoPage />} />
          <Route path="/data-panen" element={<DataPanenPage />} />
          <Route path="/harga-udang" element={<HargaUdangPage />} />
          <Route path="/investasi-1000" element={<Investasi1000Page />} />
          <Route path="/cuaca" element={<CuacaPage />} />

          {/* Admin Login */}
          <Route path="/admin" element={<AdminLoginPage />} />

          {/* Admin Panel Routes - Protected */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="harvest" element={<HarvestAdmin />} />
            <Route path="banners" element={<BannersAdmin />} />
            <Route path="prices" element={<PricesAdmin />} />
            <Route path="news" element={<NewsAdmin />} />
            <Route path="promos" element={<PromosAdmin />} />
            <Route path="info" element={<InfoAdmin />} />
            <Route path="settings" element={<SettingsAdmin />} />
            <Route path="download" element={<DownloadAdmin />} />
            <Route path="accounts" element={<AccountsAdmin />} />
          </Route>
        </Routes>
      </main>

      {!isAdminPanel && !isAdminLogin && <BottomNav />}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </AppProvider>
  );
}
