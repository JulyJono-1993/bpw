import { useState } from 'react';
import { useAppContext, type SiteSettings } from '../../store/AppContext';
import { applyTheme } from '../../lib/theme';

const PRESETS: { name: string; primary: string; secondary: string; background: string }[] = [
  { name: 'Ocean', primary: '#00dddd', secondary: '#89ceff', background: '#0b1326' },
  { name: 'Emerald', primary: '#2ecc71', secondary: '#a8ff78', background: '#0a1f15' },
  { name: 'Sunset', primary: '#ff7e5f', secondary: '#feb47b', background: '#1f0f0a' },
  { name: 'Royal', primary: '#7c4dff', secondary: '#b388ff', background: '#120a26' },
  { name: 'Rose', primary: '#ff5c8a', secondary: '#ffa9c9', background: '#1f0a14' },
  { name: 'Gold', primary: '#ffb300', secondary: '#ffe082', background: '#1a1405' },
];

export default function SettingsAdmin() {
  const { settings, setSettings } = useAppContext();
  const [form, setForm] = useState<SiteSettings>(settings);
  const [saved, setSaved] = useState(false);

  const update = (patch: Partial<SiteSettings>) => {
    const next = { ...form, ...patch };
    setForm(next);
    setSaved(false);
    if (patch.primaryColor || patch.secondaryColor || patch.backgroundColor) {
      applyTheme(next.primaryColor, next.secondaryColor, next.backgroundColor);
    }
  };

  const handleSave = () => {
    setSettings(form);
    setSaved(true);
  };

  return (
    <div className="px-4 lg:px-0">
      <div className="flex items-center justify-between mb-4 lg:mb-6">
        <div>
          <h2 className="text-lg font-bold text-on-surface lg:hidden">Pengaturan</h2>
          <p className="hidden lg:block text-sm text-on-surface-variant">Profil & tema website</p>
        </div>
        <button
          onClick={handleSave}
          className="bg-primary text-on-primary-container px-4 py-1.5 lg:py-2 rounded-lg text-xs lg:text-sm font-bold flex items-center gap-1 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>save</span>
          Simpan
        </button>
      </div>

      {saved && (
        <div className="bg-primary-container/40 border border-primary/30 rounded-xl px-4 py-3 text-on-primary-container text-sm flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check_circle</span>
          Pengaturan disimpan
        </div>
      )}

      {/* Profil */}
      <div className="bg-surface-container rounded-xl border border-outline-variant/20 p-4 lg:p-6 mb-4 space-y-4">
        <h3 className="text-sm font-bold text-on-surface">Profil Organisasi</h3>
        <div>
          <label className="block text-on-surface-variant text-xs font-medium mb-1.5 uppercase tracking-wider">Nama Organisasi</label>
          <input
            type="text"
            value={form.orgName}
            onChange={(e) => update({ orgName: e.target.value })}
            className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-primary/50 transition-all"
            placeholder="BPW P3UW"
          />
        </div>
        <div>
          <label className="block text-on-surface-variant text-xs font-medium mb-1.5 uppercase tracking-wider">Nama Wilayah</label>
          <input
            type="text"
            value={form.regionName}
            onChange={(e) => update({ regionName: e.target.value })}
            className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-primary/50 transition-all"
            placeholder="Wilayah Lampung Timur"
          />
          <p className="text-[11px] text-on-surface-variant mt-1.5">Nama wilayah tampil di bawah judul organisasi.</p>
        </div>
      </div>

      {/* Tema Warna */}
      <div className="bg-surface-container rounded-xl border border-outline-variant/20 p-4 lg:p-6 mb-4 space-y-4">
        <h3 className="text-sm font-bold text-on-surface">Tema Warna</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4">
          <div>
            <label className="block text-on-surface-variant text-xs font-medium mb-1.5 uppercase tracking-wider">Warna Utama</label>
            <div className="flex items-center gap-2 bg-surface-container-high border border-outline-variant/30 rounded-xl px-3 py-2">
              <input
                type="color"
                value={form.primaryColor}
                onChange={(e) => update({ primaryColor: e.target.value })}
                className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer p-0"
              />
              <span className="text-sm text-on-surface font-mono">{form.primaryColor}</span>
            </div>
          </div>
          <div>
            <label className="block text-on-surface-variant text-xs font-medium mb-1.5 uppercase tracking-wider">Warna Sekunder</label>
            <div className="flex items-center gap-2 bg-surface-container-high border border-outline-variant/30 rounded-xl px-3 py-2">
              <input
                type="color"
                value={form.secondaryColor}
                onChange={(e) => update({ secondaryColor: e.target.value })}
                className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer p-0"
              />
              <span className="text-sm text-on-surface font-mono">{form.secondaryColor}</span>
            </div>
          </div>
          <div>
            <label className="block text-on-surface-variant text-xs font-medium mb-1.5 uppercase tracking-wider">Warna Latar</label>
            <div className="flex items-center gap-2 bg-surface-container-high border border-outline-variant/30 rounded-xl px-3 py-2">
              <input
                type="color"
                value={form.backgroundColor}
                onChange={(e) => update({ backgroundColor: e.target.value })}
                className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer p-0"
              />
              <span className="text-sm text-on-surface font-mono">{form.backgroundColor}</span>
            </div>
          </div>
        </div>

        <div>
          <p className="text-on-surface-variant text-xs font-medium uppercase tracking-wider mb-2">Preset Tema</p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                onClick={() => update({ primaryColor: p.primary, secondaryColor: p.secondary, backgroundColor: p.background })}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-outline-variant/30 text-xs font-medium text-on-surface hover:border-primary/40 transition-all"
              >
                <span className="w-4 h-4 rounded-full" style={{ background: p.primary }} />
                <span className="w-4 h-4 rounded-full -ml-3 ring-2 ring-surface-container" style={{ background: p.secondary }} />
                <span className="w-4 h-4 rounded-full -ml-3 ring-2 ring-surface-container" style={{ background: p.background }} />
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div>
          <p className="text-on-surface-variant text-xs font-medium uppercase tracking-wider mb-2">Preview</p>
          <div className="rounded-xl p-4 border border-outline-variant/20 space-y-3" style={{ background: form.backgroundColor }}>
            <h4 className="text-base font-bold text-primary">{form.orgName || 'BPW P3UW'}</h4>
            {form.regionName && <p className="text-xs text-on-surface-variant -mt-2">{form.regionName}</p>}
            <div className="flex gap-2">
              <button className="bg-primary text-on-primary-container px-4 py-2 rounded-lg text-sm font-bold">Tombol Utama</button>
              <button className="bg-secondary text-on-secondary px-4 py-2 rounded-lg text-sm font-bold">Sekunder</button>
            </div>
            <div className="flex gap-2">
              <span className="bg-primary-container text-on-primary-container text-[11px] px-2 py-0.5 rounded-full font-bold">Label</span>
              <span className="bg-secondary-container text-on-secondary-container text-[11px] px-2 py-0.5 rounded-full font-bold">Label</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
