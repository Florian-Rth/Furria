export type KkMetal = 'bronze' | 'silver' | 'gold' | 'garnet' | 'onyx' | 'brilliant';

export type KkMetalGradient = 'bronze' | 'silver' | 'gold' | 'brilliant';

export type KkEnamel = 'red' | 'onyx';

interface LapRung {
  pieces: number;
  metal: KkMetal;
}

const LAP_RUNGS: readonly LapRung[] = [
  { pieces: 5, metal: 'bronze' },
  { pieces: 6, metal: 'silver' },
  { pieces: 11, metal: 'gold' },
  { pieces: 11, metal: 'garnet' },
  { pieces: 11, metal: 'onyx' },
  { pieces: 11, metal: 'brilliant' },
];

const LAP_CLOSES: readonly number[] = LAP_RUNGS.map((_, index) =>
  LAP_RUNGS.slice(0, index + 1).reduce((total, rung) => total + rung.pieces, 0),
);

const MAX_SESSIONS = LAP_CLOSES.at(-1) ?? 0;

export interface BareLap {
  kind: 'none';
}

export interface MetalLap {
  kind: 'open' | 'closed';
  index: number;
  pieces: number;
  struck: number;
  metal: KkMetal;
  under: KkMetal | null;
}

export type LapState = BareLap | MetalLap;

const clampSessions = (sessions: number): number =>
  Math.min(Math.max(Math.floor(sessions), 0), MAX_SESSIONS);

const lapStartOf = (index: number): number => (index === 0 ? 0 : (LAP_CLOSES[index - 1] ?? 0));

export const lapOf = (sessions: number, holdOpen = false): LapState => {
  const counted = clampSessions(sessions);
  const index = LAP_CLOSES.findIndex((close) => counted <= close);
  const rung = LAP_RUNGS[index];

  if (counted === 0 || rung === undefined) {
    return { kind: 'none' };
  }

  const struck = counted - lapStartOf(index);
  const closed = struck === rung.pieces && !holdOpen;

  return {
    kind: closed ? 'closed' : 'open',
    index,
    pieces: rung.pieces,
    struck,
    metal: rung.metal,
    under: LAP_RUNGS[index - 1]?.metal ?? null,
  };
};

export const isLapClosingAt = (sessions: number): boolean => LAP_CLOSES.includes(sessions);

export const nextLapCloseOf = (sessions: number): number | null =>
  LAP_CLOSES.find((close) => close > sessions) ?? null;

export const gradientOf = (metal: KkMetal): KkMetalGradient => {
  switch (metal) {
    case 'garnet':
    case 'onyx':
      return 'gold';
    default:
      return metal;
  }
};

export const enamelOf = (metal: KkMetal): KkEnamel | null => {
  switch (metal) {
    case 'garnet':
      return 'red';
    case 'onyx':
      return 'onyx';
    default:
      return null;
  }
};
