import { KkPassCardRoot } from './internal/layout/KkPassCardRoot';
import { KkPassCardAnswer } from './internal/ui/KkPassCardAnswer';
import { KkPassCardCast } from './internal/ui/KkPassCardCast';
import { KkPassCardFact } from './internal/ui/KkPassCardFact';
import { KkPassCardHead } from './internal/ui/KkPassCardHead';
import { KkPassCardPractice } from './internal/ui/KkPassCardPractice';
import { KkPassCardSlot } from './internal/ui/KkPassCardSlot';
import { KkPassCardTraining } from './internal/ui/KkPassCardTraining';

export type { KkPassAnswer } from './internal/ui/KkPassCardAnswer';
export type { KkPassCastPerson } from './internal/ui/KkPassCardCast';
export type { KkPassCardHeadLevel } from './internal/ui/KkPassCardHead';

export const KkPassCard = Object.assign(KkPassCardRoot, {
  Head: KkPassCardHead,
  Slot: KkPassCardSlot,
  Training: KkPassCardTraining,
  Answer: KkPassCardAnswer,
  Practice: KkPassCardPractice,
  Cast: KkPassCardCast,
  Fact: KkPassCardFact,
});
