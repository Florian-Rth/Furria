import type { KeyboardEvent } from 'react';
import { gridStepOf, spotKeyOf, spotOf } from '../season-c-keys';

export const SPOT_ATTRIBUTE = 'data-season-c-spot';

export const useSeasonCKeys = (
  rows: number,
  columns: number,
): ((event: KeyboardEvent<HTMLElement>) => void) => {
  return (event) => {
    if (!(event.target instanceof HTMLElement)) {
      return;
    }
    const holder = event.target.closest(`[${SPOT_ATTRIBUTE}]`);
    const from = spotOf(holder?.getAttribute(SPOT_ATTRIBUTE) ?? undefined);
    const to = from === null ? null : gridStepOf(event.key, from, rows, columns);
    if (to === null) {
      return;
    }
    event.preventDefault();
    const target = event.currentTarget
      .querySelector(`[${SPOT_ATTRIBUTE}="${spotKeyOf(to)}"]`)
      ?.querySelector('button');
    target?.focus();
  };
};
