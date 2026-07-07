import { useAppContext } from '../../store/AppContext';
import { useNavigate } from 'react-router-dom';

function formatRupiah(num: number) {
  return 'Rp ' + num.toLocaleString('id-ID');
}

export default function ShrimpPriceWidget() {
  const { shrimpPrices } = useAppContext();
  const navigate = useNavigate();

  if (shrimpPrices.length === 0) return null;

  return (
    <section className="px-4 mt-6">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-on-surface font-bold text-xl">Harga Udang Terkini</h3>
        <button onClick={() => navigate('/berita')} className="text-primary font-geist text-sm font-medium">
          Lihat Semua
        </button>
      </div>
      <div className="bg-surface-container-high rounded-xl overflow-hidden border border-outline-variant/20 shadow-lg">
        <div className="bg-surface-container-highest/30 px-4 py-2.5 flex justify-between items-center border-b border-outline-variant/20">
          <span className="text-[10px] font-bold text-primary tracking-widest uppercase">
            Daftar Buyer
          </span>
          <span className="text-[10px] font-medium text-on-surface-variant/80">Harga per Kg</span>
        </div>
        <div className="divide-y divide-outline-variant/20">
          {shrimpPrices.slice(0, 3).map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 active:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>store</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-geist text-sm text-on-surface font-semibold truncate">{item.namaBuyer}</p>
                  <p className="text-[11px] text-on-surface-variant">{item.tanggalUpdate}</p>
                </div>
              </div>
              <div className="text-right ml-2">
                <p className="font-geist text-sm text-primary font-bold">{formatRupiah(item.hargaStandar)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
