export const WAVE_HEIGHT = 100;
const MID = WAVE_HEIGHT / 2;
const FLOOR = 0.03;

export const wavePathOf = (bars: readonly number[]): string => {
  if (bars.length === 0) {
    return '';
  }
  const top = bars.map((bar, index) => `${index},${MID - Math.max(FLOOR, bar) * MID}`);
  const bottom = bars
    .map((bar, index) => `${index + 1},${MID + Math.max(FLOOR, bar) * MID}`)
    .reverse();

  return `M0,${MID} L${top.join(' L')} L${bars.length},${MID} L${bottom.join(' L')} Z`;
};
