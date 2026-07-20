import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import type { LinkProps } from '@tanstack/react-router';
import { Link as RouterLink } from '@tanstack/react-router';
import type { FC } from 'react';
import { AppCardContent } from './AppCardContent';

interface AppLaunchCardProps {
  name: string;
  description: string;
  to: LinkProps['to'];
}

export const AppLaunchCard: FC<AppLaunchCardProps> = ({ name, description, to }) => (
  <Card>
    <CardActionArea component={RouterLink} to={to}>
      <AppCardContent
        name={name}
        description={description}
        statusLabel="Live"
        statusColor="success"
      />
    </CardActionArea>
  </Card>
);
