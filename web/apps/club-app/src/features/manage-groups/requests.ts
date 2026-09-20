import { apiFetch } from '@/lib/api/api-fetch';
import { NoContentSchema } from '@/lib/api/schemas';
import type {
  CreatedGroup,
  CreatedGroupKind,
  GroupForm,
  GroupKindForm,
  ManagedGroupDetails,
  ManagedGroupsResponse,
} from './schemas';
import {
  CreatedGroupKindSchema,
  CreatedGroupSchema,
  ManagedGroupDetailsSchema,
  ManagedGroupsResponseSchema,
} from './schemas';

export const requestManagedGroups = (accessToken: string): Promise<ManagedGroupsResponse> =>
  apiFetch('/api/manage/groups', { schema: ManagedGroupsResponseSchema, accessToken });

export const requestManagedGroup = (
  groupId: number,
  accessToken: string,
): Promise<ManagedGroupDetails> =>
  apiFetch(`/api/manage/groups/${groupId}`, {
    schema: ManagedGroupDetailsSchema,
    accessToken,
  });

export const requestGroupCreation = (form: GroupForm, accessToken: string): Promise<CreatedGroup> =>
  apiFetch('/api/manage/groups', {
    method: 'POST',
    body: { name: form.name, description: form.description, isRecruiting: form.isRecruiting },
    schema: CreatedGroupSchema,
    accessToken,
  });

export const requestGroupUpdate = (
  groupId: number,
  form: GroupForm,
  accessToken: string,
): Promise<void> =>
  apiFetch(`/api/manage/groups/${groupId}`, {
    method: 'PUT',
    body: { name: form.name, description: form.description, isRecruiting: form.isRecruiting },
    schema: NoContentSchema,
    accessToken,
  });

export const requestGroupArchival = (groupId: number, accessToken: string): Promise<void> =>
  apiFetch(`/api/manage/groups/${groupId}/archive`, {
    method: 'POST',
    body: {},
    schema: NoContentSchema,
    accessToken,
  });

export const requestGroupRestoration = (groupId: number, accessToken: string): Promise<void> =>
  apiFetch(`/api/manage/groups/${groupId}/restore`, {
    method: 'POST',
    body: {},
    schema: NoContentSchema,
    accessToken,
  });

export const requestGroupKindCreation = (
  form: GroupKindForm,
  accessToken: string,
): Promise<CreatedGroupKind> =>
  apiFetch('/api/manage/groups/kinds', {
    method: 'POST',
    body: { name: form.name, sortOrder: Number(form.sortOrder) },
    schema: CreatedGroupKindSchema,
    accessToken,
  });

export const requestGroupKindUpdate = (
  groupKindId: number,
  form: GroupKindForm,
  accessToken: string,
): Promise<void> =>
  apiFetch(`/api/manage/groups/kinds/${groupKindId}`, {
    method: 'PUT',
    body: { name: form.name, sortOrder: Number(form.sortOrder) },
    schema: NoContentSchema,
    accessToken,
  });

export const requestGroupKindArchival = (groupKindId: number, accessToken: string): Promise<void> =>
  apiFetch(`/api/manage/groups/kinds/${groupKindId}/archive`, {
    method: 'POST',
    body: {},
    schema: NoContentSchema,
    accessToken,
  });

export const requestGroupKindRestoration = (
  groupKindId: number,
  accessToken: string,
): Promise<void> =>
  apiFetch(`/api/manage/groups/kinds/${groupKindId}/restore`, {
    method: 'POST',
    body: {},
    schema: NoContentSchema,
    accessToken,
  });
