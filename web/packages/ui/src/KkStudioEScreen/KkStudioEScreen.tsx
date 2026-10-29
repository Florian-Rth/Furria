import { KkStudioEScreenCorner } from './internal/layout/KkStudioEScreenCorner';
import { KkStudioEScreenLayer } from './internal/layout/KkStudioEScreenLayer';
import { KkStudioEScreenRoot } from './internal/layout/KkStudioEScreenRoot';
import { KkStudioEScreenHint } from './internal/ui/KkStudioEScreenHint';
import { KkStudioEScreenHud } from './internal/ui/KkStudioEScreenHud';
import { KkStudioEScreenMirror } from './internal/ui/KkStudioEScreenMirror';
import { KkStudioEScreenNote } from './internal/ui/KkStudioEScreenNote';
import { KkStudioEScreenVideo } from './internal/ui/KkStudioEScreenVideo';

export type { KkStudioEScreenTone } from './internal/layout/KkStudioEScreenLayer';
export type {
  KkStudioEScreenFit,
  KkStudioEScreenSurface,
} from './internal/layout/KkStudioEScreenRoot';
export type { KkStudioEScreenHintLine } from './internal/ui/KkStudioEScreenHint';
export type { KkStudioEScreenHudSignal } from './internal/ui/KkStudioEScreenHud';
export type { KkStudioEScreenVideoSource } from './internal/ui/KkStudioEScreenVideo';
export type { KkStudioEGlyph } from './internal/ui/kk-studio-e-glyphs';

export const KkStudioEScreen = Object.assign(KkStudioEScreenRoot, {
  Layer: KkStudioEScreenLayer,
  Corner: KkStudioEScreenCorner,
  Video: KkStudioEScreenVideo,
  Mirror: KkStudioEScreenMirror,
  Hud: KkStudioEScreenHud,
  Hint: KkStudioEScreenHint,
  Note: KkStudioEScreenNote,
});
