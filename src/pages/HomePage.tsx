import BannerSlider from '../components/public/BannerSlider';
import GridMenu from '../components/public/GridMenu';
import ShrimpPriceWidget from '../components/public/ShrimpPriceWidget';
import PromoSlider from '../components/public/PromoSlider';
import WeatherTide from '../components/public/WeatherTide';

export default function HomePage() {
  return (
    <>
      <BannerSlider />
      <WeatherTide />
      <GridMenu />
      <ShrimpPriceWidget />
      <PromoSlider />
    </>
  );
}
