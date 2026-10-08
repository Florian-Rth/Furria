import type { RolePermissionCopy } from '@/features/manage-roles';
import { isPermissionKey, toPermissionCopy } from '@/features/manage-roles';
import type { AppSection } from '@/features/session';
import { MANAGE_SECTIONS, toPermittedSections } from '@/features/session';
import type { StartMine } from './schemas';

export type RoleSheetVariant = 'role' | 'office';

export interface RoleSheetView {
  title: string;
  permissions: RolePermissionCopy[];
  workbench: AppSection | null;
}

export const ROLE_SHEET_KINDS: Record<RoleSheetVariant, StartMine['kind']> = {
  role: 'newRole',
  office: 'newBoardSeat',
};

export const toRoleSheet = (mine: StartMine): RoleSheetView => {
  const keys = (mine.permissionKeys ?? []).filter(isPermissionKey);
  const name = mine.name ?? '';

  return {
    title: mine.kind === 'newBoardSeat' ? `Vorstand: ${name}` : `Rolle ${name}`,
    permissions: keys.map(toPermissionCopy),
    workbench: toPermittedSections(MANAGE_SECTIONS, keys)[0] ?? null,
  };
};
