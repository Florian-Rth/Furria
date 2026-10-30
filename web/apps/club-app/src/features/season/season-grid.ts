import type { ReadinessCheck, SeasonAct, SeasonAppearance } from './schemas';

export interface Readiness {
  done: number;
  total: number;
  ready: boolean;
  open: ReadinessCheck[];
}

export type SeasonCellState = 'none' | 'tray' | 'placed';

export interface SeasonCell {
  state: SeasonCellState;
  number: number | null;
  adjusted: boolean;
  appearance: SeasonAppearance | null;
}

const EMPTY_CELL: SeasonCell = { state: 'none', number: null, adjusted: false, appearance: null };

export const readinessOf = (act: SeasonAct): Readiness => {
  const done = act.readiness.filter((check) => check.done).length;

  return {
    done,
    total: act.readiness.length,
    ready: done === act.readiness.length,
    open: act.readiness.filter((check) => !check.done).map((check) => check.check),
  };
};

export const cellOf = (act: SeasonAct, eventId: number): SeasonCell => {
  const appearance = act.appearances.find((candidate) => candidate.eventId === eventId);

  if (appearance === undefined) {
    return EMPTY_CELL;
  }

  return {
    state: appearance.position === null ? 'tray' : 'placed',
    number: appearance.position === null ? null : appearance.position + 1,
    adjusted: appearance.changes.length > 0,
    appearance,
  };
};

export const eveningCountOf = (act: SeasonAct): number =>
  act.appearances.filter((appearance) => appearance.position !== null).length;
