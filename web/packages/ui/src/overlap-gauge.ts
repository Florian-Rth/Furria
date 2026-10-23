export const GAUGE_LENGTH = 100;

const MAX_SEGMENTS = 16;

export interface GaugeSegment {
  key: string;
  filled: boolean;
  dash: string;
  offset: number;
}

const segmentOf = (key: string, filled: boolean, start: number, length: number, gap: number) => {
  const drawn = Math.max(length - gap, 0);

  return {
    key,
    filled,
    dash: `${drawn} ${GAUGE_LENGTH - drawn}`,
    offset: -(start + gap / 2),
  };
};

export const gaugeSegmentsOf = (shared: number, total: number, gap: number): GaugeSegment[] => {
  if (total <= 0) {
    return [];
  }

  const filledCount = Math.min(Math.max(shared, 0), total);

  if (total <= MAX_SEGMENTS) {
    const length = GAUGE_LENGTH / total;
    const segmentGap = total > 1 ? gap : 0;

    return Array.from({ length: total }, (_, index) =>
      segmentOf(`p${index}`, index < filledCount, index * length, length, segmentGap),
    );
  }

  const filledLength = (filledCount / total) * GAUGE_LENGTH;
  const parts = [
    { key: 'shared', filled: true, start: 0, length: filledLength },
    { key: 'rest', filled: false, start: filledLength, length: GAUGE_LENGTH - filledLength },
  ].filter((part) => part.length > 0);
  const partGap = parts.length > 1 ? gap : 0;

  return parts.map((part) => segmentOf(part.key, part.filled, part.start, part.length, partGap));
};
