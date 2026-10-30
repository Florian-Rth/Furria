import { KkStudioHListRoot } from './internal/layout/KkStudioHListRoot';
import { KkStudioHListHead } from './internal/ui/KkStudioHListHead';
import { KkStudioHListRow } from './internal/ui/KkStudioHListRow';
import { KkStudioHListSlot } from './internal/ui/KkStudioHListSlot';

export type { KkStudioHListBadgeTone } from './internal/ui/KkStudioHListRow';

export const KkStudioHList = Object.assign(KkStudioHListRoot, {
  Head: KkStudioHListHead,
  Row: KkStudioHListRow,
  Slot: KkStudioHListSlot,
});
