import { useState } from 'react';
import { useAppContext } from '../store/AppContext';

export default function InfoPage() {
  const { infoItems } = useAppContext();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="px-4 mt-4 pb-6">
      <h2 className="text-xl font-bold text-on-surface mb-4">Informasi</h2>
      <div className="space-y-3">
        {infoItems.map((item) => (
          <div
            key={item.id}
            className="bg-surface-container rounded-xl border border-outline-variant/20 overflow-hidden"
          >
            <button
              onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
              className="w-full flex items-center gap-3 p-4 text-left active:bg-white/5 transition-colors"
            >
              <div className="bg-primary/10 text-primary rounded-full flex items-center justify-center w-10 h-10 flex-shrink-0">
                <span className="material-symbols-outlined">{item.icon}</span>
              </div>
              <span className="flex-1 font-semibold text-on-surface text-sm">{item.title}</span>
              <span
                className="material-symbols-outlined text-on-surface-variant transition-transform duration-300"
                style={{
                  fontSize: '20px',
                  transform: expandedId === item.id ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              >
                expand_more
              </span>
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ${
                expandedId === item.id ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="px-4 pb-4 text-on-surface-variant text-sm leading-relaxed whitespace-pre-line border-t border-outline-variant/20 pt-3">
                {item.content}
              </div>
            </div>
          </div>
        ))}
      </div>
      {infoItems.length === 0 && (
        <div className="text-center py-12 text-on-surface-variant">
          <span className="material-symbols-outlined text-4xl mb-2 block opacity-30">info</span>
          <p>Belum ada informasi</p>
        </div>
      )}
    </div>
  );
}
