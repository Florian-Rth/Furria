import { KkStudioDPlayerBar } from './internal/layout/KkStudioDPlayerBar';
import { KkStudioDPlayerCaption } from './internal/layout/KkStudioDPlayerCaption';
import { KkStudioDPlayerFrame } from './internal/layout/KkStudioDPlayerFrame';
import { KkStudioDPlayerRoot } from './internal/layout/KkStudioDPlayerRoot';
import { KkStudioDPlayerStageArea } from './internal/layout/KkStudioDPlayerStageArea';
import { KkStudioDPlayerTools } from './internal/layout/KkStudioDPlayerTools';
import { KkStudioDPlayerTop } from './internal/layout/KkStudioDPlayerTop';
import { KkStudioDPlayerClose } from './internal/ui/KkStudioDPlayerClose';
import { KkStudioDPlayerCount } from './internal/ui/KkStudioDPlayerCount';
import { KkStudioDPlayerInset } from './internal/ui/KkStudioDPlayerInset';
import { KkStudioDPlayerNote } from './internal/ui/KkStudioDPlayerNote';
import { KkStudioDPlayerPlay } from './internal/ui/KkStudioDPlayerPlay';
import { KkStudioDPlayerProgress } from './internal/ui/KkStudioDPlayerProgress';
import { KkStudioDPlayerProgressFill } from './internal/ui/KkStudioDPlayerProgressFill';
import { KkStudioDPlayerSpeed } from './internal/ui/KkStudioDPlayerSpeed';
import { KkStudioDPlayerStep } from './internal/ui/KkStudioDPlayerStep';
import { KkStudioDPlayerTitle } from './internal/ui/KkStudioDPlayerTitle';
import { KkStudioDPlayerTool } from './internal/ui/KkStudioDPlayerTool';
import { KkStudioDPlayerVideo } from './internal/ui/KkStudioDPlayerVideo';

export type {
  KkStudioDPlayerMark,
  KkStudioDPlayerShare,
} from './internal/ui/KkStudioDPlayerProgress';
export type { KkStudioDPlayerSpeedOption } from './internal/ui/KkStudioDPlayerSpeed';
export type { KkStudioDPlayerVideoSource } from './internal/ui/KkStudioDPlayerVideo';

export const KkStudioDPlayer = Object.assign(KkStudioDPlayerRoot, {
  Frame: KkStudioDPlayerFrame,
  StageArea: KkStudioDPlayerStageArea,
  Top: KkStudioDPlayerTop,
  Caption: KkStudioDPlayerCaption,
  Bar: KkStudioDPlayerBar,
  Tools: KkStudioDPlayerTools,
  Video: KkStudioDPlayerVideo,
  Close: KkStudioDPlayerClose,
  Title: KkStudioDPlayerTitle,
  Inset: KkStudioDPlayerInset,
  Play: KkStudioDPlayerPlay,
  Note: KkStudioDPlayerNote,
  Count: KkStudioDPlayerCount,
  Step: KkStudioDPlayerStep,
  Progress: KkStudioDPlayerProgress,
  ProgressFill: KkStudioDPlayerProgressFill,
  Tool: KkStudioDPlayerTool,
  Speed: KkStudioDPlayerSpeed,
});
