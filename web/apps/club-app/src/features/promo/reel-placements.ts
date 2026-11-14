export const HERO_PHONE = { centerX: 870, centerY: 360, tilt: -3, turn: -16 } as const;
export const CREST_CENTER = { x: 270, y: 380 } as const;
export const CREST_ORIGIN = {
  x: (CREST_CENTER.x / 1280) * 100,
  y: (CREST_CENTER.y / 720) * 100,
} as const;
export const HERO_QR = { right: 1140, bottom: 550 } as const;
