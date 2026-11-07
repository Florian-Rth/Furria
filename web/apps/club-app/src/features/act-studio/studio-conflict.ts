import type { JsonBody } from '@furria/api-client';
import type { ChoreographyConflict } from './schemas';
import { ChoreographyConflictSchema } from './schemas';

export const choreographyConflictOf = (payload: JsonBody | null): ChoreographyConflict | null => {
  const parsed = ChoreographyConflictSchema.safeParse(payload);

  return parsed.success && parsed.data.overlaps.length > 0 ? parsed.data : null;
};
