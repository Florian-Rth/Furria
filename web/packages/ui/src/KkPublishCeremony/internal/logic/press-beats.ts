export type KkPressPhase = 'idle' | 'register' | 'strike' | 'cut' | 'stamp' | 'settled';

export const KK_PRESS_BEATS_MS = {
  registerAtLeast: 600,
  strike: 120,
  inkRoll: 1100,
  cut: 180,
  stamp: 900,
  slip: 420,
  rain: 2400,
  rainFade: 700,
  stampShown: 2800,
  stampLeave: 450,
} as const;

export const isKkPressBusy = (phase: KkPressPhase): boolean =>
  phase !== 'idle' && phase !== 'settled';

export const hasKkPressCut = (phase: KkPressPhase): boolean =>
  phase === 'cut' || phase === 'stamp' || phase === 'settled';

export const isKkPressStamped = (phase: KkPressPhase): boolean =>
  phase === 'stamp' || phase === 'settled';
