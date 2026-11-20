import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { SYSTEM_ORIGIN } from '@/features/session/app-sections';
import { RequireScreenPermission } from '@/features/session/components/RequireScreenPermission';
import { WhatsAppAdminPage } from '@/features/whatsapp/components/WhatsAppAdminPage';
import { WHATSAPP_TITLE } from '@/features/whatsapp/whatsapp-copy';
import { PERMISSION_KEYS } from '@/lib/api/schemas';

const SystemWhatsAppRoute: FC = () => (
  <RequireScreenPermission
    permissionKey={PERMISSION_KEYS.systemView}
    title={WHATSAPP_TITLE}
    origin={SYSTEM_ORIGIN}
  >
    <WhatsAppAdminPage />
  </RequireScreenPermission>
);

export const Route = createFileRoute('/_app/system/whatsapp')({ component: SystemWhatsAppRoute });
