import { KkNote } from '@furria/ui/KkNote';
import { KkQrCode } from '@furria/ui/KkQrCode';
import type { FC } from 'react';
import type { WhatsAppQrRead } from '../hooks/use-whatsapp-link';
import { LINK_QR_FAILED, LINK_QR_LABEL, LINK_QR_PENDING } from '../whatsapp-copy';

const QR_MAX_WIDTH = '15rem';

interface WhatsAppQrImageProps {
  qr: WhatsAppQrRead;
}

export const WhatsAppQrImage: FC<WhatsAppQrImageProps> = ({ qr }) => {
  switch (qr.kind) {
    case 'loading':
      return <KkNote>{LINK_QR_PENDING}</KkNote>;
    case 'failed':
      return (
        <KkNote tone="warning" icon="alert">
          {LINK_QR_FAILED}
        </KkNote>
      );
    case 'shown':
      return <KkQrCode value={qr.value} label={LINK_QR_LABEL} sx={{ maxWidth: QR_MAX_WIDTH }} />;
  }
};
