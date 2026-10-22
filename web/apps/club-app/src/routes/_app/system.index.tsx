import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { MORE_SECTION, SYSTEM_TITLE } from '@/features/session/app-sections';
import { RequireScreenPermission } from '@/features/session/components/RequireScreenPermission';
import { SystemPage } from '@/features/system/components/SystemPage';
import { PERMISSION_KEYS } from '@/lib/api/schemas';

const SystemRoute: FC = () => (
  <RequireScreenPermission
    permissionKey={PERMISSION_KEYS.systemView}
    title={SYSTEM_TITLE}
    section={MORE_SECTION}
  >
    <SystemPage />
  </RequireScreenPermission>
);

export const Route = createFileRoute('/_app/system/')({ component: SystemRoute });
