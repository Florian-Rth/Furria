import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { RequireScreenPermission, SYSTEM_ORIGIN } from '@/features/session';
import { SECTION_TITLES, SystemAreaPage } from '@/features/system';
import { PERMISSION_KEYS } from '@/lib/api/schemas';

const SystemLogRoute: FC = () => (
  <RequireScreenPermission
    permissionKey={PERMISSION_KEYS.systemView}
    title={SECTION_TITLES.log}
    origin={SYSTEM_ORIGIN}
  >
    <SystemAreaPage area="log" />
  </RequireScreenPermission>
);

export const Route = createFileRoute('/_app/system/log')({ component: SystemLogRoute });
