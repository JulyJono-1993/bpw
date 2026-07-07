import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { findTideExtremes, indexFromNow } from '../lib/weather';

export interface WeatherNow {
  temp: number;
  feels: number;
  code: number;
  humidity: number;
  wind: number;
  windDir: number;
  precip: number;
  isDay: boolean;
  sunrise: string;
  sunset: string;
}

export interface HourlyPoint {
  time: string;
  temp: number;
  code: number;
  precipProb: number;
}

export interface DailyPoint {
  date: string;
  code: number;
  tmax: number;
  tmin: number;
  precipProb: number;
  wind: number;
}

export interface TideExtreme {
  time: string;
  height: number;
  type: 'high' | 'low';
}

export interface TideInfo {
  height: number | null;
  mean: number | null;
  status: 'Pasang' | 'Surut' | null;
  extremes: TideExtreme[];
  nextHigh?: TideExtreme;
  nextLow?: TideExtreme;
  series: { time: string; height: number }[];
}

export interface WeatherTideData {
  now: WeatherNow | null;
  hourly: HourlyPoint[];
  daily: DailyPoint[];
  tide: TideInfo | null;
  updatedAt: string | null;
}

export interface UseWeatherTideResult {
  loading: boolean;
  error: string;
  data: WeatherTideData;
  tideError: boolean;
  refresh: () => void;
}

const EMPTY: WeatherTideData = {
  now: null,
  hourly: [],
  daily: [],
  tide: null,
  updatedAt: null,
};

function cacheKey(lat: string, lng: string): string {
  const la = Number(lat).toFixed(2);
  const lo = Number(lng).toFixed(2);
  return `w_${la}_${lo}`;
}

export function useWeatherTide(opts: {
  lat: string;
  lng: string;
  enabled: boolean;
  locationName?: string;
}): UseWeatherTideResult {
  const { lat, lng, enabled, locationName } = opts;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tideError, setTideError] = useState(false);
  const [data, setData] = useState<WeatherTideData>(EMPTY);
  const reqId = useRef(0);

  const load = useCallback(async () => {
    if (!enabled) return;
    const clat = lat;
    const clng = lng;
    if (!clat || !clng) {
      setError('Lokasi cuaca belum diatur di Panel Admin.');
      setLoading(false);
      return;
    }
    const id = ++reqId.current;
    setLoading(true);
    setError('');

    const wxUrl =
      `https://api.open-meteo.com/v1/forecast?latitude=${clat}&longitude=${clng}` +
      `&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m` +
      `&hourly=temperature_2m,weather_code,precipitation_probability` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,sunrise,sunset` +
      `&timezone=Asia/Jakarta&forecast_days=7`;

    const marineUrl =
      `https://marine-api.open-meteo.com/v1/marine?latitude=${clat}&longitude=${clng}` +
      `&hourly=sea_level_height_msl&timezone=Asia/Jakarta&forecast_days=2`;

    try {
      const [wRes, mRes] = await Promise.allSettled([
        fetch(wxUrl).then((r) => r.json()),
        fetch(marineUrl).then((r) => r.json()),
      ]);

      if (id !== reqId.current) return;

      // ---- Cuaca (wajib) ----
      if (wRes.status !== 'fulfilled' || !wRes.value?.current) {
        // Gagal ambil live -> coba baca cache Supabase.
        const key = cacheKey(clat, clng);
        const { data: row } = await supabase
          .from('weather_cache')
          .select('payload')
          .eq('id', key)
          .maybeSingle();
        if (row?.payload) {
          setData(row.payload as WeatherTideData);
        } else {
          setError('Gagal memuat data cuaca. Cek koneksi internet.');
        }
        setLoading(false);
        return;
      }
      const w = wRes.value;
      const c = w.current;
      const hourlyTimes: string[] = w.hourly?.time || [];
      const from = indexFromNow(hourlyTimes);
      const hourly: HourlyPoint[] = (w.hourly?.time || [])
        .map((t: string, i: number) => ({
          time: t,
          temp: w.hourly.temperature_2m[i],
          code: w.hourly.weather_code[i],
          precipProb: w.hourly.precipitation_probability?.[i] ?? 0,
        }))
        .slice(from, from + 24);

      const daily: DailyPoint[] = (w.daily?.time || []).map((d: string, i: number) => ({
        date: d,
        code: w.daily.weather_code[i],
        tmax: w.daily.temperature_2m_max[i],
        tmin: w.daily.temperature_2m_min[i],
        precipProb: w.daily.precipitation_probability_max?.[i] ?? 0,
        wind: w.daily.wind_speed_10m_max?.[i] ?? 0,
      }));

      const now: WeatherNow = {
        temp: c.temperature_2m,
        feels: c.apparent_temperature,
        code: c.weather_code,
        humidity: c.relative_humidity_2m,
        wind: c.wind_speed_10m,
        windDir: c.wind_direction_10m,
        precip: c.precipitation,
        isDay: c.is_day === 1,
        sunrise: w.daily?.sunrise?.[0] ?? '',
        sunset: w.daily?.sunset?.[0] ?? '',
      };

      // ---- Pasang Surut (opsional) ----
      let tide: TideInfo | null = null;
      if (mRes.status === 'fulfilled' && mRes.value?.hourly?.sea_level_height_msl) {
        const m = mRes.value;
        const times: string[] = m.hourly.time;
        const heights: number[] = m.hourly.sea_level_height_msl;
        const mFrom = indexFromNow(times);
        const series = times
          .map((t: string, i: number) => ({ time: t, height: heights[i] }))
          .slice(mFrom, mFrom + 24);
        const cur = m.hourly.sea_level_height_msl[mFrom];
        const mean = heights.reduce((a: number, b: number) => a + b, 0) / heights.length;
        const extremes = findTideExtremes(times, heights);
        const future = extremes.filter((e) => e.time > times[mFrom]);
        const nextHigh = future.find((e) => e.type === 'high');
        const nextLow = future.find((e) => e.type === 'low');
        tide = {
          height: cur,
          mean,
          status: cur >= mean ? 'Pasang' : 'Surut',
          extremes,
          nextHigh,
          nextLow,
          series,
        };
      } else {
        setTideError(true);
      }

      const snapshot: WeatherTideData = {
        now,
        hourly,
        daily,
        tide,
        updatedAt: new Date().toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'Asia/Jakarta',
        }),
      };
      setData(snapshot);

      // Simpan snapshot ke Supabase (cache) agar tersimpan & bisa dibaca ulang.
      void supabase.from('weather_cache').upsert({
        id: cacheKey(clat, clng),
        latitude: clat,
        longitude: clng,
        locationName: locationName ?? '',
        payload: snapshot,
        fetchedAt: new Date().toISOString(),
      });
    } catch {
      if (id === reqId.current) setError('Gagal memuat data cuaca. Cek koneksi internet.');
    } finally {
      if (id === reqId.current) setLoading(false);
    }
  }, [enabled, lat, lng, locationName]);

  useEffect(() => {
    void load();
    // Auto-refresh tiap 10 menit
    const t = setInterval(() => void load(), 10 * 60 * 1000);
    return () => clearInterval(t);
  }, [load]);

  return { loading, error, data, tideError, refresh: () => void load() };
}
