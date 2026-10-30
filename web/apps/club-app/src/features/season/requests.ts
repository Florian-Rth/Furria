import { apiFetch } from '@/lib/api/api-fetch';
import type { ActSeasonResponse } from './schemas';
import { ActSeasonResponseSchema } from './schemas';

export const requestActSeason = (
  sessionYear: number | null,
  accessToken: string,
): Promise<ActSeasonResponse> =>
  apiFetch(sessionYear === null ? '/api/acts/season' : `/api/acts/season?session=${sessionYear}`, {
    schema: ActSeasonResponseSchema,
    accessToken,
  });
