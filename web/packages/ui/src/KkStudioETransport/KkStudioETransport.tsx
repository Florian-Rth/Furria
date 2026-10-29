import { KkStudioETransportPill } from './internal/layout/KkStudioETransportPill';
import { KkStudioETransportRoot } from './internal/layout/KkStudioETransportRoot';
import { KkStudioETransportDivider } from './internal/ui/KkStudioETransportDivider';
import { KkStudioETransportPlay } from './internal/ui/KkStudioETransportPlay';
import { KkStudioETransportRate } from './internal/ui/KkStudioETransportRate';
import { KkStudioETransportSkip } from './internal/ui/KkStudioETransportSkip';
import { KkStudioETransportStatus } from './internal/ui/KkStudioETransportStatus';

export type { KkStudioETransportSkipDirection } from './internal/ui/KkStudioETransportSkip';

export const KkStudioETransport = Object.assign(KkStudioETransportRoot, {
  Pill: KkStudioETransportPill,
  Divider: KkStudioETransportDivider,
  Play: KkStudioETransportPlay,
  Skip: KkStudioETransportSkip,
  Rate: KkStudioETransportRate,
  Status: KkStudioETransportStatus,
});
