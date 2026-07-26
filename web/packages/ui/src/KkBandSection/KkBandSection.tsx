import { KkBandColumn } from './internal/layout/KkBandColumn';
import { KkBandRow } from './internal/layout/KkBandRow';
import { KkBandSectionRoot } from './internal/layout/KkBandSectionRoot';

export const KkBandSection = Object.assign(KkBandSectionRoot, {
  Row: KkBandRow,
  Column: KkBandColumn,
});
