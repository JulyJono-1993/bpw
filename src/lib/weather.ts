export const WMO: Record<number, { label: string; icon: string }> = {
  0: { label: 'Cerah', icon: 'sunny' },
  1: { label: 'Cerah Berawan', icon: 'partly_cloudy_day' },
  2: { label: 'Berawan', icon: 'cloud' },
  3: { label: 'Berawan Tebal', icon: 'cloud' },
  45: { label: 'Berkabut', icon: 'foggy' },
  48: { label: 'Berkabut', icon: 'foggy' },
  51: { label: 'Gerimis', icon: 'rainy' },
  53: { label: 'Gerimis', icon: 'rainy' },
  55: { label: 'Gerimis', icon: 'rainy' },
  56: { label: 'Gerimis', icon: 'rainy' },
  57: { label: 'Gerimis', icon: 'rainy' },
  61: { label: 'Hujan', icon: 'rainy' },
  63: { label: 'Hujan', icon: 'rainy' },
  65: { label: 'Hujan Lebat', icon: 'thunderstorm' },
  66: { label: 'Hujan', icon: 'rainy' },
  67: { label: 'Hujan', icon: 'rainy' },
  71: { label: 'Salju', icon: 'ac_unit' },
  73: { label: 'Salju', icon: 'ac_unit' },
  75: { label: 'Salju', icon: 'ac_unit' },
  77: { label: 'Salju', icon: 'ac_unit' },
  80: { label: 'Hujan Singkat', icon: 'rainy' },
  81: { label: 'Hujan Singkat', icon: 'rainy' },
  82: { label: 'Hujan Singkat', icon: 'rainy' },
  85: { label: 'Hujan Salju', icon: 'ac_unit' },
  86: { label: 'Hujan Salju', icon: 'ac_unit' },
  95: { label: 'Badai Petir', icon: 'thunderstorm' },
  96: { label: 'Badai Petir', icon: 'thunderstorm' },
  99: { label: 'Badai Petir', icon: 'thunderstorm' },
};

export function weatherInfo(code: number): { label: string; icon: string } {
  return WMO[code] || { label: '—', icon: 'cloud' };
}

export function compass(deg: number): string {
  const dirs = ['Utara', 'Timur Laut', 'Timur', 'Tenggara', 'Selatan', 'Barat Daya', 'Barat', 'Barat Laut'];
  return dirs[Math.round((((deg % 360) + 360) % 360) / 45) % 8];
}

// Waktu lokal WIB (Asia/Jakarta) sebagai string "YYYY-MM-DDTHH:mm"
// cocok dengan format `time` dari Open-Meteo saat timezone=Asia/Jakarta.
export function nowJakartaStr(): string {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  return fmt.format(new Date()).replace(', ', 'T');
}

export function hhmm(iso: string): string {
  return iso.slice(11, 16);
}

const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const HARI_PENDEK = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export function dayLabel(dateStr: string, todayStr: string): string {
  if (dateStr === todayStr) return 'Hari ini';
  const d = new Date(dateStr + 'T00:00:00');
  return HARI_PENDEK[d.getDay()];
}

export function fullDayLabel(dateStr: string, todayStr: string): string {
  if (dateStr === todayStr) return 'Hari ini';
  const d = new Date(dateStr + 'T00:00:00');
  return HARI[d.getDay()];
}

// Cari indeks waktu pertama yang >= sekarang.
export function indexFromNow(times: string[]): number {
  const now = nowJakartaStr();
  const i = times.findIndex((t) => t >= now);
  return i < 0 ? 0 : i;
}

export interface TideExtreme {
  time: string;
  height: number;
  type: 'high' | 'low';
}

// Deteksi pasang tertinggi & surut terendah dari deret ketinggian per jam.
// Menggunakan jendela ±2 jam agar tahan terhadap fluktuasi kecil.
export function findTideExtremes(times: string[], heights: number[]): TideExtreme[] {
  const out: TideExtreme[] = [];
  const w = 2;
  for (let i = w; i < heights.length - w; i++) {
    let isMax = true;
    let isMin = true;
    for (let j = i - w; j <= i + w; j++) {
      if (heights[j] > heights[i]) isMax = false;
      if (heights[j] < heights[i]) isMin = false;
    }
    if (isMax) out.push({ time: times[i], height: heights[i], type: 'high' });
    else if (isMin) out.push({ time: times[i], height: heights[i], type: 'low' });
  }
  return out;
}

// Bangun path SVG (line & area) dari deret nilai, diskalakan ke viewBox.
export function buildPaths(values: number[], w: number, h: number, pad = 3): { line: string; area: string } {
  if (!values.length) return { line: '', area: '' };
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const n = values.length;
  const pts = values.map((v, i) => {
    const x = (i / (n - 1)) * w;
    const y = h - pad - ((v - min) / range) * (h - 2 * pad);
    return `${(i === 0 ? 'M' : 'L')}${x.toFixed(2)},${y.toFixed(2)}`;
  });
  const line = pts.join(' ');
  const area = `${line} L${w.toFixed(2)},${h} L0,${h} Z`;
  return { line, area };
}
