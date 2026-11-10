import { KkNote } from '@furria/ui/KkNote';
import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import { KkQrCode } from '@furria/ui/KkQrCode';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { WINDOW_ADDRESS_LINE, WINDOW_ADDRESS_TITLE } from '../claim-window-copy';

const QR_MAX_WIDTH = '15rem';

interface ClaimWindowAddressPanelProps {
  address: string;
}

export const ClaimWindowAddressPanel: FC<ClaimWindowAddressPanelProps> = ({ address }) => (
  <KkPanelSection title={WINDOW_ADDRESS_TITLE}>
    <KkPanel>
      <Stack sx={{ gap: 1.5, alignItems: 'center', minWidth: 0 }}>
        <KkQrCode value={address} label={address} sx={{ maxWidth: QR_MAX_WIDTH }} />
        <KkNote>{address}</KkNote>
        <KkNote tone="hint" icon="info">
          {WINDOW_ADDRESS_LINE}
        </KkNote>
      </Stack>
    </KkPanel>
  </KkPanelSection>
);
