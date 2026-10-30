import type { RefObject } from 'react';
import { useEffect, useRef } from 'react';
import { gridMoveOf, nextGridKeyOf } from '../season-keys';

const ROW_ATTRIBUTE = 'data-kk-numbered-row';

const focusRow = (root: HTMLElement, key: string): void => {
  const row = root.querySelector<HTMLElement>(`[${ROW_ATTRIBUTE}="${CSS.escape(key)}"]`);
  const target = row?.querySelector<HTMLElement>('button') ?? null;
  if (target === null) {
    return;
  }
  target.focus({ preventScroll: true });
  target.scrollIntoView({ block: 'nearest', inline: 'nearest' });
};

export const useSeasonKeys = (
  grid: readonly (readonly string[])[],
): RefObject<HTMLDivElement | null> => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = ref.current;
    if (root === null) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent): void => {
      const move = gridMoveOf(event.key);
      const row =
        event.target instanceof HTMLElement ? event.target.closest(`[${ROW_ATTRIBUTE}]`) : null;
      const key = row?.getAttribute(ROW_ATTRIBUTE) ?? null;
      if (move === null || key === null) {
        return;
      }
      const next = nextGridKeyOf(grid, key, move);
      event.preventDefault();
      if (next !== null) {
        focusRow(root, next);
      }
    };
    root.addEventListener('keydown', onKeyDown);

    return () => {
      root.removeEventListener('keydown', onKeyDown);
    };
  }, [grid]);

  return ref;
};
