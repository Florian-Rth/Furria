import { KkStudioATransportRoot } from './internal/layout/KkStudioATransportRoot';
import { KkStudioATransportRow } from './internal/layout/KkStudioATransportRow';
import { KkStudioATransportLoop } from './internal/ui/KkStudioATransportLoop';
import { KkStudioATransportPlay } from './internal/ui/KkStudioATransportPlay';
import { KkStudioATransportRates } from './internal/ui/KkStudioATransportRates';
import { KkStudioATransportToggle } from './internal/ui/KkStudioATransportToggle';

export type { KkStudioATransportRate } from './internal/ui/KkStudioATransportRates';

export const KkStudioATransport = Object.assign(KkStudioATransportRoot, {
  Row: KkStudioATransportRow,
  Play: KkStudioATransportPlay,
  Loop: KkStudioATransportLoop,
  Rates: KkStudioATransportRates,
  Toggle: KkStudioATransportToggle,
});
