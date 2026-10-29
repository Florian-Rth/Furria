import { KkStudioETransportRoot } from './internal/layout/KkStudioETransportRoot';
import { KkStudioETransportRow } from './internal/layout/KkStudioETransportRow';
import { KkStudioETransportPill } from './internal/ui/KkStudioETransportPill';
import { KkStudioETransportPlay } from './internal/ui/KkStudioETransportPlay';
import { KkStudioETransportProgress } from './internal/ui/KkStudioETransportProgress';
import { KkStudioETransportSkip } from './internal/ui/KkStudioETransportSkip';

export type { KkStudioETransportPillGlyph } from './internal/ui/KkStudioETransportPill';
export type { KkStudioETransportShare } from './internal/ui/KkStudioETransportProgress';
export type { KkStudioETransportSkipDirection } from './internal/ui/KkStudioETransportSkip';

export const KkStudioETransport = Object.assign(KkStudioETransportRoot, {
  Row: KkStudioETransportRow,
  Play: KkStudioETransportPlay,
  Skip: KkStudioETransportSkip,
  Pill: KkStudioETransportPill,
  Progress: KkStudioETransportProgress,
});
