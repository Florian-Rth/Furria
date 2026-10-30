import { KkLessonArea } from './internal/layout/KkLessonArea';
import { KkLessonCard } from './internal/layout/KkLessonCard';
import { KkLessonCorner } from './internal/layout/KkLessonCorner';
import { KkLessonDock } from './internal/layout/KkLessonDock';
import { KkLessonLayer } from './internal/layout/KkLessonLayer';
import { KkLessonPart } from './internal/layout/KkLessonPart';
import { KkLessonPicture } from './internal/layout/KkLessonPicture';
import { KkLessonRail } from './internal/layout/KkLessonRail';
import { KkLessonRailGroup } from './internal/layout/KkLessonRailGroup';
import { KkLessonRoot } from './internal/layout/KkLessonRoot';
import { KkLessonBeat } from './internal/ui/KkLessonBeat';
import { KkLessonCounts } from './internal/ui/KkLessonCounts';
import { KkLessonCue } from './internal/ui/KkLessonCue';
import { KkLessonHall } from './internal/ui/KkLessonHall';
import { KkLessonLoop } from './internal/ui/KkLessonLoop';
import { KkLessonNext } from './internal/ui/KkLessonNext';
import { KkLessonQuiet } from './internal/ui/KkLessonQuiet';
import { KkLessonRailFill } from './internal/ui/KkLessonRailFill';
import { KkLessonRailPart } from './internal/ui/KkLessonRailPart';
import { KkLessonRailStep } from './internal/ui/KkLessonRailStep';
import { KkLessonRead } from './internal/ui/KkLessonRead';
import { KkLessonSwap } from './internal/ui/KkLessonSwap';
import { KkLessonTag } from './internal/ui/KkLessonTag';
import { KkLessonText } from './internal/ui/KkLessonText';
import { KkLessonTitle } from './internal/ui/KkLessonTitle';
import { KkLessonVideo } from './internal/ui/KkLessonVideo';

export type { KkLessonAreaName } from './internal/layout/KkLessonArea';
export type { KkLessonCornerSide } from './internal/layout/KkLessonCorner';
export type { KkLessonLayerPlace, KkLessonLayerTone } from './internal/layout/KkLessonLayer';
export type { KkLessonPartName } from './internal/layout/KkLessonPart';
export type { KkLessonCueTone } from './internal/ui/KkLessonCue';

export const KkLesson = Object.assign(KkLessonRoot, {
  Area: KkLessonArea,
  Card: KkLessonCard,
  Picture: KkLessonPicture,
  Layer: KkLessonLayer,
  Corner: KkLessonCorner,
  Video: KkLessonVideo,
  Swap: KkLessonSwap,
  Tag: KkLessonTag,
  Quiet: KkLessonQuiet,
  Part: KkLessonPart,
  Title: KkLessonTitle,
  Cue: KkLessonCue,
  Beat: KkLessonBeat,
  Counts: KkLessonCounts,
  Loop: KkLessonLoop,
  Text: KkLessonText,
  Next: KkLessonNext,
  Read: KkLessonRead,
  Rail: KkLessonRail,
  RailGroup: KkLessonRailGroup,
  RailPart: KkLessonRailPart,
  RailStep: KkLessonRailStep,
  RailFill: KkLessonRailFill,
  Dock: KkLessonDock,
  Hall: KkLessonHall,
});
