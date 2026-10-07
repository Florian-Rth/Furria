import { toActLine } from '@/lib/act-line';
import type { ContactChange } from '@/lib/api/schemas';

const CHANGED_ACT = 'geändert';

export const toContactChangeLine = (
  change: ContactChange,
  viewerPersonId: number | null,
  today: Date,
): string => toActLine(CHANGED_ACT, change.changedBy, viewerPersonId, new Date(change.at), today);
