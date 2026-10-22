import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { SYSTEM_ORIGIN } from '@/features/session/app-sections';
import { RequireScreenPermission } from '@/features/session/components/RequireScreenPermission';
import { SystemAreaPage } from '@/features/system/components/SystemAreaPage';
import { SECTION_TITLES } from '@/features/system/system-copy';
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
