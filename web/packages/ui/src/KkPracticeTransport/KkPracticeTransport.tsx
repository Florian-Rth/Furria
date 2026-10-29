import { KkPracticeTransportPill } from './internal/layout/KkPracticeTransportPill';
import { KkPracticeTransportRoot } from './internal/layout/KkPracticeTransportRoot';
import { KkPracticeTransportDivider } from './internal/ui/KkPracticeTransportDivider';
import { KkPracticeTransportPlay } from './internal/ui/KkPracticeTransportPlay';
import { KkPracticeTransportRate } from './internal/ui/KkPracticeTransportRate';
import { KkPracticeTransportSkip } from './internal/ui/KkPracticeTransportSkip';
import { KkPracticeTransportStatus } from './internal/ui/KkPracticeTransportStatus';

export type { KkPracticeTransportSkipDirection } from './internal/ui/KkPracticeTransportSkip';

export const KkPracticeTransport = Object.assign(KkPracticeTransportRoot, {
  Pill: KkPracticeTransportPill,
  Divider: KkPracticeTransportDivider,
  Play: KkPracticeTransportPlay,
  Skip: KkPracticeTransportSkip,
  Rate: KkPracticeTransportRate,
  Status: KkPracticeTransportStatus,
});
