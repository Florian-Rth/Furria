import { CtaBandColumn } from './internal/layout/CtaBandColumn';
import { CtaBandRoot } from './internal/layout/CtaBandRoot';
import { CtaBandRow } from './internal/layout/CtaBandRow';

export const CtaBand = Object.assign(CtaBandRoot, {
  Row: CtaBandRow,
  Column: CtaBandColumn,
});
