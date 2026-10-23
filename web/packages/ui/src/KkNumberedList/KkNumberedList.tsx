import { KkNumberedListRoot } from './internal/layout/KkNumberedListRoot';
import { KkNumberedListEmpty } from './internal/ui/KkNumberedListEmpty';
import { KkNumberedListRail } from './internal/ui/KkNumberedListRail';
import { KkNumberedListRow } from './internal/ui/KkNumberedListRow';
import { KkNumberedListSection } from './internal/ui/KkNumberedListSection';

export type { KkListBracket } from './internal/ui/KkNumberedListBracket';
export type { KkListCheck } from './internal/ui/KkNumberedListCheck';
export type { KkListRowState } from './internal/ui/KkNumberedListRow';

export const KkNumberedList = Object.assign(KkNumberedListRoot, {
  Row: KkNumberedListRow,
  Rail: KkNumberedListRail,
  Section: KkNumberedListSection,
  Empty: KkNumberedListEmpty,
});
