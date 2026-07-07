import { useState, useEffect } from 'react';
import { useAppContext } from '../../store/AppContext';

export default function PromoSlider() {
  const { promos } = useAppContext();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (promos.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % promos.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [promos.length]);

  if (promos.length === 0) return null;

  return (
    <section className="px-4 mt-6 mb-6">
      <div className="relative overflow-hidden rounded-xl shadow-xl border border-outline-variant/20 h-40 bg-surface-container">
        <div
          className="flex transition-transform duration-700 ease-in-out h-full"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {promos.map((promo) => (
            <div key={promo.id} className="min-w-full relative h-full flex items-center overflow-hidden">
              {promo.imageUrl ? (
                <>
                  <div className="absolute inset-0 bg-gradient-to-r from-surface-container via-surface-container/80 to-transparent z-10" />
                  <div
                    className="absolute right-0 top-0 bottom-0 w-3/5 bg-cover bg-center opacity-40"
                    style={{ backgroundImage: `url('${promo.imageUrl}')` }}
                  />
                </>
              ) : (
                <div className="absolute -right-6 -bottom-4 opacity-10 pointer-events-none">
                  <span
                    className="material-symbols-outlined text-primary"
                    style={{ fontSize: '140px' }}
                  >
                    {promo.icon || 'savings'}
                  </span>
                </div>
              )}
              <div className="relative z-20 px-5 flex-1">
                <p className="text-xl leading-tight mb-1 font-bold text-on-surface">{promo.title}</p>
                <p className="text-[12px] text-on-surface-variant mb-3">{promo.description}</p>
                <button className="bg-primary text-on-primary-container px-6 py-2 rounded-lg text-[13px] font-bold shadow-lg active:scale-95 transition-all">
                  {promo.buttonText}
                </button>
              </div>
            </div>
          ))}
        </div>
        {promos.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 flex gap-1">
            {promos.map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1 rounded-full ${
                  i === current ? 'bg-primary' : 'bg-primary/20'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
