import type { KkHonours } from './honour-types';

const SEPARATOR = ' · ';

export const honourNameOf = (honours: KkHonours, withFunctions: boolean): string => {
  const sessions = honours.sessionsLabel === undefined ? [] : [honours.sessionsLabel];
  const functions = withFunctions ? honours.functions.map((entry) => entry.label) : [];

  return [...sessions, ...functions].join(SEPARATOR);
};
