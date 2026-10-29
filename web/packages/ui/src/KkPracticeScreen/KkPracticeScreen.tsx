import { KkPracticeScreenCorner } from './internal/layout/KkPracticeScreenCorner';
import { KkPracticeScreenLayer } from './internal/layout/KkPracticeScreenLayer';
import { KkPracticeScreenRoot } from './internal/layout/KkPracticeScreenRoot';
import { KkPracticeScreenHint } from './internal/ui/KkPracticeScreenHint';
import { KkPracticeScreenHud } from './internal/ui/KkPracticeScreenHud';
import { KkPracticeScreenMirror } from './internal/ui/KkPracticeScreenMirror';
import { KkPracticeScreenNote } from './internal/ui/KkPracticeScreenNote';
import { KkPracticeScreenTake } from './internal/ui/KkPracticeScreenTake';
import { KkPracticeScreenVideo } from './internal/ui/KkPracticeScreenVideo';

export type { KkPracticeScreenTone } from './internal/layout/KkPracticeScreenLayer';
export type {
  KkPracticeScreenFit,
  KkPracticeScreenSurface,
} from './internal/layout/KkPracticeScreenRoot';
export type { KkPracticeScreenHintLine } from './internal/ui/KkPracticeScreenHint';
export type { KkPracticeScreenHudSignal } from './internal/ui/KkPracticeScreenHud';
export type { KkPracticeScreenVideoSource } from './internal/ui/KkPracticeScreenVideo';
export type { KkPracticeGlyph } from './internal/ui/kk-practice-glyphs';

export const KkPracticeScreen = Object.assign(KkPracticeScreenRoot, {
  Layer: KkPracticeScreenLayer,
  Corner: KkPracticeScreenCorner,
  Video: KkPracticeScreenVideo,
  Mirror: KkPracticeScreenMirror,
  Take: KkPracticeScreenTake,
  Hud: KkPracticeScreenHud,
  Hint: KkPracticeScreenHint,
  Note: KkPracticeScreenNote,
});
