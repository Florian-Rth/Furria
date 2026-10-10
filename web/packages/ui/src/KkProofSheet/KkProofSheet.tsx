import { KkProofSheetPart } from './internal/layout/KkProofSheetPart';
import { KkProofSheetRail } from './internal/layout/KkProofSheetRail';
import { KkProofSheetRoot } from './internal/layout/KkProofSheetRoot';
import { KkProofSheetMarkWord } from './internal/ui/KkProofSheetMarkWord';

export type { KkProofMarkKind } from './internal/layout/KkProofSheetPart';

export const KkProofSheet = Object.assign(KkProofSheetRoot, {
  Part: KkProofSheetPart,
  Rail: KkProofSheetRail,
  MarkWord: KkProofSheetMarkWord,
});
