export interface ReelClock {
  elapsedMs: () => number;
  subscribe: (listener: () => void) => () => void;
}
