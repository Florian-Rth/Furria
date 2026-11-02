import { KkScoreManualGroup } from './internal/layout/KkScoreManualGroup';
import { KkScoreManualRoot } from './internal/layout/KkScoreManualRoot';
import { KkScoreManualHead } from './internal/ui/KkScoreManualHead';
import { KkScoreManualLegend } from './internal/ui/KkScoreManualLegend';
import { KkScoreManualRow } from './internal/ui/KkScoreManualRow';

export const KkScoreManual = Object.assign(KkScoreManualRoot, {
  Group: KkScoreManualGroup,
  Head: KkScoreManualHead,
  Legend: KkScoreManualLegend,
  Row: KkScoreManualRow,
});
