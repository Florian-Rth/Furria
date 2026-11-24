import { KkNote } from '@furria/ui/KkNote';
import type { FC } from 'react';
import { useClubAssistantQuery } from '../api';
import { CLUB_ASSISTANT_FAILED_MESSAGE } from '../whatsapp-copy';
import { WhatsAppAssistantPanel } from './WhatsAppAssistantPanel';

const FAILED_NOTE = (
  <KkNote tone="warning" icon="alert">
    {CLUB_ASSISTANT_FAILED_MESSAGE}
  </KkNote>
);

export const WhatsAppAssistantSection: FC = () => {
  const query = useClubAssistantQuery();
  const loaded =
    query.data === undefined ? null : <WhatsAppAssistantPanel assistant={query.data} />;
  const section = query.isError ? FAILED_NOTE : loaded;

  return section;
};
