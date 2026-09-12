import { apiFetch } from '@/lib/api/api-fetch';
import { NoContentSchema } from '@/lib/api/schemas';
import type {
  AddRoleHoldingForm,
  CreatedRole,
  CreatedRoleHolding,
  EndRoleHoldingForm,
  RoleDetails,
  RoleForm,
  RolesResponse,
} from './schemas';
import {
  CreatedRoleHoldingSchema,
  CreatedRoleSchema,
  RoleDetailsSchema,
  RolesResponseSchema,
} from './schemas';

export const requestRoles = (accessToken: string): Promise<RolesResponse> =>
  apiFetch('/api/manage/roles', { schema: RolesResponseSchema, accessToken });

export const requestRole = (roleId: number, accessToken: string): Promise<RoleDetails> =>
  apiFetch(`/api/manage/roles/${roleId}`, { schema: RoleDetailsSchema, accessToken });

export const requestCreateRole = (form: RoleForm, accessToken: string): Promise<CreatedRole> =>
  apiFetch('/api/manage/roles', {
    method: 'POST',
    body: { name: form.name, description: form.description },
    schema: CreatedRoleSchema,
    accessToken,
  });

export const requestUpdateRole = (
  roleId: number,
  form: RoleForm,
  accessToken: string,
): Promise<void> =>
  apiFetch(`/api/manage/roles/${roleId}`, {
    method: 'PUT',
    body: { name: form.name, description: form.description },
    schema: NoContentSchema,
    accessToken,
  });

export const requestArchiveRole = (roleId: number, accessToken: string): Promise<void> =>
  apiFetch(`/api/manage/roles/${roleId}/archive`, {
    method: 'POST',
    schema: NoContentSchema,
    accessToken,
  });

export const requestRestoreRole = (roleId: number, accessToken: string): Promise<void> =>
  apiFetch(`/api/manage/roles/${roleId}/restore`, {
    method: 'POST',
    schema: NoContentSchema,
    accessToken,
  });

export const requestSetRolePermissions = (
  roleId: number,
  permissionKeys: readonly string[],
  accessToken: string,
): Promise<void> =>
  apiFetch(`/api/manage/roles/${roleId}/permissions`, {
    method: 'PUT',
    body: { permissionKeys: [...permissionKeys] },
    schema: NoContentSchema,
    accessToken,
  });

export const requestAddRoleHolding = (
  roleId: number,
  form: AddRoleHoldingForm,
  accessToken: string,
): Promise<CreatedRoleHolding> =>
  apiFetch(`/api/manage/roles/${roleId}/holdings`, {
    method: 'POST',
    body: { personId: form.personId, sinceOn: form.sinceOn },
    schema: CreatedRoleHoldingSchema,
    accessToken,
  });

export const requestEndRoleHolding = (
  roleId: number,
  form: EndRoleHoldingForm,
  accessToken: string,
): Promise<void> =>
  apiFetch(`/api/manage/roles/${roleId}/holdings/${form.roleHoldingId}/end`, {
    method: 'POST',
    body: { endedOn: form.endedOn },
    schema: NoContentSchema,
    accessToken,
  });
