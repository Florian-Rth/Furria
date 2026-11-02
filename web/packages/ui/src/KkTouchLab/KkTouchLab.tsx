import { KkTouchLabHalf } from './internal/layout/KkTouchLabHalf';
import { KkTouchLabRailTrack } from './internal/layout/KkTouchLabRailTrack';
import { KkTouchLabRoot } from './internal/layout/KkTouchLabRoot';
import { KkTouchLabStrip } from './internal/layout/KkTouchLabStrip';
import { KkTouchLabBands } from './internal/ui/KkTouchLabBands';
import { KkTouchLabBend } from './internal/ui/KkTouchLabBend';
import { KkTouchLabCentre } from './internal/ui/KkTouchLabCentre';
import { KkTouchLabClock } from './internal/ui/KkTouchLabClock';
import { KkTouchLabDot } from './internal/ui/KkTouchLabDot';
import { KkTouchLabFloat } from './internal/ui/KkTouchLabFloat';
import { KkTouchLabFloor } from './internal/ui/KkTouchLabFloor';
import { KkTouchLabHandle } from './internal/ui/KkTouchLabHandle';
import { KkTouchLabHint } from './internal/ui/KkTouchLabHint';
import { KkTouchLabKeys } from './internal/ui/KkTouchLabKeys';
import { KkTouchLabLoupe } from './internal/ui/KkTouchLabLoupe';
import { KkTouchLabPaths } from './internal/ui/KkTouchLabPaths';
import { KkTouchLabPerson } from './internal/ui/KkTouchLabPerson';
import { KkTouchLabPlayhead } from './internal/ui/KkTouchLabPlayhead';
import { KkTouchLabRailStep } from './internal/ui/KkTouchLabRailStep';
import { KkTouchLabReadout } from './internal/ui/KkTouchLabReadout';
import { KkTouchLabRow } from './internal/ui/KkTouchLabRow';
import { KkTouchLabSlot } from './internal/ui/KkTouchLabSlot';
import { KkTouchLabTicks } from './internal/ui/KkTouchLabTicks';
import { KkTouchLabWave } from './internal/ui/KkTouchLabWave';

export type { KkTouchLabHalfSide } from './internal/layout/KkTouchLabHalf';
export type { KkTouchLabHandlers, KkTouchLabSize } from './internal/layout/KkTouchLabRoot';
export type { KkTouchLabBand } from './internal/ui/KkTouchLabBands';
export type { KkTouchLabDotState } from './internal/ui/KkTouchLabDot';
export type {
  KkTouchLabFloorBox,
  KkTouchLabGridKind,
  KkTouchLabGridLine,
} from './internal/ui/KkTouchLabFloor';
export type { KkTouchLabHandleKind } from './internal/ui/KkTouchLabHandle';
export type { KkTouchLabKey, KkTouchLabKeyState } from './internal/ui/KkTouchLabKeys';
export type { KkTouchLabPath } from './internal/ui/KkTouchLabPaths';
export type { KkTouchLabRailStepState } from './internal/ui/KkTouchLabRailStep';
export type { KkTouchLabTick, KkTouchLabTickKind } from './internal/ui/KkTouchLabTicks';
export type { KkTouchLabWaveBar } from './internal/ui/KkTouchLabWave';

export const KkTouchLab = Object.assign(KkTouchLabRoot, {
  Wave: KkTouchLabWave,
  Ticks: KkTouchLabTicks,
  Bands: KkTouchLabBands,
  Handle: KkTouchLabHandle,
  Playhead: KkTouchLabPlayhead,
  Readout: KkTouchLabReadout,
  Loupe: KkTouchLabLoupe,
  Floor: KkTouchLabFloor,
  Dot: KkTouchLabDot,
  Paths: KkTouchLabPaths,
  Bend: KkTouchLabBend,
  Keys: KkTouchLabKeys,
  Float: KkTouchLabFloat,
  Hint: KkTouchLabHint,
  RailTrack: KkTouchLabRailTrack,
  RailStep: KkTouchLabRailStep,
  Centre: KkTouchLabCentre,
  Strip: KkTouchLabStrip,
  Half: KkTouchLabHalf,
  Clock: KkTouchLabClock,
  Row: KkTouchLabRow,
  Slot: KkTouchLabSlot,
  Person: KkTouchLabPerson,
});
