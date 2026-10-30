import { KkLaneCardsCard } from './internal/layout/KkLaneCardsCard';
import { KkLaneCardsChips } from './internal/layout/KkLaneCardsChips';
import { KkLaneCardsFoot } from './internal/layout/KkLaneCardsFoot';
import { KkLaneCardsRoot } from './internal/layout/KkLaneCardsRoot';
import { KkLaneCardsStage } from './internal/layout/KkLaneCardsStage';
import { KkLaneCardsCounts } from './internal/ui/KkLaneCardsCounts';
import { KkLaneCardsMeta } from './internal/ui/KkLaneCardsMeta';
import { KkLaneCardsTitle } from './internal/ui/KkLaneCardsTitle';

export type { KkLaneCardsCount, KkLaneCardsEight } from './internal/ui/KkLaneCardsCounts';

export const KkLaneCards = Object.assign(KkLaneCardsRoot, {
  Card: KkLaneCardsCard,
  Chips: KkLaneCardsChips,
  Stage: KkLaneCardsStage,
  Counts: KkLaneCardsCounts,
  Foot: KkLaneCardsFoot,
  Meta: KkLaneCardsMeta,
  Title: KkLaneCardsTitle,
});
