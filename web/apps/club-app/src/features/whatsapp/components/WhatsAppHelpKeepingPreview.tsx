import { KkSwitchRow } from '@furria/ui/KkSwitchRow';
import type { FC } from 'react';
import { GROUP_KEEPING_DESCRIPTION, GROUP_KEEPING_LABEL } from '../whatsapp-copy';

const keep = (): void => {};

export const WhatsAppHelpKeepingPreview: FC = () => (
  <KkSwitchRow
    label={GROUP_KEEPING_LABEL}
    description={GROUP_KEEPING_DESCRIPTION}
    checked
    onChange={keep}
    stateChip={false}
  />
);
