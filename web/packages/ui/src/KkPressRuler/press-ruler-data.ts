import type { KkRegisterMarkState } from '../KkRegisterMark';

export type KkPressRulerMarkState = Exclude<KkRegisterMarkState, 'loose'>;

export interface KkPressRulerMark {
  id: string;
  state: KkPressRulerMarkState;
  share: number;
  day: string;
  dayLabel: string;
  title: string;
}

export interface KkPressRulerLane {
  key: string;
  yearLabel: string;
  numberLabel: string;
  count: number;
  present: boolean;
  marks: readonly KkPressRulerMark[];
  festStart: number;
  roseMonday: number;
  summerStart: number;
  seasonTicks: readonly number[];
  summerTicks: readonly number[];
  dayLabelAt: (share: number) => string;
}

export type KkPressRulerAxisKind = 'opening' | 'month' | 'fest' | 'summer';

export interface KkPressRulerAxisLabel {
  text: string;
  share: number;
  kind: KkPressRulerAxisKind;
}

export interface KkPressRulerLegendEntry {
  state: KkRegisterMarkState;
  count: number;
  label: string;
}

export interface KkPressRulerLabels {
  today: string;
  laneOf: (lane: KkPressRulerLane) => string;
  marksOf: (count: number) => string;
  noMarks: string;
  moreOf: (count: number) => string;
}
