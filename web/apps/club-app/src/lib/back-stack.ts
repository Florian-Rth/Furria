import type { HistoryLocation, RouterHistory } from '@tanstack/react-router';

export interface BackStackSpot {
  pathname: string;
  search: string;
}

interface StepBack {
  from: HistoryLocation;
  landed: Promise<void>;
}

const SHEET_PARAM = 'sheet';
const QUERY_AND_HASH = /[?#].*$/s;
const ONE_ENTRY = 1;

const pathnamesByIndex = new Map<number, string>();
let pendingStep: StepBack | null = null;

export const toPathname = (href: string): string => href.replace(QUERY_AND_HASH, '');

export const leavesSheetOverScreen = (
  current: BackStackSpot,
  behind: string | undefined,
  nextHref: string,
): boolean =>
  behind === current.pathname &&
  new URLSearchParams(current.search).has(SHEET_PARAM) &&
  toPathname(nextHref) !== current.pathname;

const remember = (location: HistoryLocation): void => {
  pathnamesByIndex.set(location.state.__TSR_index, location.pathname);
};

export const pathnameBehind = (location: HistoryLocation): string | undefined =>
  pathnamesByIndex.get(location.state.__TSR_index - ONE_ENTRY);

export const withBackStack = (history: RouterHistory): RouterHistory => {
  const { push, replace } = history;

  remember(history.location);
  history.subscribe(({ location }) => {
    remember(location);
  });

  const pushPastSheet: RouterHistory['push'] = (path, state, options) => {
    const current = history.location;

    if (leavesSheetOverScreen(current, pathnameBehind(current), path)) {
      replace(path, state, options);
      return;
    }

    push(path, state, options);
  };

  return Object.assign(history, { push: pushPastSheet });
};

export const stepBack = (history: RouterHistory, ignoreBlocker: boolean): Promise<void> => {
  const from = history.location;

  if (pendingStep?.from === from) {
    return pendingStep.landed;
  }

  const landed = new Promise<void>((resolve) => {
    const stop = history.subscribe(({ action }) => {
      if (action.type === 'PUSH' || action.type === 'REPLACE') {
        return;
      }

      stop();
      pendingStep = null;
      resolve();
    });
  });

  pendingStep = { from, landed };
  history.back({ ignoreBlocker });

  return landed;
};

export const stepOffLayer = (history: RouterHistory): boolean => {
  const { location } = history;

  if (pathnameBehind(location) !== location.pathname) {
    return false;
  }

  void stepBack(history, false);
  return true;
};
