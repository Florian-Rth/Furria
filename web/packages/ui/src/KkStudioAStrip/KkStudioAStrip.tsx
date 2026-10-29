import { KkStudioAStripPlayed } from './internal/layout/KkStudioAStripPlayed';
import { KkStudioAStripRoot } from './internal/layout/KkStudioAStripRoot';
import { KkStudioAStripBand } from './internal/ui/KkStudioAStripBand';
import { KkStudioAStripHead } from './internal/ui/KkStudioAStripHead';
import { KkStudioAStripLoop } from './internal/ui/KkStudioAStripLoop';
import { KkStudioAStripMarks } from './internal/ui/KkStudioAStripMarks';
import { KkStudioAStripWave } from './internal/ui/KkStudioAStripWave';

export type {
  KkStudioAStripBandItem,
  KkStudioAStripBandState,
} from './internal/ui/KkStudioAStripBand';
export type { KkStudioAStripMark, KkStudioAStripMarkKind } from './internal/ui/KkStudioAStripMarks';

export const KkStudioAStrip = Object.assign(KkStudioAStripRoot, {
  Band: KkStudioAStripBand,
  Wave: KkStudioAStripWave,
  Played: KkStudioAStripPlayed,
  Marks: KkStudioAStripMarks,
  Loop: KkStudioAStripLoop,
  Head: KkStudioAStripHead,
});
