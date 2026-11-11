import { KkSignUpSheetLines } from './internal/layout/KkSignUpSheetLines';
import { KkSignUpSheetOwn } from './internal/layout/KkSignUpSheetOwn';
import { KkSignUpSheetRoot } from './internal/layout/KkSignUpSheetRoot';
import { KkSignUpSheetEntry } from './internal/ui/KkSignUpSheetEntry';
import { KkSignUpSheetHead } from './internal/ui/KkSignUpSheetHead';
import { KkSignUpSheetLine } from './internal/ui/KkSignUpSheetLine';
import { KkSignUpSheetMore } from './internal/ui/KkSignUpSheetMore';
import { KkSignUpSheetOwnLine } from './internal/ui/KkSignUpSheetOwnLine';

export type { KkSignUpSheetHeading } from './internal/ui/KkSignUpSheetHead';

export const KkSignUpSheet = Object.assign(KkSignUpSheetRoot, {
  Head: KkSignUpSheetHead,
  Own: KkSignUpSheetOwn,
  OwnLine: KkSignUpSheetOwnLine,
  Entry: KkSignUpSheetEntry,
  Lines: KkSignUpSheetLines,
  Line: KkSignUpSheetLine,
  More: KkSignUpSheetMore,
});
