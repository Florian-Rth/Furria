const AMPLITUDE = 0.46;
const CENTRE = 0.5;

export const wavePathOf = (values: readonly number[], lengthSeconds: number): string => {
  if (values.length === 0 || lengthSeconds <= 0) {
    return '';
  }
  const step = lengthSeconds / values.length;
  const top = values.map(
    (value, index) =>
      `${index === 0 ? 'M' : 'L'}${(index + 0.5) * step} ${CENTRE - value * AMPLITUDE}`,
  );
  const bottom = values
    .map((value, index) => `L${(index + 0.5) * step} ${CENTRE + value * AMPLITUDE}`)
    .reverse();

  return `${top.join('')}${bottom.join('')}Z`;
};
