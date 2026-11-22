import { KkNote } from '@furria/ui/KkNote';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { WhatsAppQrRead } from '../hooks/use-whatsapp-link';
import { LINK_QR_STEPS } from '../whatsapp-copy';
import { WhatsAppQrImage } from './WhatsAppQrImage';

interface WhatsAppQrScanProps {
  qr: WhatsAppQrRead;
}

export const WhatsAppQrScan: FC<WhatsAppQrScanProps> = ({ qr }) => (
  <Stack sx={{ gap: 1.5, alignItems: 'center', minWidth: 0 }}>
    <WhatsAppQrImage qr={qr} />
    <KkNote tone="hint" icon="info">
      {LINK_QR_STEPS}
    </KkNote>
  </Stack>
);
