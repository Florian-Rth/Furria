import type { FieldValues } from 'react-hook-form';
import { WriteDraftSchema } from './schemas';

const WRITE_DRAFT_PREFIX = 'furria.club-app.write-draft:';

export const writeDraftKeyOf = (pathname: string): string => `${WRITE_DRAFT_PREFIX}${pathname}`;

export const parseWriteDraft = (raw: string | null, accountId: number): FieldValues | null => {
  if (raw === null) {
    return null;
  }

  try {
    const parsed = WriteDraftSchema.safeParse(JSON.parse(raw));

    return parsed.success && parsed.data.accountId === accountId ? parsed.data.values : null;
  } catch {
    return null;
  }
};
