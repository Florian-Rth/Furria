import { KkFlapBoardRoot } from './internal/layout/KkFlapBoardRoot';
import { KkFlapBoardRows } from './internal/layout/KkFlapBoardRows';
import { KkFlapBoardMasthead } from './internal/ui/KkFlapBoardMasthead';
import { KkFlapBoardNotice } from './internal/ui/KkFlapBoardNotice';
import { KkFlapBoardReasons } from './internal/ui/KkFlapBoardReasons';
import { KkFlapBoardRow } from './internal/ui/KkFlapBoardRow';
import { KkFlapBoardVerdict } from './internal/ui/KkFlapBoardVerdict';

export const KkFlapBoard = Object.assign(KkFlapBoardRoot, {
  Masthead: KkFlapBoardMasthead,
  Notice: KkFlapBoardNotice,
  Rows: KkFlapBoardRows,
  Row: KkFlapBoardRow,
  Verdict: KkFlapBoardVerdict,
  Reasons: KkFlapBoardReasons,
});
