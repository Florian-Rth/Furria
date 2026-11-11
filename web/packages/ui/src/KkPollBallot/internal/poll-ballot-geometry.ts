export const BALLOT_MARKER_SIZE = 2.25;
export const BALLOT_MARKER_GAP = 1;
export const BALLOT_INDENT = BALLOT_MARKER_SIZE + BALLOT_MARKER_GAP;

const FULL_PERCENT = 100;

export const toBallotBarWidth = (percent: number): string =>
  `${Math.min(Math.max(percent, 0), FULL_PERCENT)}%`;
