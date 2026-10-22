import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { SYSTEM_ORIGIN } from '@/features/session/app-sections';
import { RequireScreenPermission } from '@/features/session/components/RequireScreenPermission';
import { SystemAreaPage } from '@/features/system/components/SystemAreaPage';
import { SECTION_TITLES } from '@/features/system/system-copy';
import { PERMISSION_KEYS } from '@/lib/api/schemas';

const SystemTasksRoute: FC = () => (
  <RequireScreenPermission
    permissionKey={PERMISSION_KEYS.systemView}
    title={SECTION_TITLES.services}
    origin={SYSTEM_ORIGIN}
  >
    <SystemAreaPage area="services" />
  </RequireScreenPermission>
);

export const Route = createFileRoute('/_app/system/tasks')({ component: SystemTasksRoute });
