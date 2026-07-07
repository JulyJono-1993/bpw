import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
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

export interface AdminAccount {
  id: string;
  username: string;
}

interface AppState {
  banners: Banner[];
  shrimpPrices: ShrimpPrice[];
  news: NewsItem[];
  promos: Promo[];
  infoItems: InfoItem[];
  harvestData: HarvestData[];
  settings: SiteSettings;
  admins: AdminAccount[];
  isAuthenticated: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  refresh: () => Promise<void>;
  addAdmin: (username: string, password: string) => Promise<boolean>;
  deleteAdmin: (id: string) => Promise<boolean>;
  setSettings: (settings: SiteSettings) => void;
  setBanners: (banners: Banner[]) => void;
  setShrimpPrices: (prices: ShrimpPrice[]) => void;
  setNews: (news: NewsItem[]) => void;
  setPromos: (promos: Promo[]) => void;
  setInfoItems: (items: InfoItem[]) => void;
  setHarvestData: (data: HarvestData[]) => void;
}

const AUTH_KEY = 'bpw_p3uw_auth';
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

async function sha256Hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

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
  const [admins, setAdminsState] = useState<AdminAccount[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() =>
    localStorage.getItem(AUTH_KEY) === 'true'
  );
  const [loading, setLoading] = useState(true);

  const dataRef = useRef({
    banners: [] as Banner[],
    shrimpPrices: [] as ShrimpPrice[],
    news: [] as NewsItem[],
    promos: [] as Promo[],
    infoItems: [] as InfoItem[],
    harvestData: [] as HarvestData[],
  });

  // Terapkan tema & judul setiap kali pengaturan berubah
  useEffect(() => {
    applyTheme(settings.primaryColor, settings.secondaryColor, settings.backgroundColor);
    document.title = settings.orgName
      ? `${settings.orgName} - Portal Petambak Udang`
      : 'Portal Petambak Udang';
  }, [settings.primaryColor, settings.secondaryColor, settings.backgroundColor, settings.orgName]);

  async function loadAll() {
    try {
      const [b, p, n, pr, i, h, s, a] = await Promise.all([
        supabase.from('banners').select('*'),
        supabase.from('shrimp_prices').select('*'),
        supabase.from('news').select('*'),
        supabase.from('promos').select('*'),
        supabase.from('info_items').select('*'),
        supabase.from('harvest_data').select('*'),
        supabase.from('site_settings').select('*').limit(1).maybeSingle(),
        supabase.from('admins').select('id, username'),
      ]);

      if (b.data) { setBannersState(b.data as Banner[]); dataRef.current.banners = b.data as Banner[]; }
      if (p.data) { setShrimpPricesState(p.data as ShrimpPrice[]); dataRef.current.shrimpPrices = p.data as ShrimpPrice[]; }
      if (n.data) { setNewsState(n.data as NewsItem[]); dataRef.current.news = n.data as NewsItem[]; }
      if (pr.data) { setPromosState(pr.data as Promo[]); dataRef.current.promos = pr.data as Promo[]; }
      if (i.data) { setInfoItemsState(i.data as InfoItem[]); dataRef.current.infoItems = i.data as InfoItem[]; }
      if (h.data) { setHarvestDataState(h.data as HarvestData[]); dataRef.current.harvestData = h.data as HarvestData[]; }
      if (s.data) setSettingsState(s.data as SiteSettings);
      if (a.data) setAdminsState(a.data as AdminAccount[]);
    } catch (e) {
      console.error('Failed to load data from Supabase:', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Terima perubahan settings secara realtime agar semua tab/instance
  // (admin maupun website utama) ikut berubah tanpa perlu refresh.
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

  const login = async (username: string, password: string): Promise<boolean> => {
    if (!username || !password) return false;
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('username', username)
        .maybeSingle();
      if (error) throw error;
      if (!data) return false;
      const hash = await sha256Hex(password);
      if (hash === data.password_hash) {
        setIsAuthenticated(true);
        localStorage.setItem(AUTH_KEY, 'true');
        return true;
      }
    } catch (e) {
      console.error('Login failed:', e);
    }
    return false;
  };

  const addAdmin = async (username: string, password: string): Promise<boolean> => {
    if (!username || !password) return false;
    try {
      const hash = await sha256Hex(password);
      const { data, error } = await supabase
        .from('admins')
        .insert({ username, password_hash: hash })
        .select('id, username')
        .single();
      if (error) {
        console.error('Add admin failed:', error);
        return false;
      }
      setAdminsState((prev) => [data as AdminAccount, ...prev]);
      return true;
    } catch (e) {
      console.error('Add admin failed:', e);
      return false;
    }
  };

  const deleteAdmin = async (id: string): Promise<boolean> => {
    if (admins.length <= 1) return false; // jangan hapus akun terakhir
    try {
      const { error } = await supabase.from('admins').delete().eq('id', id);
      if (error) {
        console.error('Delete admin failed:', error);
        return false;
      }
      setAdminsState((prev) => prev.filter((a) => a.id !== id));
      return true;
    } catch (e) {
      console.error('Delete admin failed:', e);
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(AUTH_KEY);
  };

  const refresh = async () => { await loadAll(); };

  return (
    <AppContext.Provider
      value={{
        banners, shrimpPrices, news, promos, infoItems, harvestData,
        settings, admins, isAuthenticated, loading, login, logout, refresh,
        addAdmin, deleteAdmin, setSettings,
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
