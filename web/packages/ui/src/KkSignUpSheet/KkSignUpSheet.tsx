import { KkSignUpSheetLines } from './internal/layout/KkSignUpSheetLines';
import { KkSignUpSheetRoot } from './internal/layout/KkSignUpSheetRoot';
import { KkSignUpSheetEntry } from './internal/ui/KkSignUpSheetEntry';
import { KkSignUpSheetHead } from './internal/ui/KkSignUpSheetHead';
import { KkSignUpSheetLine } from './internal/ui/KkSignUpSheetLine';

export type { KkSignUpSheetHeading } from './internal/ui/KkSignUpSheetHead';

export const KkSignUpSheet = Object.assign(KkSignUpSheetRoot, {
  Head: KkSignUpSheetHead,
  Lines: KkSignUpSheetLines,
  Line: KkSignUpSheetLine,
  Entry: KkSignUpSheetEntry,
});
