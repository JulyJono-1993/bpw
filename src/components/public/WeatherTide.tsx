import { useAppContext } from '../../store/AppContext';
import { useWeatherTide } from '../../hooks/useWeatherTide';
import {
  buildPaths,
  compass,
  dayLabel,
  hhmm,
  weatherInfo,
} from '../../lib/weather';

function TideChart({ series }: { series: { time: string; height: number }[] }) {
  const heights = series.map((s) => s.height);
  const { line, area } = buildPaths(heights, 100, 40, 4);
  const min = Math.min(...heights);
  const max = Math.max(...heights);
  return (
    <div className="relative">
      <svg
        viewBox="0 0 100 40"
        preserveAspectRatio="none"
        className="w-full h-16 rounded-lg overflow-hidden"
      >
        <path d={area} fill="var(--color-secondary)" fillOpacity={0.18} />
        <path
          d={line}
          fill="none"
          stroke="var(--color-secondary)"
          strokeWidth={2}
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
        />
      </svg>
      <div className="flex justify-between text-[10px] text-on-surface-variant mt-1">
        <span>{min.toFixed(2)} m</span>
        <span>{max.toFixed(2)} m</span>
      </div>
    </div>
  );
}

function TempChart({ temps }: { temps: number[] }) {
  const { line, area } = buildPaths(temps, 100, 36, 4);
  return (
    <svg
      viewBox="0 0 100 36"
      preserveAspectRatio="none"
      className="w-full h-12 rounded-lg overflow-hidden"
    >
      <path d={area} fill="var(--color-primary)" fillOpacity={0.15} />
      <path
        d={line}
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth={2}
        vectorEffect="non-scaling-stroke"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StatChip({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="bg-surface-container-high rounded-xl px-3 py-2 flex items-center gap-2">
      <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '18px' }}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[10px] text-on-surface-variant leading-none">{label}</p>
        <p className="text-xs font-bold text-on-surface truncate">{value}</p>
      </div>
    </div>
  );
}

export default function WeatherTide({ variant = 'widget' }: { variant?: 'widget' | 'page' }) {
  const { settings } = useAppContext();
  const { latitude: lat, longitude: lng, showWeather, locationName } = settings;
  const { loading, error, data, tideError, refresh } = useWeatherTide({
    lat,
    lng,
    enabled: showWeather,
    locationName,
  });

  if (!showWeather) return null;

  if (loading) {
    return (
      <section className="px-4 mt-4">
        <div className="bg-surface-container rounded-xl border border-outline-variant/20 p-4 animate-pulse space-y-3">
          <div className="h-4 w-40 bg-surface-container-high rounded" />
          <div className="h-16 w-full bg-surface-container-high rounded-xl" />
          <div className="h-16 w-full bg-surface-container-high rounded-xl" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="px-4 mt-4">
        <div className="bg-surface-container rounded-xl border border-outline-variant/20 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px' }}>water_drop</span>
            <h3 className="text-sm font-bold text-on-surface">Cuaca &amp; Pasang Surut</h3>
          </div>
          <p className="text-xs text-error">{error}</p>
        </div>
      </section>
    );
  }

  const { now, hourly, daily, tide } = data;
  const wmo = now ? weatherInfo(now.code) : { label: '—', icon: 'cloud' };
  const temps = hourly.map((h) => h.temp);

  return (
    <section className="px-4 mt-4">
      <div className="bg-surface-container rounded-xl border border-outline-variant/20 overflow-hidden">
        {/* Header */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px' }}>water_drop</span>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-on-surface leading-tight">Cuaca &amp; Pasang Surut</h3>
                <p className="text-[11px] text-on-surface-variant truncate">{locationName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-full">
                Open-Meteo
              </span>
              <button
                onClick={refresh}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant active:scale-90 transition-transform"
                title="Segarkan"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>refresh</span>
              </button>
            </div>
          </div>

          {/* Cuaca saat ini */}
          <div className="bg-surface-container-high rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '44px' }}>
                {now ? (now.isDay ? wmo.icon : 'nightlight') : 'cloud'}
              </span>
              <div>
                <p className="text-3xl font-bold text-on-surface leading-none">
                  {now ? Math.round(now.temp) : '—'}°
                </p>
                <p className="text-xs text-on-surface-variant mt-1">{wmo.label}</p>
                {now && (
                  <p className="text-[11px] text-on-surface-variant">Terasa {Math.round(now.feels)}°</p>
                )}
              </div>
            </div>
            <div className="text-right text-[11px] text-on-surface-variant space-y-1">
              <p>🌅 {now ? hhmm(now.sunrise) : '—'}</p>
              <p>🌇 {now ? hhmm(now.sunset) : '—'}</p>
              <p>💧 {now?.humidity ?? '—'}%</p>
            </div>
          </div>

          {/* Statistik */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            <StatChip
              icon="air"
              label="Angin"
              value={now ? `${Math.round(now.wind)} km/j ${compass(now.windDir)}` : '—'}
            />
            <StatChip
              icon="umbrella"
              label="Curah Hujan"
              value={now ? `${now.precip} mm` : '—'}
            />
          </div>

          {/* Pasang Surut */}
          <div className="mt-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Pasang Surut</p>
              {tideError && (
                <span className="text-[10px] text-on-surface-variant">(data pasang tidak tersedia)</span>
              )}
            </div>
            {tide && tide.height != null ? (
              <>
                <div className="flex items-end justify-between mb-1">
                  <div>
                    <span className={`text-base font-bold ${tide.status === 'Pasang' ? 'text-secondary' : 'text-primary'}`}>
                      {tide.status}
                    </span>
                    <span className="text-xs text-on-surface-variant ml-1.5">{tide.height.toFixed(2)} m</span>
                  </div>
                  <div className="text-[11px] text-on-surface-variant text-right">
                    <p>⬆ Pasang {tide.nextHigh ? hhmm(tide.nextHigh.time) : '—'}</p>
                    <p>⬇ Surut {tide.nextLow ? hhmm(tide.nextLow.time) : '—'}</p>
                  </div>
                </div>
                {tide.series.length > 1 && <TideChart series={tide.series} />}
              </>
            ) : (
              <p className="text-xs text-on-surface-variant">Data pasang surut hanya tersedia di lokasi pesisir.</p>
            )}
          </div>

          {/* Grafik suhu per jam */}
          {variant === 'page' && temps.length > 1 && (
            <div className="mt-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-2">Suhu 24 Jam</p>
              <TempChart temps={temps} />
              <div className="flex justify-between text-[10px] text-on-surface-variant mt-1">
                <span>Sekarang</span>
                <span>+12j</span>
                <span>+24j</span>
              </div>
            </div>
          )}
        </div>

        {/* Prakiraan 7 hari (lengkap hanya di halaman /cuaca) */}
        {variant === 'page' && daily.length > 0 && (
          <div className="border-t border-outline-variant/20 px-2 py-1">
            {daily.map((d) => {
              const dw = weatherInfo(d.code);
              return (
                <div
                  key={d.date}
                  className="flex items-center justify-between px-2 py-2 border-b border-outline-variant/10 last:border-0"
                >
                  <p className="text-xs font-medium text-on-surface w-16">{dayLabel(d.date, daily[0].date)}</p>
                  <div className="flex items-center gap-1.5 flex-1 justify-center">
                    <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '18px' }}>
                      {dw.icon}
                    </span>
                    <span className="text-[11px] text-on-surface-variant">{dw.label}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs w-24 justify-end">
                    <span className="text-on-surface-variant">{Math.round(d.tmin)}°</span>
                    <span className="text-on-surface font-bold">{Math.round(d.tmax)}°</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {data.updatedAt && (
          <p className="text-[10px] text-on-surface-variant text-center py-2">
            Diperbarui {data.updatedAt} WIB
          </p>
        )}
      </div>
    </section>
  );
}
