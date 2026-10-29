import { apiFetch } from '@/lib/api/api-fetch';
import { NoContentSchema } from '@/lib/api/schemas';
import type { ActStudioResponse, GroupActsResponse, MyActsResponse } from './schemas';
import { ActStudioResponseSchema, GroupActsResponseSchema, MyActsResponseSchema } from './schemas';

const coEditorPathOf = (actId: number, personId: number): string =>
  `/api/acts/${actId}/co-editors/${personId}`;

export const requestActStudio = (actId: number, accessToken: string): Promise<ActStudioResponse> =>
  apiFetch(`/api/acts/${actId}/studio`, { schema: ActStudioResponseSchema, accessToken });

export const requestGroupActs = (
  groupId: number,
  accessToken: string,
): Promise<GroupActsResponse> =>
  apiFetch(`/api/groups/${groupId}/acts`, { schema: GroupActsResponseSchema, accessToken });

export const requestMyActs = (accessToken: string): Promise<MyActsResponse> =>
  apiFetch('/api/acts/mine', { schema: MyActsResponseSchema, accessToken });

export const requestCoEditorGrant = (
  actId: number,
  personId: number,
  accessToken: string,
): Promise<void> =>
  apiFetch(coEditorPathOf(actId, personId), {
    method: 'PUT',
    schema: NoContentSchema,
    accessToken,
  });

export const requestCoEditorRevoke = (
  actId: number,
  personId: number,
  accessToken: string,
): Promise<void> =>
  apiFetch(coEditorPathOf(actId, personId), {
    method: 'DELETE',
    schema: NoContentSchema,
    accessToken,
  });
