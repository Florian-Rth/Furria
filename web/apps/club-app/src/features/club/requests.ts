import { apiFetch } from '@/lib/api/api-fetch';
import type { ClubHub } from './schemas';
import { ClubHubSchema } from './schemas';

export const requestClubHub = (accessToken: string): Promise<ClubHub> =>
  apiFetch('/api/club/hub', { schema: ClubHubSchema, accessToken });
