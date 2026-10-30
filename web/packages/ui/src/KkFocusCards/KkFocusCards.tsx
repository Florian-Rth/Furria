import { KkFocusCardsCard } from './internal/layout/KkFocusCardsCard';
import { KkFocusCardsRoot } from './internal/layout/KkFocusCardsRoot';
import { KkFocusCardsRow } from './internal/layout/KkFocusCardsRow';
import { KkFocusCardsCounts } from './internal/ui/KkFocusCardsCounts';
import { KkFocusCardsHead } from './internal/ui/KkFocusCardsHead';

export type { KkFocusCardsCount, KkFocusCardsEight } from './internal/ui/KkFocusCardsCounts';

export const KkFocusCards = Object.assign(KkFocusCardsRoot, {
  Card: KkFocusCardsCard,
  Row: KkFocusCardsRow,
  Head: KkFocusCardsHead,
  Counts: KkFocusCardsCounts,
});
