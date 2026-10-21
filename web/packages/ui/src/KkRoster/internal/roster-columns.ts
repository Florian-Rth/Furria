export const COMPACT = '[data-kk-roster][data-compact="true"] &';

export interface RosterSpans {
  name: number;
  seats: number;
  flags: number;
}

export const WIDE_SPANS: RosterSpans = { name: 3, seats: 5, flags: 4 };
export const COMPACT_SPANS: RosterSpans = { name: 4, seats: 6, flags: 2 };
export const HOLDER_SPAN = 7;
export const SINCE_SPAN = 5;
