import { KkScreen } from '@furria/ui/KkScreen';
import type { FC } from 'react';
import { SYSTEM_ORIGIN } from '@/features/session/app-sections';
import { useWhatsAppAdmin } from '../hooks/use-whatsapp-admin';
import { WHATSAPP_TITLE } from '../whatsapp-copy';
import { WhatsAppAdminBody } from './WhatsAppAdminBody';

export const WhatsAppAdminPage: FC = () => {
  const control = useWhatsAppAdmin();

  return (
    <KkScreen kind="detail" title={WHATSAPP_TITLE} origin={SYSTEM_ORIGIN} action={control.action}>
      <WhatsAppAdminBody control={control} />
    </KkScreen>
  );
};
