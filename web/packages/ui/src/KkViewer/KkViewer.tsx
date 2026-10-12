import { KkViewerBar } from './internal/layout/KkViewerBar';
import { KkViewerFoot } from './internal/layout/KkViewerFoot';
import { KkViewerRoot } from './internal/layout/KkViewerRoot';
import { KkViewerCaption } from './internal/ui/KkViewerCaption';
import { KkViewerClose } from './internal/ui/KkViewerClose';
import { KkViewerCounter } from './internal/ui/KkViewerCounter';
import { KkViewerFilmstrip } from './internal/ui/KkViewerFilmstrip';
import { KkViewerStage } from './internal/ui/KkViewerStage';
import { KkViewerStepButton } from './internal/ui/KkViewerStepButton';

export const KkViewer = Object.assign(KkViewerRoot, {
  Bar: KkViewerBar,
  Foot: KkViewerFoot,
  Stage: KkViewerStage,
  Caption: KkViewerCaption,
  Counter: KkViewerCounter,
  StepButton: KkViewerStepButton,
  Filmstrip: KkViewerFilmstrip,
  Close: KkViewerClose,
});
