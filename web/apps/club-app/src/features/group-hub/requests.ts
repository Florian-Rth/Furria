import { apiFetch } from '@/lib/api/api-fetch';
import type { HubDetails, MyGroupsResponse } from './schemas';
import { HubDetailsSchema, MyGroupsResponseSchema } from './schemas';

export const requestMyGroups = (accessToken: string): Promise<MyGroupsResponse> =>
  apiFetch('/api/my-groups', { schema: MyGroupsResponseSchema, accessToken });

export const requestMyGroup = (groupId: number, accessToken: string): Promise<HubDetails> =>
  apiFetch(`/api/my-groups/${groupId}`, { schema: HubDetailsSchema, accessToken });
