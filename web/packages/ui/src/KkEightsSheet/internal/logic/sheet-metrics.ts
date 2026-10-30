export type KkEightsDensity = 'half' | 'eight' | 'two' | 'all';

export const SHEET_TEMPLATE = 'var(--kk-eights-template)';
export const SHEET_ROW = 'var(--kk-eights-row)';
export const SHEET_HEAD = 'var(--kk-eights-head)';
export const SHEET_COLUMNS = 'var(--kk-eights-columns)';

export const SHEET_SCROLLER = '[data-kk-eights-scroller]';
export const SHEET_COUNT = '[data-kk-eights-count]';
export const SHEET_ROW_SELECTOR = '[data-kk-eights-row]';

const ROW_HEIGHTS: Record<KkEightsDensity, string> = {
  half: '3.5rem',
  eight: '2.75rem',
  two: '2.75rem',
  all: '1.75rem',
};

export const rowHeightOf = (density: KkEightsDensity): string => ROW_HEIGHTS[density];

const COUNTS_PER_EIGHT = 8;
const HALF = 4;

const DENSE_COLUMNS = 16;
const SHOWN_IN_DENSE = new Set([1, 5]);

export const headLabelOf = (column: number, columns: number): string => {
  if (columns < COUNTS_PER_EIGHT) {
    return `${column + 1}·${column + 1 + HALF}`;
  }
  const count = (column % COUNTS_PER_EIGHT) + 1;

  return columns > DENSE_COLUMNS && !SHOWN_IN_DENSE.has(count) ? '' : String(count);
};

export const secondsUnder = (x: number, y: number, selector: string): number | null => {
  const hit = document.elementFromPoint(x, y)?.closest<HTMLElement>(selector);
  const seconds = hit?.dataset.seconds;

  return seconds === undefined ? null : Number(seconds);
};

export const startEdgeDrag = (
  selector: string,
  onMove: (seconds: number) => void,
  onEnd: () => void,
): void => {
  const move = (event: PointerEvent): void => {
    const seconds = secondsUnder(event.clientX, event.clientY, selector);
    if (seconds !== null) {
      onMove(seconds);
    }
  };
  const finish = (): void => {
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', finish);
    window.removeEventListener('pointercancel', finish);
    onEnd();
  };
  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', finish);
  window.addEventListener('pointercancel', finish);
};

export const prefersStillMotion = (): boolean =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
