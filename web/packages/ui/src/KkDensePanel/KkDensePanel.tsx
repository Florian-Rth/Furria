import { KkDensePanelCells } from './internal/layout/KkDensePanelCells';
import { KkDensePanelLines } from './internal/layout/KkDensePanelLines';
import { KkDensePanelRoot } from './internal/layout/KkDensePanelRoot';
import { KkDensePanelAnswerMark } from './internal/ui/KkDensePanelAnswerMark';
import { KkDensePanelAnswerRing } from './internal/ui/KkDensePanelAnswerRing';
import { KkDensePanelCell } from './internal/ui/KkDensePanelCell';
import { KkDensePanelFoot } from './internal/ui/KkDensePanelFoot';
import { KkDensePanelHead } from './internal/ui/KkDensePanelHead';
import { KkDensePanelIcon } from './internal/ui/KkDensePanelIcon';
import { KkDensePanelLine } from './internal/ui/KkDensePanelLine';
import { KkDensePanelNumber } from './internal/ui/KkDensePanelNumber';
import { KkDensePanelStamp } from './internal/ui/KkDensePanelStamp';

export const KkDensePanel = Object.assign(KkDensePanelRoot, {
  Head: KkDensePanelHead,
  Lines: KkDensePanelLines,
  Line: KkDensePanelLine,
  Stamp: KkDensePanelStamp,
  Number: KkDensePanelNumber,
  Icon: KkDensePanelIcon,
  Cells: KkDensePanelCells,
  Cell: KkDensePanelCell,
  Foot: KkDensePanelFoot,
  AnswerRing: KkDensePanelAnswerRing,
  AnswerMark: KkDensePanelAnswerMark,
});
