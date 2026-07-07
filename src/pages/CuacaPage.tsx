import WeatherTide from '../components/public/WeatherTide';

export default function CuacaPage() {
  return (
    <div className="mt-4 pb-6">
      <div className="px-4 mb-2">
        <h2 className="text-xl font-bold text-on-surface">Dashboard Cuaca</h2>
        <p className="text-xs text-on-surface-variant">
          Pantau cuaca &amp; pasang surut terkini. Data gratis dari Open-Meteo.
        </p>
      </div>
      <WeatherTide variant="page" />
    </div>
  );
}
