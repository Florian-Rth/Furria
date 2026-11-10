import type { RolePermissionCopy } from '@/features/manage-roles/role-permission-copy';
import { isPermissionKey, toPermissionCopy } from '@/features/manage-roles/role-permission-copy';
import type { AppSection } from '@/features/session/app-sections';
import { MANAGE_SECTIONS, toPermittedSections } from '@/features/session/app-sections';
import type { StartMine } from './schemas';

export interface OfficeSheetView {
  title: string;
  permissions: RolePermissionCopy[];
  workbench: AppSection | null;
}

export const toOfficeSheet = (mine: StartMine): OfficeSheetView => {
  const keys = (mine.permissionKeys ?? []).filter(isPermissionKey);

  return {
    title: `Vorstand: ${mine.name ?? ''}`,
    permissions: keys.map(toPermissionCopy),
    workbench: toPermittedSections(MANAGE_SECTIONS, keys)[0] ?? null,
  };
};
