export const PROMO_CANVAS = { width: 1280, height: 720 } as const;

export const PROMO_GUTTER = 64;
export const PROMO_MASTHEAD_TOP = 28;
export const PROMO_FOOT_HEIGHT = 58;

export const PROMO_PHONE = {
  screenWidth: 390,
  screenHeight: 844,
  bezel: 11,
  radius: 58,
  screenRadius: 47,
  scale: 0.62,
} as const;

export const PROMO_GRAIN_OPACITY = 0.07;
export const PROMO_WATERMARK_SIZE = 900;
export const PROMO_WATERMARK_OPACITY = 0.045;

export const PROMO_SHADOW = {
  device:
    '0 2px 3px rgba(16,18,22,0.18), 0 24px 48px -12px rgba(16,18,22,0.32), 0 60px 120px -30px rgba(16,18,22,0.38)',
  card: '0 1px 2px rgba(16,18,22,0.08), 0 18px 40px -14px rgba(16,18,22,0.28)',
} as const;

export const PROMO_GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.08 0 0 0 0 0.09 0 0 0 0 0.1 0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23g)'/></svg>",
)}")`;
