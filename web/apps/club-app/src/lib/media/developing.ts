export const DEVELOPING_POLL_MS = 3_000;
export const STALLED_POLL_MS = 30_000;

export const developingPollMsOf = (isStalled: boolean): number =>
  isStalled ? STALLED_POLL_MS : DEVELOPING_POLL_MS;
