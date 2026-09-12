import { z } from 'zod';
import { PersonRefSchema } from '@/lib/api/schemas';

const NAME_REQUIRED_MESSAGE = 'Gib der Rolle einen Namen.';
const NAME_TOO_LONG_MESSAGE = 'Der Name darf höchstens 80 Zeichen haben.';
const DESCRIPTION_TOO_LONG_MESSAGE = 'Die Beschreibung darf höchstens 400 Zeichen haben.';

export const ROLE_NAME_MAX_LENGTH = 80;
export const ROLE_DESCRIPTION_MAX_LENGTH = 400;

export const RolesSearchSchema = z.object({
  role: z.coerce.number().int().positive().optional().catch(undefined),
});
export type RolesSearch = z.infer<typeof RolesSearchSchema>;

export const RoleSummarySchema = z.object({
  roleId: z.number().int(),
  name: z.string(),
  description: z.string(),
  archivedOn: z.iso.date().nullable(),
  permissionKeys: z.array(z.string()),
  holders: z.array(PersonRefSchema),
});
export type RoleSummary = z.infer<typeof RoleSummarySchema>;

export const RolesResponseSchema = z.object({
  roles: z.array(RoleSummarySchema),
  permissionKeys: z.array(z.string()),
});
export type RolesResponse = z.infer<typeof RolesResponseSchema>;

export const RoleHolderSchema = PersonRefSchema.extend({
  roleHoldingId: z.number().int(),
  sinceOn: z.iso.date(),
  untilOn: z.iso.date().nullable(),
  since: z.iso.date(),
  isAffiliated: z.boolean(),
});
export type RoleHolder = z.infer<typeof RoleHolderSchema>;

export const RoleDetailsSchema = z.object({
  roleId: z.number().int(),
  name: z.string(),
  description: z.string(),
  archivedOn: z.iso.date().nullable(),
  permissionKeys: z.array(z.string()),
  holders: z.array(RoleHolderSchema),
  pastHolders: z.array(RoleHolderSchema),
});
export type RoleDetails = z.infer<typeof RoleDetailsSchema>;

export const CreatedRoleSchema = z.object({ roleId: z.number().int() });
export type CreatedRole = z.infer<typeof CreatedRoleSchema>;

export const CreatedRoleHoldingSchema = z.object({ roleHoldingId: z.number().int() });
export type CreatedRoleHolding = z.infer<typeof CreatedRoleHoldingSchema>;

export const RoleFormSchema = z.object({
  name: z.string().trim().min(1, NAME_REQUIRED_MESSAGE).max(80, NAME_TOO_LONG_MESSAGE),
  description: z.string().trim().max(400, DESCRIPTION_TOO_LONG_MESSAGE),
});
export type RoleForm = z.infer<typeof RoleFormSchema>;

export const AddRoleHoldingFormSchema = z.object({
  personId: z.number().int().positive(),
  sinceOn: z.iso.date(),
});
export type AddRoleHoldingForm = z.infer<typeof AddRoleHoldingFormSchema>;

export const EndRoleHoldingFormSchema = z.object({
  roleHoldingId: z.number().int().positive(),
  endedOn: z.iso.date(),
});
export type EndRoleHoldingForm = z.infer<typeof EndRoleHoldingFormSchema>;
