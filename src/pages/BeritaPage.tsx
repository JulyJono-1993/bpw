import { useState } from 'react';
import { useAppContext } from '../store/AppContext';

export default function BeritaPage() {
  const { news } = useAppContext();
  const [selectedNews, setSelectedNews] = useState<string | null>(null);

  const selected = news.find((n) => n.id === selectedNews);

  if (selected) {
    return (
      <div className="px-4 mt-4 pb-6">
        <button
          onClick={() => setSelectedNews(null)}
          className="flex items-center gap-1 text-primary font-geist text-sm font-medium mb-4"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
          Kembali
        </button>
        <div className="rounded-xl overflow-hidden h-48 mb-4">
          <img src={selected.imageUrl} alt={selected.title} className="w-full h-full object-cover" />
        </div>
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-primary/20 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
            {selected.category}
          </span>
          <span className="text-[11px] text-on-surface-variant">{selected.date}</span>
        </div>
        <h2 className="text-xl font-bold text-on-surface mb-3">{selected.title}</h2>
        <div className="text-on-surface-variant text-sm leading-relaxed whitespace-pre-line">
          {selected.content}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 mt-4 pb-6">
      <h2 className="text-xl font-bold text-on-surface mb-4">Berita & Edukasi</h2>
      <div className="space-y-3">
        {news.map((item) => (
          <button
            key={item.id}
            onClick={() => setSelectedNews(item.id)}
            className="w-full bg-surface-container rounded-xl border border-outline-variant/20 overflow-hidden flex gap-3 active:scale-[0.98] transition-all text-left"
          >
            <div className="w-24 h-24 flex-shrink-0">
              <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 py-3 pr-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-primary/20 text-primary text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  {item.category}
                </span>
                <span className="text-[10px] text-on-surface-variant">{item.date}</span>
              </div>
              <h3 className="text-sm font-semibold text-on-surface leading-tight line-clamp-2">
                {item.title}
              </h3>
              <p className="text-[11px] text-on-surface-variant mt-1 line-clamp-2">{item.excerpt}</p>
            </div>
          </button>
        ))}
      </div>
      {news.length === 0 && (
        <div className="text-center py-12 text-on-surface-variant">
          <span className="material-symbols-outlined text-4xl mb-2 block opacity-30">article</span>
          <p>Belum ada berita</p>
        </div>
      )}
    </div>
  );
}
