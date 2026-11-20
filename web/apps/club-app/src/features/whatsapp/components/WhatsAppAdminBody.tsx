import type { FC } from 'react';
import { RedeemChecking } from '@/features/redeem/components/RedeemChecking';
import { AccessDenied } from '@/features/session/components/AccessDenied';
import { SystemError } from '@/features/system/components/SystemError';
import type { WhatsAppAdminControl } from '../hooks/use-whatsapp-admin';
import { WHATSAPP_DENIED_MESSAGE, WHATSAPP_FAILED_MESSAGE } from '../whatsapp-copy';
import { WhatsAppPanels } from './WhatsAppPanels';

interface WhatsAppAdminBodyProps {
  control: WhatsAppAdminControl;
}

export const WhatsAppAdminBody: FC<WhatsAppAdminBodyProps> = ({ control }) => {
  const { read } = control;

  switch (read.kind) {
    case 'loading':
      return <RedeemChecking />;
    case 'denied':
      return <AccessDenied message={WHATSAPP_DENIED_MESSAGE} />;
    case 'failed':
      return (
        <SystemError
          message={WHATSAPP_FAILED_MESSAGE}
          retrying={control.isRetrying}
          onRetry={control.retry}
        />
      );
    case 'shown':
      return <WhatsAppPanels overview={read.overview} />;
  }
};
