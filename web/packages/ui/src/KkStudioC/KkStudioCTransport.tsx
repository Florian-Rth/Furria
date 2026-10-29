import { KkStudioCTransportGap } from './internal/layout/KkStudioCTransportGap';
import { KkStudioCTransportRoot } from './internal/layout/KkStudioCTransportRoot';
import { KkStudioCTransportClock } from './internal/ui/KkStudioCTransportClock';
import { KkStudioCTransportPlay } from './internal/ui/KkStudioCTransportPlay';
import { KkStudioCTransportRate } from './internal/ui/KkStudioCTransportRate';
import { KkStudioCTransportToggle } from './internal/ui/KkStudioCTransportToggle';

export const KkStudioCTransport = Object.assign(KkStudioCTransportRoot, {
  Gap: KkStudioCTransportGap,
  Play: KkStudioCTransportPlay,
  Clock: KkStudioCTransportClock,
  Toggle: KkStudioCTransportToggle,
  Rate: KkStudioCTransportRate,
});
