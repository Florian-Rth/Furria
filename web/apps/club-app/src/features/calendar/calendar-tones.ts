import type { KkGroupTone } from '@furria/ui';
import { toGroupTone } from '@/features/groups';

export interface CalendarOwnership {
  ownerGroupId: number | null;
  ownerGroupTone: KkGroupTone | null;
}

export const toEntryTone = (entry: CalendarOwnership): KkGroupTone | null => {
  if (entry.ownerGroupId === null) {
    return null;
  }

  return toGroupTone(entry.ownerGroupId, entry.ownerGroupTone);
};
