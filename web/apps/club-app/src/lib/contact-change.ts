import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import type { ContactChange } from '@/lib/api/schemas';

const SELF_LABEL = 'dir';
const SAME_YEAR_PATTERN = 'd. MMM';
const OTHER_YEAR_PATTERN = 'd. MMM yyyy';

const toChangerLabel = (change: ContactChange, viewerPersonId: number | null): string =>
  change.changedBy.personId === viewerPersonId ? SELF_LABEL : change.changedBy.firstName;

const formatChangeDay = (changedAt: Date, today: Date): string => {
  const pattern =
    changedAt.getFullYear() === today.getFullYear() ? SAME_YEAR_PATTERN : OTHER_YEAR_PATTERN;

  return format(changedAt, pattern, { locale: de });
};

export const toContactChangeLine = (
  change: ContactChange,
  viewerPersonId: number | null,
  today: Date,
): string =>
  `geändert von ${toChangerLabel(change, viewerPersonId)} am ${formatChangeDay(new Date(change.at), today)}`;
