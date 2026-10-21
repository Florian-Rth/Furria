import { KkTallyStripBar } from './internal/layout/KkTallyStripBar';
import { KkTallyStripCounters } from './internal/layout/KkTallyStripCounters';
import { KkTallyStripRoot } from './internal/layout/KkTallyStripRoot';
import { KkTallyStripCounter } from './internal/ui/KkTallyStripCounter';
import { KkTallyStripNext } from './internal/ui/KkTallyStripNext';
import { KkTallyStripSummary } from './internal/ui/KkTallyStripSummary';

export const KkTallyStrip = Object.assign(KkTallyStripRoot, {
  Bar: KkTallyStripBar,
  Summary: KkTallyStripSummary,
  Counters: KkTallyStripCounters,
  Counter: KkTallyStripCounter,
  Next: KkTallyStripNext,
});
