import { KkScoreTransportRoot } from './internal/layout/KkScoreTransportRoot';
import { KkScoreTransportClock } from './internal/ui/KkScoreTransportClock';
import { KkScoreTransportLenses } from './internal/ui/KkScoreTransportLenses';
import { KkScoreTransportNow } from './internal/ui/KkScoreTransportNow';
import { KkScoreTransportPlay } from './internal/ui/KkScoreTransportPlay';

export type { KkScoreLens } from './internal/ui/KkScoreTransportLenses';

export const KkScoreTransport = Object.assign(KkScoreTransportRoot, {
  Play: KkScoreTransportPlay,
  Clock: KkScoreTransportClock,
  Now: KkScoreTransportNow,
  Lenses: KkScoreTransportLenses,
});
