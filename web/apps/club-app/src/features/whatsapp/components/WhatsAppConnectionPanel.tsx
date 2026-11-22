import { KkFieldRow } from '@furria/ui/KkFieldRow';
import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import { KkStatusLine } from '@furria/ui/KkStatusLine';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { WhatsAppState } from '../schemas';
import { BOT_PHONE_LABEL, CONNECTION_TITLE, STATE_COPY } from '../whatsapp-copy';

interface WhatsAppConnectionPanelProps {
  state: WhatsAppState;
  botPhone: string | null;
}

export const WhatsAppConnectionPanel: FC<WhatsAppConnectionPanelProps> = ({ state, botPhone }) => {
  const { tone, text } = STATE_COPY[state];
  const phoneRow =
    botPhone === null ? null : <KkFieldRow label={BOT_PHONE_LABEL} value={botPhone} />;

  return (
    <KkPanelSection title={CONNECTION_TITLE}>
      <KkPanel>
        <Stack sx={{ gap: 1, minWidth: 0 }}>
          <KkStatusLine tone={tone} text={text} />
          {phoneRow}
        </Stack>
      </KkPanel>
    </KkPanelSection>
  );
};
