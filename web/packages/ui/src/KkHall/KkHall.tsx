import { KkKeyHelp } from '../KkKeyHelp/KkKeyHelp';
import { KkHallArea } from './internal/layout/KkHallArea';
import { KkHallCorner } from './internal/layout/KkHallCorner';
import { KkHallKeyGroup } from './internal/layout/KkHallKeyGroup';
import { KkHallRoot } from './internal/layout/KkHallRoot';
import { KkHallAbsent } from './internal/ui/KkHallAbsent';
import { KkHallClose } from './internal/ui/KkHallClose';
import { KkHallCount } from './internal/ui/KkHallCount';
import { KkHallKey } from './internal/ui/KkHallKey';
import { KkHallStep } from './internal/ui/KkHallStep';

export type { KkHallAreaFill, KkHallAreaName } from './internal/layout/KkHallArea';
export type { KkHallGlyph } from './internal/ui/hall-glyphs';
export type { KkHallAbsentPerson } from './internal/ui/KkHallAbsent';

export const KkHall = Object.assign(KkHallRoot, {
  Area: KkHallArea,
  Corner: KkHallCorner,
  KeyGroup: KkHallKeyGroup,
  Absent: KkHallAbsent,
  Close: KkHallClose,
  Count: KkHallCount,
  Help: KkKeyHelp,
  Key: KkHallKey,
  Step: KkHallStep,
});
