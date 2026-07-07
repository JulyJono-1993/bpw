import BannerSlider from '../components/public/BannerSlider';
import GridMenu from '../components/public/GridMenu';
import ShrimpPriceWidget from '../components/public/ShrimpPriceWidget';
import PromoSlider from '../components/public/PromoSlider';

export default function HomePage() {
  return (
    <>
      <BannerSlider />
      <GridMenu />
      <ShrimpPriceWidget />
      <PromoSlider />
    </>
  );
}
