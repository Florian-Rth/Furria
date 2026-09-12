import type { FC, PropsWithChildren } from 'react';
import type { PermissionKey } from '@/lib/api/schemas';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { usePermissions } from '../hooks/use-permissions';
import { AccessDenied } from './AccessDenied';

const DENIED_MESSAGES: Partial<Record<PermissionKey, string>> = {
  [PERMISSION_KEYS.personsManage]:
    'Die Personenverwaltung ist an eine Rolle gebunden. Du hast sie gerade nicht.',
  [PERMISSION_KEYS.groupsManage]:
    'Die Gruppenverwaltung ist an eine Rolle gebunden. Du hast sie gerade nicht.',
  [PERMISSION_KEYS.rolesManage]:
    'Rollen & Rechte ist an eine Rolle gebunden. Du hast sie gerade nicht.',
};

const FALLBACK_MESSAGE = 'Diese Seite ist an eine Rolle gebunden. Du hast sie gerade nicht.';

interface RequirePermissionProps extends PropsWithChildren {
  permissionKey: PermissionKey;
}

export const RequirePermission: FC<RequirePermissionProps> = ({ permissionKey, children }) => {
  const { has, isPending } = usePermissions();

  if (isPending || has(permissionKey)) {
    return children;
  }

  return <AccessDenied message={DENIED_MESSAGES[permissionKey] ?? FALLBACK_MESSAGE} />;
};
