import { KkPourHeadCounters } from './internal/layout/KkPourHeadCounters';
import { KkPourHeadRoot } from './internal/layout/KkPourHeadRoot';
import { KkPourHeadCounter } from './internal/ui/KkPourHeadCounter';
import { KkPourHeadStock } from './internal/ui/KkPourHeadStock';

export const KkPourHead = Object.assign(KkPourHeadRoot, {
  Stock: KkPourHeadStock,
  Counters: KkPourHeadCounters,
  Counter: KkPourHeadCounter,
});
