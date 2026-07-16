import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { DevHomeApp } from '../../../types';

interface AppStatusCardProps {
  app: DevHomeApp;
}

export const AppStatusCard: FC<AppStatusCardProps> = ({ app }) => (
  <Card>
    <CardContent>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        <Typography variant="h5" component="h2">
          {app.name}
        </Typography>
        <Chip label={app.statusLabel} color={app.statusColor} size="small" />
      </Stack>
      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
        {app.description}
      </Typography>
    </CardContent>
  </Card>
);
