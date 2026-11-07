import { KkPracticeScreenLayer } from './internal/layout/KkPracticeScreenLayer';
import { KkPracticeScreenRoot } from './internal/layout/KkPracticeScreenRoot';
import { KkPracticeScreenHint } from './internal/ui/KkPracticeScreenHint';
import { KkPracticeScreenHud } from './internal/ui/KkPracticeScreenHud';
import { KkPracticeScreenNote } from './internal/ui/KkPracticeScreenNote';

export type { KkPracticeScreenTone } from './internal/layout/KkPracticeScreenLayer';
export type {
  KkPracticeScreenFit,
  KkPracticeScreenSurface,
} from './internal/layout/KkPracticeScreenRoot';
export type { KkPracticeScreenHintLine } from './internal/ui/KkPracticeScreenHint';
export type { KkPracticeScreenHudSignal } from './internal/ui/KkPracticeScreenHud';
export type { KkPracticeGlyph } from './internal/ui/kk-practice-glyphs';

export const KkPracticeScreen = Object.assign(KkPracticeScreenRoot, {
  Layer: KkPracticeScreenLayer,
  Hud: KkPracticeScreenHud,
  Hint: KkPracticeScreenHint,
  Note: KkPracticeScreenNote,
});
