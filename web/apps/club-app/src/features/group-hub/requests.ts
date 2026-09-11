import { apiFetch } from '@/lib/api/api-fetch';
import { NoContentSchema } from '@/lib/api/schemas';
import type {
  AddedGroupMembership,
  AddGroupMembershipForm,
  EndGroupMembershipForm,
  GroupInfoForm,
  HubDetails,
  MyGroupsResponse,
  PersonSearchResponse,
} from './schemas';
import {
  AddedGroupMembershipSchema,
  HubDetailsSchema,
  MyGroupsResponseSchema,
  PersonSearchResponseSchema,
} from './schemas';

export const requestMyGroups = (accessToken: string): Promise<MyGroupsResponse> =>
  apiFetch('/api/my-groups', { schema: MyGroupsResponseSchema, accessToken });

export const requestMyGroup = (groupId: number, accessToken: string): Promise<HubDetails> =>
  apiFetch(`/api/my-groups/${groupId}`, { schema: HubDetailsSchema, accessToken });

export const requestPersonSearch = (
  query: string,
  accessToken: string,
): Promise<PersonSearchResponse> =>
  apiFetch(`/api/person-search?q=${encodeURIComponent(query)}`, {
    schema: PersonSearchResponseSchema,
    accessToken,
  });

export const requestGroupInfoUpdate = (
  groupId: number,
  form: GroupInfoForm,
  accessToken: string,
): Promise<void> =>
  apiFetch(`/api/groups/${groupId}/info`, {
    method: 'PUT',
    body: { description: form.description, isRecruiting: form.isRecruiting },
    schema: NoContentSchema,
    accessToken,
  });

export const requestAddGroupMembership = (
  groupId: number,
  form: AddGroupMembershipForm,
  accessToken: string,
): Promise<AddedGroupMembership> =>
  apiFetch(`/api/groups/${groupId}/memberships`, {
    method: 'POST',
    body: { personId: form.personId, joinedOn: form.joinedOn },
    schema: AddedGroupMembershipSchema,
    accessToken,
  });

export const requestEndGroupMembership = (
  groupId: number,
  form: EndGroupMembershipForm,
  accessToken: string,
): Promise<void> =>
  apiFetch(`/api/groups/${groupId}/memberships/${form.groupMembershipId}/end`, {
    method: 'POST',
    body: { endedOn: form.endedOn },
    schema: NoContentSchema,
    accessToken,
  });
