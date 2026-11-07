import { KkVideoBar } from './internal/layout/KkVideoBar';
import { KkVideoCorner } from './internal/layout/KkVideoCorner';
import { KkVideoRoot } from './internal/layout/KkVideoRoot';
import { KkVideoCaption } from './internal/ui/KkVideoCaption';
import { KkVideoClip } from './internal/ui/KkVideoClip';
import { KkVideoFullscreen } from './internal/ui/KkVideoFullscreen';
import { KkVideoMirror } from './internal/ui/KkVideoMirror';
import { KkVideoNote } from './internal/ui/KkVideoNote';
import { KkVideoPicture } from './internal/ui/KkVideoPicture';
import { KkVideoPlay } from './internal/ui/KkVideoPlay';
import { KkVideoTake } from './internal/ui/KkVideoTake';

export type { KkVideoCornerSide } from './internal/layout/KkVideoCorner';
export type { KkVideoFit } from './internal/layout/KkVideoRoot';
export type { KkVideoFocus, KkVideoSource } from './internal/ui/KkVideoPicture';

export const KkVideo = Object.assign(KkVideoRoot, {
  Picture: KkVideoPicture,
  Clip: KkVideoClip,
  Corner: KkVideoCorner,
  Bar: KkVideoBar,
  Caption: KkVideoCaption,
  Note: KkVideoNote,
  Play: KkVideoPlay,
  Fullscreen: KkVideoFullscreen,
  Mirror: KkVideoMirror,
  Take: KkVideoTake,
});
