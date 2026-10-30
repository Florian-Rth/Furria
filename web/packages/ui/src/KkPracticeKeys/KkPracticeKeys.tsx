import { KkPracticeKeysGrid } from './internal/layout/KkPracticeKeysGrid';
import { KkPracticeKeysRoot } from './internal/layout/KkPracticeKeysRoot';
import { KkPracticeKey } from './internal/ui/KkPracticeKey';
import { KkPracticeKeysPlay } from './internal/ui/KkPracticeKeysPlay';

export type { KkPracticeKeyGlyph } from './internal/ui/practice-key-glyphs';

export const KkPracticeKeys = Object.assign(KkPracticeKeysRoot, {
  Play: KkPracticeKeysPlay,
  Grid: KkPracticeKeysGrid,
  Key: KkPracticeKey,
});
