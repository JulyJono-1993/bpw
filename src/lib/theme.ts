function hexToRgb(hex: string): [number, number, number] {
  let h = (hex || '').replace('#', '').trim();
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h || '000000', 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map((x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, '0'))
      .join('')
  );
}

export function mix(a: string, b: string, t: number): string {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  return rgbToHex(
    ca[0] + (cb[0] - ca[0]) * t,
    ca[1] + (cb[1] - ca[1]) * t,
    ca[2] + (cb[2] - ca[2]) * t
  );
}

function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((x) => {
    x /= 255;
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastText(hex: string): string {
  return luminance(hex) > 0.5 ? '#000000' : '#ffffff';
}

export function applyTheme(primary: string, secondary: string, background: string) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const set = (name: string, value: string) => root.style.setProperty(name, value);

  // Background & surface scale (selalu tema gelap)
  set('--color-background', background);
  set('--color-surface', background);
  set('--color-surface-dim', mix(background, '#000000', 0.18));
  set('--color-surface-container-lowest', mix(background, '#000000', 0.45));
  set('--color-surface-container-low', mix(background, '#ffffff', 0.06));
  set('--color-surface-container', mix(background, '#ffffff', 0.1));
  set('--color-surface-container-high', mix(background, '#ffffff', 0.18));
  set('--color-surface-container-highest', mix(background, '#ffffff', 0.22));
  set('--color-surface-bright', mix(background, '#ffffff', 0.25));
  set('--color-surface-variant', mix(background, '#ffffff', 0.12));
  set('--color-on-background', contrastText(background));
  set('--color-on-surface', contrastText(background));
  set('--color-inverse-surface', contrastText(background));
  set('--color-inverse-on-surface', mix(background, '#000000', 0.2));
  set('--color-outline-variant', mix(background, '#ffffff', 0.18));
  set('--color-outline', mix(background, '#ffffff', 0.35));

  // Primary family
  set('--color-primary', primary);
  set('--color-on-primary', contrastText(primary));
  set('--color-primary-container', mix(primary, '#ffffff', 0.82));
  set('--color-on-primary-container', mix(primary, '#000000', 0.55));
  set('--color-primary-fixed', mix(primary, '#ffffff', 0.82));
  set('--color-primary-fixed-dim', mix(primary, '#ffffff', 0.7));
  set('--color-on-primary-fixed', mix(primary, '#000000', 0.6));
  set('--color-on-primary-fixed-variant', mix(primary, '#000000', 0.45));
  set('--color-inverse-primary', mix(primary, '#000000', 0.35));
  set('--color-surface-tint', primary);

  // Secondary family
  set('--color-secondary', secondary);
  set('--color-on-secondary', contrastText(secondary));
  set('--color-secondary-container', mix(secondary, '#ffffff', 0.82));
  set('--color-on-secondary-container', mix(secondary, '#000000', 0.55));
  set('--color-secondary-fixed', mix(secondary, '#ffffff', 0.82));
  set('--color-secondary-fixed-dim', mix(secondary, '#ffffff', 0.7));
  set('--color-on-secondary-fixed', mix(secondary, '#000000', 0.6));
  set('--color-on-secondary-fixed-variant', mix(secondary, '#000000', 0.45));
}
