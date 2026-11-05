export type KkPourRunwayReach = 'still' | 'within' | 'beyond';

export type KkPourRunwayMarkKind = 'now' | 'empty' | 'scale' | 'beyond';

export type KkPourRunwayMarkAlign = 'start' | 'center' | 'end';

export interface KkPourRunwayMark {
  kind: KkPourRunwayMarkKind;
  share: number;
  align: KkPourRunwayMarkAlign;
}

export interface KkPourRunway {
  reach: KkPourRunwayReach;
  fill: number;
  weeks: readonly number[];
  marks: readonly KkPourRunwayMark[];
}

export interface KkPourRunwayFrame {
  scaleDays: number;
  edgeShare: number;
  scaleRoom: number;
  nowRoom: number;
}

const round = (value: number): number => Math.round(value * 10_000) / 10_000;

const NOW_MARK: KkPourRunwayMark = { kind: 'now', share: 0, align: 'start' };

const emptyAlignOf = (fill: number, edgeShare: number): KkPourRunwayMarkAlign => {
  if (fill >= 1 - edgeShare) {
    return 'end';
  }

  return fill <= edgeShare ? 'start' : 'center';
};

const reachOf = (
  stock: number,
  forecastDays: number | null,
  scaleDays: number,
): KkPourRunwayReach => {
  if (forecastDays === null || stock <= 0) {
    return 'still';
  }

  return forecastDays > scaleDays ? 'beyond' : 'within';
};

export const stockRunwayOf = (
  stock: number,
  forecastDays: number | null,
  frame: KkPourRunwayFrame,
): KkPourRunway => {
  const weeks = Array.from({ length: Math.floor((frame.scaleDays - 1) / 7) }, (_, index) =>
    round(((index + 1) * 7) / frame.scaleDays),
  );
  const reach = reachOf(stock, forecastDays, frame.scaleDays);
  const scale: KkPourRunwayMark = { kind: 'scale', share: 1, align: 'end' };

  if (reach === 'still') {
    return { reach, fill: 0, weeks, marks: [NOW_MARK, scale] };
  }
  if (reach === 'beyond') {
    return { reach, fill: 1, weeks, marks: [NOW_MARK, { kind: 'beyond', share: 1, align: 'end' }] };
  }

  const fill = round(Math.max(0, forecastDays ?? 0) / frame.scaleDays);
  const empty: KkPourRunwayMark = {
    kind: 'empty',
    share: fill,
    align: emptyAlignOf(fill, frame.edgeShare),
  };
  const withScale = fill <= 1 - frame.scaleRoom ? [scale] : [];
  const withNow = fill >= frame.nowRoom ? [NOW_MARK] : [];

  return { reach, fill, weeks, marks: [...withNow, empty, ...withScale] };
};
