import { KkTwinCell } from './internal/layout/KkTwinCell';
import { KkTwinDock } from './internal/layout/KkTwinDock';
import { KkTwinHead } from './internal/layout/KkTwinHead';
import { KkTwinKeys } from './internal/layout/KkTwinKeys';
import { KkTwinPair } from './internal/layout/KkTwinPair';
import { KkTwinPane } from './internal/layout/KkTwinPane';
import { KkTwinRest } from './internal/layout/KkTwinRest';
import { KkTwinRoot } from './internal/layout/KkTwinRoot';
import { KkTwinSpine } from './internal/layout/KkTwinSpine';
import { KkTwinClose } from './internal/ui/KkTwinClose';
import { KkTwinCue } from './internal/ui/KkTwinCue';
import { KkTwinEmpty } from './internal/ui/KkTwinEmpty';
import { KkTwinEyebrow } from './internal/ui/KkTwinEyebrow';
import { KkTwinLoop } from './internal/ui/KkTwinLoop';
import { KkTwinNote } from './internal/ui/KkTwinNote';
import { KkTwinReading } from './internal/ui/KkTwinReading';
import { KkTwinStep } from './internal/ui/KkTwinStep';
import { KkTwinSwitch } from './internal/ui/KkTwinSwitch';
import { KkTwinTitle } from './internal/ui/KkTwinTitle';

export type { KkTwinCellArea } from './internal/layout/KkTwinCell';
export type { KkTwinPaneKind } from './internal/layout/KkTwinPane';
export type { KkTwinCueTone } from './internal/ui/KkTwinCue';
export type { KkTwinLoopKind } from './internal/ui/KkTwinLoop';

export const KkTwin = Object.assign(KkTwinRoot, {
  Head: KkTwinHead,
  Pair: KkTwinPair,
  Pane: KkTwinPane,
  Spine: KkTwinSpine,
  Cell: KkTwinCell,
  Dock: KkTwinDock,
  Keys: KkTwinKeys,
  Rest: KkTwinRest,
  Close: KkTwinClose,
  Title: KkTwinTitle,
  Switch: KkTwinSwitch,
  Eyebrow: KkTwinEyebrow,
  Step: KkTwinStep,
  Cue: KkTwinCue,
  Note: KkTwinNote,
  Reading: KkTwinReading,
  Loop: KkTwinLoop,
  Empty: KkTwinEmpty,
});
