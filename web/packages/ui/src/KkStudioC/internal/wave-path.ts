const BAR_SHARE = 0.62;
const MIN_BAR = 0.04;

export const wavePathOf = (values: readonly number[], width: number, height: number): string => {
  if (values.length === 0 || width <= 0) {
    return '';
  }

  const step = width / values.length;
  const bar = step * BAR_SHARE;
  const middle = height / 2;

  return values
    .map((value, index) => {
      const half = Math.max(MIN_BAR, Math.min(1, value)) * middle;

      return `M${(index * step).toFixed(1)} ${(middle - half).toFixed(1)}h${bar.toFixed(1)}v${(half * 2).toFixed(1)}h${(-bar).toFixed(1)}z`;
    })
    .join('');
};
