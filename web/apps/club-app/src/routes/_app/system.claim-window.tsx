import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { CLAIM_WINDOW_TITLE } from '@/features/claim-window/claim-window-copy';
import { ClaimWindowAdminPage } from '@/features/claim-window/components/ClaimWindowAdminPage';
import { SYSTEM_ORIGIN } from '@/features/session/app-sections';
import { RequireScreenPermission } from '@/features/session/components/RequireScreenPermission';
import { PERMISSION_KEYS } from '@/lib/api/schemas';

const SystemClaimWindowRoute: FC = () => (
  <RequireScreenPermission
    permissionKey={PERMISSION_KEYS.claimWindowManage}
    title={CLAIM_WINDOW_TITLE}
    origin={SYSTEM_ORIGIN}
  >
    <ClaimWindowAdminPage />
  </RequireScreenPermission>
);

export const Route = createFileRoute('/_app/system/claim-window')({
  component: SystemClaimWindowRoute,
});
