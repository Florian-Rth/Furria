import { toGroupKindId } from '@/features/group-kinds/group-kinds-labels';
import { apiFetch } from '@/lib/api/api-fetch';
import { NoContentSchema } from '@/lib/api/schemas';
import { toGroupInfoPayload } from './group-hub-labels';
import type {
  AddedGroupAdmin,
  AddedGroupMembership,
  AddGroupAdminForm,
  AddGroupMembershipForm,
  EndGroupAdminForm,
  EndGroupMembershipForm,
  GroupAdministrationForm,
  GroupCalendarResponse,
  GroupHub,
  GroupInfoForm,
  MyGroupsResponse,
  PersonSearchResponse,
} from './schemas';
import {
  AddedGroupAdminSchema,
  AddedGroupMembershipSchema,
  GroupCalendarResponseSchema,
  GroupHubSchema,
  MyGroupsResponseSchema,
  PersonSearchResponseSchema,
} from './schemas';
import type { UsualTrainingTimePayload } from './usual-training-time-labels';

export const requestMyGroups = (accessToken: string): Promise<MyGroupsResponse> =>
  apiFetch('/api/my-groups', { schema: MyGroupsResponseSchema, accessToken });

export const requestGroupHub = (groupId: number, accessToken: string): Promise<GroupHub> =>
  apiFetch(`/api/groups/${groupId}`, { schema: GroupHubSchema, accessToken });

export const requestGroupCalendar = (
  groupId: number,
  window: { from: string; to: string },
  accessToken: string,
): Promise<GroupCalendarResponse> =>
  apiFetch(`/api/groups/${groupId}/calendar?from=${window.from}&to=${window.to}`, {
    schema: GroupCalendarResponseSchema,
    accessToken,
  });

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
    body: toGroupInfoPayload(form),
    schema: NoContentSchema,
    accessToken,
  });

export const requestGroupAdministrationUpdate = (
  groupId: number,
  form: GroupAdministrationForm,
  accessToken: string,
): Promise<void> =>
  apiFetch(`/api/manage/groups/${groupId}`, {
    method: 'PUT',
    body: { name: form.name, groupKindId: toGroupKindId(form.groupKindId) },
    schema: NoContentSchema,
    accessToken,
  });

export const requestGroupArchivalFromHub = (groupId: number, accessToken: string): Promise<void> =>
  apiFetch(`/api/manage/groups/${groupId}/archive`, {
    method: 'POST',
    body: {},
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

export const requestAddGroupAdmin = (
  groupId: number,
  form: AddGroupAdminForm,
  accessToken: string,
): Promise<AddedGroupAdmin> =>
  apiFetch(`/api/groups/${groupId}/admins`, {
    method: 'POST',
    body: { personId: form.personId, function: form.function, sinceOn: form.sinceOn },
    schema: AddedGroupAdminSchema,
    accessToken,
  });

export const requestEndGroupAdmin = (
  groupId: number,
  form: EndGroupAdminForm,
  accessToken: string,
): Promise<void> =>
  apiFetch(`/api/groups/${groupId}/admins/${form.groupAdminId}/end`, {
    method: 'POST',
    body: { endedOn: form.endedOn },
    schema: NoContentSchema,
    accessToken,
  });

export const requestSetUsualTrainingTimes = (
  groupId: number,
  usualTimes: readonly UsualTrainingTimePayload[],
  accessToken: string,
): Promise<void> =>
  apiFetch(`/api/groups/${groupId}/usual-training-times`, {
    method: 'PUT',
    body: {
      usualTimes: usualTimes.map((usualTime) => ({
        weekday: usualTime.weekday,
        startsAt: usualTime.startsAt,
        durationMinutes: usualTime.durationMinutes,
        venueId: usualTime.venueId,
      })),
    },
    schema: NoContentSchema,
    accessToken,
  });
