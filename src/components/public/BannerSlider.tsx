import { useState, useEffect } from 'react';
import { useAppContext } from '../../store/AppContext';

export default function BannerSlider() {
  const { banners } = useAppContext();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [banners.length]);

  if (banners.length === 0) return null;

  return (
    <section className="px-4 mt-4">
      <div className="relative overflow-hidden rounded-xl h-44 shadow-2xl">
        <div
          className="flex transition-transform duration-500 ease-out h-full"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {banners.map((banner) => (
            <div key={banner.id} className="min-w-full relative h-full">
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
              <div className="absolute bottom-4 left-4 right-4 z-20">
                <span
                  className={`${
                    banner.tagColor === 'primary'
                      ? 'bg-primary text-on-primary-container'
                      : 'bg-secondary text-on-secondary-container'
                  } text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider`}
                >
                  {banner.tag}
                </span>
                <h2 className="font-inter text-on-surface mt-1 leading-tight text-xl font-semibold">
                  {banner.title}
                </h2>
              </div>
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url('${banner.imageUrl}')` }}
              />
            </div>
          ))}
        </div>
        {banners.length > 1 && (
          <div className="absolute bottom-3 right-4 z-30 flex gap-1.5">
            {banners.map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-opacity duration-300 ${
                  i === current ? 'bg-primary' : 'bg-primary/30'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
