import { KkStudioBTransportBar } from './internal/layout/KkStudioBTransportBar';
import { KkStudioBTransportRoot } from './internal/layout/KkStudioBTransportRoot';
import { KkStudioBTransportClock } from './internal/ui/KkStudioBTransportClock';
import { KkStudioBTransportNote } from './internal/ui/KkStudioBTransportNote';
import { KkStudioBTransportPlay } from './internal/ui/KkStudioBTransportPlay';
import { KkStudioBTransportSpeed } from './internal/ui/KkStudioBTransportSpeed';
import { KkStudioBTransportStrip } from './internal/ui/KkStudioBTransportStrip';
import { KkStudioBTransportToggle } from './internal/ui/KkStudioBTransportToggle';

export type { KkStudioBTransportNoteAction } from './internal/ui/KkStudioBTransportNote';
export type {
  KkStudioBStripBand,
  KkStudioBStripRange,
} from './internal/ui/KkStudioBTransportStrip';
export type {
  KkStudioBTransportToggleKind,
  KkStudioBTransportToggleLabel,
} from './internal/ui/KkStudioBTransportToggle';

export const KkStudioBTransport = Object.assign(KkStudioBTransportRoot, {
  Bar: KkStudioBTransportBar,
  Play: KkStudioBTransportPlay,
  Toggle: KkStudioBTransportToggle,
  Speed: KkStudioBTransportSpeed,
  Clock: KkStudioBTransportClock,
  Strip: KkStudioBTransportStrip,
  Note: KkStudioBTransportNote,
});
