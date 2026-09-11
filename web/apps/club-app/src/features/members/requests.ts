import { apiFetch } from '@/lib/api/api-fetch';
import type { MembersResponse } from './schemas';
import { MembersResponseSchema } from './schemas';

export const requestMembers = (accessToken: string): Promise<MembersResponse> =>
  apiFetch('/api/members', { schema: MembersResponseSchema, accessToken });
