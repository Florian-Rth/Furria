import { z } from 'zod';

export const ManagePersonsPanelSchema = z.object({
  personCount: z.number().int(),
  memberCount: z.number().int(),
});
export type ManagePersonsPanel = z.infer<typeof ManagePersonsPanelSchema>;

export const ManageGroupsPanelSchema = z.object({
  groupCount: z.number().int(),
  archivedCount: z.number().int(),
});
export type ManageGroupsPanel = z.infer<typeof ManageGroupsPanelSchema>;

export const ManageRolesPanelSchema = z.object({
  roleCount: z.number().int(),
  vacantCount: z.number().int(),
});
export type ManageRolesPanel = z.infer<typeof ManageRolesPanelSchema>;

export const ManageBoardPanelSchema = z.object({
  officeCount: z.number().int(),
  seatCount: z.number().int(),
  vacantOfficeCount: z.number().int(),
});
export type ManageBoardPanel = z.infer<typeof ManageBoardPanelSchema>;

export const ManageSessionsPanelSchema = z.object({
  entryCount: z.number().int(),
  hasCurrentEntry: z.boolean(),
});
export type ManageSessionsPanel = z.infer<typeof ManageSessionsPanelSchema>;

export const ManageVenuesPanelSchema = z.object({
  venueCount: z.number().int(),
  archivedCount: z.number().int(),
});
export type ManageVenuesPanel = z.infer<typeof ManageVenuesPanelSchema>;

export const ManageKeysPanelSchema = z.object({
  issuedCount: z.number().int(),
  holdingCount: z.number().int(),
  holderCount: z.number().int(),
});
export type ManageKeysPanel = z.infer<typeof ManageKeysPanelSchema>;

export const ManageClubRecordPanelSchema = z.object({
  name: z.string().nullable(),
  missingFactCount: z.number().int(),
});
export type ManageClubRecordPanel = z.infer<typeof ManageClubRecordPanelSchema>;

export const ManageHubSchema = z.object({
  persons: ManagePersonsPanelSchema.nullable(),
  groups: ManageGroupsPanelSchema.nullable(),
  roles: ManageRolesPanelSchema.nullable(),
  board: ManageBoardPanelSchema.nullable(),
  clubRecord: ManageClubRecordPanelSchema.nullable(),
  sessions: ManageSessionsPanelSchema.nullable(),
  venues: ManageVenuesPanelSchema.nullable(),
  keys: ManageKeysPanelSchema.nullable(),
});
export type ManageHub = z.infer<typeof ManageHubSchema>;
