const FULL_TURN = Math.PI * 2;
const QUARTER_TURN = Math.PI / 2;
const PRECISION = 10;

const round = (value: number): number => Math.round(value * PRECISION) / PRECISION;

export const starPoints = (
  cx: number,
  cy: number,
  outer: number,
  inner: number,
  rays: number,
): string =>
  Array.from({ length: rays * 2 }, (_, index) => {
    const radius = index % 2 === 0 ? outer : inner;
    const angle = (index * FULL_TURN) / (rays * 2) - QUARTER_TURN;

    return `${round(cx + radius * Math.cos(angle))},${round(cy + radius * Math.sin(angle))}`;
  }).join(' ');
