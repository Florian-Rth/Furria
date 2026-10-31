import { KkStudioListRoot } from './internal/layout/KkStudioListRoot';
import { KkStudioListAction } from './internal/ui/KkStudioListAction';
import { KkStudioListHead } from './internal/ui/KkStudioListHead';
import { KkStudioListRow } from './internal/ui/KkStudioListRow';
import { KkStudioListSlot } from './internal/ui/KkStudioListSlot';
import { KkStudioListUpload } from './internal/ui/KkStudioListUpload';

export type { KkStudioListBadgeTone } from './internal/ui/KkStudioListRow';

export const KkStudioList = Object.assign(KkStudioListRoot, {
  Head: KkStudioListHead,
  Row: KkStudioListRow,
  Slot: KkStudioListSlot,
  Action: KkStudioListAction,
  Upload: KkStudioListUpload,
});
