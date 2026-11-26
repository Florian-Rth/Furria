import { KkStatusLine } from '@furria/ui/KkStatusLine';
import type { FC } from 'react';
import { STATE_COPY } from '../whatsapp-copy';

const CONNECTED = STATE_COPY.working;

export const WhatsAppHelpConnectionPreview: FC = () => (
  <KkStatusLine tone={CONNECTED.tone} text={CONNECTED.text} />
);
