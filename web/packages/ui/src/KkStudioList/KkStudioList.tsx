import { KkStudioListPlaces } from './internal/layout/KkStudioListPlaces';
import { KkStudioListRoot } from './internal/layout/KkStudioListRoot';
import { KkStudioListAction } from './internal/ui/KkStudioListAction';
import { KkStudioListHead } from './internal/ui/KkStudioListHead';
import { KkStudioListHolder } from './internal/ui/KkStudioListHolder';
import { KkStudioListPlace } from './internal/ui/KkStudioListPlace';
import { KkStudioListRow } from './internal/ui/KkStudioListRow';
import { KkStudioListSlot } from './internal/ui/KkStudioListSlot';
import { KkStudioListSortRow } from './internal/ui/KkStudioListSortRow';
import { KkStudioListUpload } from './internal/ui/KkStudioListUpload';

export type { KkStudioListBadgeTone } from './internal/ui/KkStudioListRow';

export const KkStudioList = Object.assign(KkStudioListRoot, {
  Head: KkStudioListHead,
  Row: KkStudioListRow,
  SortRow: KkStudioListSortRow,
  Places: KkStudioListPlaces,
  Place: KkStudioListPlace,
  Holder: KkStudioListHolder,
  Slot: KkStudioListSlot,
  Action: KkStudioListAction,
  Upload: KkStudioListUpload,
});
