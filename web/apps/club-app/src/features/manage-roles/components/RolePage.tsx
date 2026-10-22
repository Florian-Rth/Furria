import { KkScreen } from '@furria/ui/KkScreen';
import { KkScreenHeaderSkeleton } from '@furria/ui/KkScreenHeaderSkeleton';
import type { FC } from 'react';
import { AREA_HANDOVERS } from '@/features/session/app-sections';
import { RequirePermission } from '@/features/session/components/RequirePermission';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { useRolePage } from '../hooks/use-role-page';
import { ROLES_ORIGIN } from '../manage-roles-labels';
import { ROLES_TITLE } from '../roles-hub-copy';
import { RoleBody } from './RoleBody';
import { RoleHeader } from './RoleHeader';

export const RolePage: FC = () => {
  const page = useRolePage();
  const title = page.role?.name ?? ROLES_TITLE;
  const pendingHeader = page.query.isPending ? <KkScreenHeaderSkeleton /> : null;
  const header =
    page.role === null ? (
      pendingHeader
    ) : (
      <RoleHeader role={page.role} totalKeys={page.catalogue.length} />
    );

  return (
    <KkScreen
      kind="detail"
      title={title}
      origin={ROLES_ORIGIN}
      header={header}
      handover={AREA_HANDOVERS.manage}
    >
      <RequirePermission permissionKey={PERMISSION_KEYS.rolesManage}>
        <RoleBody page={page} />
      </RequirePermission>
    </KkScreen>
  );
};
