export const kkTokens = {
  color: {
    light: {
      bg: '#FBF4E6',
      panel: '#FFFFFF',
      panel2: '#FBF8F1',
      ink: '#1A1411',
      sub: 'rgba(26,20,17,0.6)',
      faint: 'rgba(26,20,17,0.4)',
      red: '#E11D2A',
      redDk: '#B3101C',
      gold: '#F4B400',
      green: '#2E9E5B',
      blue: '#2F6DA8',
      line: 'rgba(26,20,17,0.12)',
      line2: 'rgba(26,20,17,0.07)',
      onRed: '#FFFFFF',
      photoScrim:
        'linear-gradient(to bottom, rgba(20,15,12,0.58) 0%, rgba(20,15,12,0.12) 19%, rgba(20,15,12,0.12) 42%, rgba(20,15,12,0.72) 76%, rgba(20,15,12,0.94) 100%)',
    },
    dark: {
      bg: '#15110E',
      panel: '#221B16',
      panel2: '#1B1512',
      ink: '#FBF4E6',
      sub: 'rgba(251,244,230,0.6)',
      faint: 'rgba(251,244,230,0.4)',
      red: '#FF3B47',
      redDk: '#E11D2A',
      gold: '#FFC42E',
      green: '#2E9E5B',
      blue: '#2F6DA8',
      line: 'rgba(251,244,230,0.16)',
      line2: 'rgba(251,244,230,0.09)',
      onRed: '#FFFFFF',
      photoScrim:
        'linear-gradient(to bottom, rgba(20,15,12,0.72) 0%, rgba(20,15,12,0.24) 19%, rgba(20,15,12,0.24) 42%, rgba(20,15,12,0.82) 76%, rgba(20,15,12,0.97) 100%)',
    },
  },
  radius: {
    base: 14,
    chip: 20,
    pill: 50,
  },
  layout: {
    gutterX: { xs: 3, md: 7 },
    gutterY: { xs: 4, md: 8 },
    sectionGap: { xs: 8, md: 12 },
    blockGap: { xs: 4, md: 6 },
    bandY: { xs: 6, md: 10 },
    fieldGap: 3,
    mastheadClearance: 2,
  },
  measure: {
    lead: '48rem',
    note: '34rem',
  },
  opacity: {
    onAccent: 0.92,
    onAccentMuted: 0.85,
    watermark: 0.1,
    onAccentWash: 0.12,
  },
  tapTarget: '2.75rem',
  line: {
    hair: 1,
    section: 2,
    page: 3,
  },
  eyebrow: {
    fontWeight: 900,
    letterSpacing: '0.2em',
    lineHeight: 1.4,
  },
  font: {
    display: "'Anton', sans-serif",
    body: "'Archivo', sans-serif",
  },
  shadow: {
    rest: '0 1px 2px rgba(26,20,17,0.05)',
    raised: '0 12px 32px rgba(26,20,17,0.12)',
    posterOffset: '3px 3px 0',
  },
  aspectRatio: {
    portrait: '4 / 5',
    landscape: '7 / 5',
    banner: '2 / 1',
  },
  overlay: {
    onPhotoText: '#FFFFFF',
    textShadow: '0 4px 34px rgba(0,0,0,0.5)',
  },
  glass: {
    tintOpacity: 0.7,
    blur: '6px',
  },
  photo: {
    placeholderSurface: '#CFCBC4',
  },
} as const;

export type KkColorTokens = (typeof kkTokens.color)[keyof typeof kkTokens.color];
