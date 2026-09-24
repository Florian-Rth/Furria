import { apiFetch } from '@/lib/api/api-fetch';
import type { GroupsResponse } from './schemas';
import { GroupsResponseSchema } from './schemas';

export const requestGroups = (accessToken: string): Promise<GroupsResponse> =>
  apiFetch('/api/groups', { schema: GroupsResponseSchema, accessToken });
