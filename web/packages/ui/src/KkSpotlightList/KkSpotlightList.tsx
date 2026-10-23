import { KkSpotlightListRoot } from './internal/layout/KkSpotlightListRoot';
import { KkSpotlightListRow } from './internal/ui/KkSpotlightListRow';
import { KkSpotlightListSection } from './internal/ui/KkSpotlightListSection';

export type { KkSpotlight } from './internal/ui/KkSpotlightListRow';

export const KkSpotlightList = Object.assign(KkSpotlightListRoot, {
  Section: KkSpotlightListSection,
  Row: KkSpotlightListRow,
});
