import { KkHallArea } from './internal/layout/KkHallArea';
import { KkHallCorner } from './internal/layout/KkHallCorner';
import { KkHallKeyGroup } from './internal/layout/KkHallKeyGroup';
import { KkHallRoot } from './internal/layout/KkHallRoot';
import { KkHallAbsent } from './internal/ui/KkHallAbsent';
import { KkHallBand } from './internal/ui/KkHallBand';
import { KkHallClose } from './internal/ui/KkHallClose';
import { KkHallCount } from './internal/ui/KkHallCount';
import { KkHallDot } from './internal/ui/KkHallDot';
import { KkHallKey } from './internal/ui/KkHallKey';
import { KkHallPad } from './internal/ui/KkHallPad';
import { KkHallStage } from './internal/ui/KkHallStage';
import { KkHallStep } from './internal/ui/KkHallStep';

export type { KkHallLayout } from './internal/hall-layouts';
export type { KkHallAreaFill, KkHallAreaName } from './internal/layout/KkHallArea';
export type { KkHallKeyGroupFlow } from './internal/layout/KkHallKeyGroup';
export type { KkHallGlyph } from './internal/ui/hall-glyphs';
export type { KkHallAbsentPerson } from './internal/ui/KkHallAbsent';
export type { KkHallDotKind, KkHallDotNameSide } from './internal/ui/KkHallDot';
export type { KkHallStageFront } from './internal/ui/KkHallStage';
export type { KkHallStepSize } from './internal/ui/KkHallStep';

export const KkHall = Object.assign(KkHallRoot, {
  Area: KkHallArea,
  Corner: KkHallCorner,
  KeyGroup: KkHallKeyGroup,
  Stage: KkHallStage,
  Absent: KkHallAbsent,
  Band: KkHallBand,
  Close: KkHallClose,
  Count: KkHallCount,
  Dot: KkHallDot,
  Key: KkHallKey,
  Pad: KkHallPad,
  Step: KkHallStep,
});
