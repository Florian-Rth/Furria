import Card from '@mui/material/Card';
import type { FC } from 'react';
import { AppCardContent } from './AppCardContent';

interface AppPlannedCardProps {
  name: string;
  description: string;
}

// An app that does not exist yet: no link, just the announcement.
export const AppPlannedCard: FC<AppPlannedCardProps> = ({ name, description }) => (
  <Card>
    <AppCardContent
      name={name}
      description={description}
      statusLabel="Geplant"
      statusColor="default"
    />
  </Card>
);
