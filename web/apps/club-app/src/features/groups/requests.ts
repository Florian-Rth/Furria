import { apiFetch } from '@/lib/api/api-fetch';
import type { GroupDetails, GroupsResponse } from './schemas';
import { GroupDetailsSchema, GroupsResponseSchema } from './schemas';

export const requestGroups = (accessToken: string): Promise<GroupsResponse> =>
  apiFetch('/api/groups', { schema: GroupsResponseSchema, accessToken });

export const requestGroup = (groupId: number, accessToken: string): Promise<GroupDetails> =>
  apiFetch(`/api/groups/${groupId}`, { schema: GroupDetailsSchema, accessToken });
