import { KkScreen } from '@furria/ui/KkScreen';
import type { FC } from 'react';
import { toScreenHelp } from '@/features/help/screen-help';
import { SYSTEM_ORIGIN } from '@/features/session/app-sections';
import { useWhatsAppAdmin } from '../hooks/use-whatsapp-admin';
import { useWhatsAppHelpViewer } from '../hooks/use-whatsapp-help-viewer';
import { WHATSAPP_TITLE } from '../whatsapp-copy';
import { WhatsAppAdminBody } from './WhatsAppAdminBody';
import { WhatsAppHelp } from './WhatsAppHelp';

export const WhatsAppAdminPage: FC = () => {
  const control = useWhatsAppAdmin();
  const helpViewer = useWhatsAppHelpViewer(control.read);
  const help = toScreenHelp(<WhatsAppHelp viewer={helpViewer} />);

  return (
    <KkScreen
      kind="detail"
      title={WHATSAPP_TITLE}
      origin={SYSTEM_ORIGIN}
      action={control.action}
      help={help}
    >
      <WhatsAppAdminBody control={control} />
    </KkScreen>
  );
};
