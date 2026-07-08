import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import { supabase, signInWithPassword, signOut, getSession, onAuthStateChange, type Session } from '../lib/supabase';
import { applyTheme } from '../lib/theme';

export interface Banner {
  id: string;
  tag: string;
  tagColor: 'primary' | 'secondary';
  title: string;
  imageUrl: string;
}

export interface ShrimpPrice {
  id: string;
  namaBuyer: string;
  hargaStandar: number;
  tanggalUpdate: string;
}

export interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  date: string;
  category: string;
}

export interface Promo {
  id: string;
  title: string;
  description: string;
  buttonText: string;
  icon?: string;
  imageUrl?: string;
}

export interface InfoItem {
  id: string;
  title: string;
  content: string;
  icon: string;
}

export interface HarvestData {
  id: string;
  nama: string;
  alamatTambak: string;
  tonase: number;
  size: number;
  tanggal: string;
}

export interface SiteSettings {
  id: string;
  orgName: string;
  regionName: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  locationName: string;
  latitude: string;
  longitude: string;
  showWeather: boolean;
}

export interface AdminUser {
  user_id: string;
  email: string;
  role: string;
}

interface AdminProfile {
  user_id: string;
  email: string;
  role: string;
}

interface AppState {
  banners: Banner[];
  shrimpPrices: ShrimpPrice[];
  news: NewsItem[];
  promos: Promo[];
  infoItems: InfoItem[];
  harvestData: HarvestData[];
  settings: SiteSettings;
  adminUsers: AdminUser[];
  isAuthenticated: boolean;
  loading: boolean;
  authLoading: boolean;
  adminProfile: AdminProfile | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  removeAdmin: (userId: string) => Promise<boolean>;
  setSettings: (settings: SiteSettings) => void;
  setBanners: (banners: Banner[]) => void;
  setShrimpPrices: (prices: ShrimpPrice[]) => void;
  setNews: (news: NewsItem[]) => void;
  setPromos: (promos: Promo[]) => void;
  setInfoItems: (items: InfoItem[]) => void;
  setHarvestData: (data: HarvestData[]) => void;
}

const DEFAULT_SETTINGS: SiteSettings = {
  id: 'default',
  orgName: 'BPW P3UW',
  regionName: 'Wilayah Lampung Timur',
  primaryColor: '#00dddd',
  secondaryColor: '#89ceff',
  backgroundColor: '#0b1326',
  locationName: 'Labuhan Maringgai, Lampung Timur',
  latitude: '-5.3833',
  longitude: '105.4667',
  showWeather: true,
};

const AppContext = createContext<AppState | undefined>(undefined);

type CollectionKey = 'banners' | 'shrimpPrices' | 'news' | 'promos' | 'infoItems' | 'harvestData';
const TABLE_BY_KEY: Record<CollectionKey, string> = {
  banners: 'banners',
  shrimpPrices: 'shrimp_prices',
  news: 'news',
  promos: 'promos',
  infoItems: 'info_items',
  harvestData: 'harvest_data',
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [banners, setBannersState] = useState<Banner[]>([]);
  const [shrimpPrices, setShrimpPricesState] = useState<ShrimpPrice[]>([]);
  const [news, setNewsState] = useState<NewsItem[]>([]);
  const [promos, setPromosState] = useState<Promo[]>([]);
  const [infoItems, setInfoItemsState] = useState<InfoItem[]>([]);
  const [harvestData, setHarvestDataState] = useState<HarvestData[]>([]);
  const [settings, setSettingsState] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [session, setSessionState] = useState<Session | null>(null);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);

  const dataRef = useRef({
    banners: [] as Banner[],
    shrimpPrices: [] as ShrimpPrice[],
    news: [] as NewsItem[],
    promos: [] as Promo[],
    infoItems: [] as InfoItem[],
    harvestData: [] as HarvestData[],
  });

  const isAuthenticated = !!(session && adminProfile);

  useEffect(() => {
    applyTheme(settings.primaryColor, settings.secondaryColor, settings.backgroundColor);
    document.title = settings.orgName
      ? `${settings.orgName} - Portal Petambak Udang`
      : 'Portal Petambak Udang';
  }, [settings.primaryColor, settings.secondaryColor, settings.backgroundColor, settings.orgName]);

  async function loadAll() {
    try {
      const [b, p, n, pr, i, h, s] = await Promise.all([
        supabase.from('banners').select('*'),
        supabase.from('shrimp_prices').select('*'),
        supabase.from('news').select('*'),
        supabase.from('promos').select('*'),
        supabase.from('info_items').select('*'),
        supabase.from('harvest_data').select('*'),
        supabase.from('site_settings').select('*').limit(1).maybeSingle(),
      ]);

      if (b.data) { setBannersState(b.data as Banner[]); dataRef.current.banners = b.data as Banner[]; }
      if (p.data) { setShrimpPricesState(p.data as ShrimpPrice[]); dataRef.current.shrimpPrices = p.data as ShrimpPrice[]; }
      if (n.data) { setNewsState(n.data as NewsItem[]); dataRef.current.news = n.data as NewsItem[]; }
      if (pr.data) { setPromosState(pr.data as Promo[]); dataRef.current.promos = pr.data as Promo[]; }
      if (i.data) { setInfoItemsState(i.data as InfoItem[]); dataRef.current.infoItems = i.data as InfoItem[]; }
      if (h.data) { setHarvestDataState(h.data as HarvestData[]); dataRef.current.harvestData = h.data as HarvestData[]; }
      if (s.data) setSettingsState(s.data as SiteSettings);

      try {
        const { data: adminList } = await supabase.from('admin_users').select('user_id, email, role');
        if (adminList) setAdminUsers(adminList as AdminUser[]);
      } catch (adminError) {
        console.warn('Gagal memuat daftar admin:', adminError);
      }
    } catch (e) {
      console.error('Failed to load data from Supabase:', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    const { data: listener } = onAuthStateChange(async (_event, session) => {
      setSessionState(session);
      setAuthLoading(false);

      if (session?.user) {
        try {
          const { data } = await supabase
            .from('admin_users')
            .select('user_id, email, role')
            .eq('user_id', session.user.id)
            .maybeSingle();
          setAdminProfile(data as AdminProfile | null);
        } catch (e) {
          console.warn('Gagal memuat profil admin:', e);
          setAdminProfile(null);
        }
      } else {
        setAdminProfile(null);
      }
    });

    const initSession = async () => {
      try {
        const { data } = await getSession();
        setSessionState(data.session);
        if (data.session?.user) {
          try {
            const { data: profile } = await supabase
              .from('admin_users')
              .select('user_id, email, role')
              .eq('user_id', data.session.user.id)
              .maybeSingle();
            setAdminProfile(profile as AdminProfile | null);
          } catch (e) {
            console.warn('Gagal memuat profil admin saat init:', e);
            setAdminProfile(null);
          }
        }
      } catch (e) {
        console.error('Gagal inisialisasi sesi:', e);
      } finally {
        setAuthLoading(false);
      }
    };

    initSession();

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel('public:site_settings')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'site_settings' },
        (payload: { new: unknown }) => {
          if (payload.new) setSettingsState(payload.new as SiteSettings);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function syncTable(key: CollectionKey, next: unknown[]) {
    const table = TABLE_BY_KEY[key];
    const prev = dataRef.current[key] as { id: string }[];
    const nextArr = next as { id: string }[];
    dataRef.current[key] = next as never;

    try {
      const nextIds = new Set(nextArr.map((n) => n.id));
      const toDelete = prev.filter((p) => !nextIds.has(p.id)).map((p) => p.id);
      if (toDelete.length) {
        await supabase.from(table).delete().in('id', toDelete);
      }
      if (nextArr.length) {
        await supabase.from(table).upsert(nextArr, { onConflict: 'id' });
      }
    } catch (e) {
      console.error(`Failed to sync ${table}:`, e);
    }
  }

  const setBanners = (next: Banner[]) => { setBannersState(next); void syncTable('banners', next); };
  const setShrimpPrices = (next: ShrimpPrice[]) => { setShrimpPricesState(next); void syncTable('shrimpPrices', next); };
  const setNews = (next: NewsItem[]) => { setNewsState(next); void syncTable('news', next); };
  const setPromos = (next: Promo[]) => { setPromosState(next); void syncTable('promos', next); };
  const setInfoItems = (next: InfoItem[]) => { setInfoItemsState(next); void syncTable('infoItems', next); };
  const setHarvestData = (next: HarvestData[]) => { setHarvestDataState(next); void syncTable('harvestData', next); };

  const setSettings = (next: SiteSettings) => {
    setSettingsState(next);
    supabase
      .from('site_settings')
      .upsert(next, { onConflict: 'id' })
      .then(
        ({ error }) => {
          if (error) console.error('Gagal menyimpan pengaturan ke Supabase:', error);
        },
        (e: unknown) => console.error('Gagal menyimpan pengaturan ke Supabase:', e)
      );
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setAuthLoading(true);
    try {
      const { data, error } = await signInWithPassword(email, password);
      if (error || !data.user) {
        console.error('Login failed:', error);
        setAuthLoading(false);
        return false;
      }
      const { data: profile } = await supabase
        .from('admin_users')
        .select('user_id, email, role')
        .eq('user_id', data.user.id)
        .maybeSingle();
      setAdminProfile(profile as AdminProfile | null);
      setAuthLoading(false);
      return !!profile;
    } catch (e) {
      console.error('Login failed:', e);
      setAuthLoading(false);
      return false;
    }
  };

  const logout = async () => {
    await signOut();
    setAdminProfile(null);
    setSessionState(null);
  };

  const removeAdmin = async (userId: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('admin_users').delete().eq('user_id', userId);
      if (error) throw error;
      setAdminUsers((prev) => prev.filter((a) => a.user_id !== userId));
      if (adminProfile?.user_id === userId) {
        await logout();
      }
      return true;
    } catch (e) {
      console.error('Gagal menghapus akun admin:', e);
      return false;
    }
  };

  const refresh = async () => { await loadAll(); };

  return (
    <AppContext.Provider
      value={{
        banners, shrimpPrices, news, promos, infoItems, harvestData,
        settings, adminUsers, isAuthenticated, loading, authLoading, login, logout, refresh,
        adminProfile, removeAdmin,
        setSettings,
        setBanners, setShrimpPrices, setNews, setPromos, setInfoItems, setHarvestData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
