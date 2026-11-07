import { KkText } from '@furria/ui/KkText';
import type { FC } from 'react';

interface HubDescriptionLeadProps {
  description: string;
}

export const HubDescriptionLead: FC<HubDescriptionLeadProps> = ({ description }) => {
  const text = description.trim();

  if (text === '') {
    return null;
  }

  return <KkText tone="secondary">{text}</KkText>;
};
