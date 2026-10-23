import { toLocalIsoDay } from '@/lib/calendar-days';
import { formatIsoDay } from '@/lib/membership-labels';
import type { RunningOrderChecks } from './running-order-step';

export const PLACED_LABEL = 'Eingeplant';
export const CONFLICTS_LABEL = 'Konflikte';
export const STANDING_LABEL = 'Ablauf steht';
export const NO_ORDER_LABEL = 'Ablauf';
export const NO_ORDER_VALUE = 'noch kein Ablauf';
export const RUNNING_ORDER_LOADING_LABEL = 'Der Ablauf wird geladen';
export const RUNNING_ORDER_RETRY_LABEL = 'Erneut laden';
export const NO_PLANNER_NOTE = 'Den Ablauf plant, wer das Recht dafür hat.';
export const ACTION_PLAN_LABEL = 'Ablauf planen';
export const ACTION_OPEN_LABEL = 'Ablauf öffnen';

const plural = (count: number, one: string, many: string): string =>
  `${count} ${count === 1 ? one : many}`;

export const toPlacedValue = ({ acts, placed }: RunningOrderChecks): string => {
  if (acts === 0) {
    return 'noch keine Auftritte';
  }

  return placed === acts
    ? `alle ${plural(acts, 'Auftritt', 'Auftritte')}`
    : `${placed} von ${acts}`;
};

export const toConflictsValue = ({ conflicts, hints }: RunningOrderChecks): string => {
  const head = conflicts === 0 ? 'keine' : plural(conflicts, 'Konflikt', 'Konflikte');

  return hints === 0 ? head : `${head} · ${plural(hints, 'Hinweis', 'Hinweise')}`;
};

export const toStandingValue = ({ standing, confirmedAt }: RunningOrderChecks): string => {
  switch (standing) {
    case 'stands':
      return confirmedAt === null ? 'ja' : `seit ${formatIsoDay(toLocalIsoDay(confirmedAt))}`;
    case 'changed':
      return 'seit „steht“ geändert';
    case 'open':
      return 'noch nicht';
  }
};
