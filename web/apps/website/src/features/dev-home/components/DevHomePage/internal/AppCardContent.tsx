import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';

interface AppCardContentProps {
  name: string;
  description: string;
  statusLabel: string;
  statusColor: 'success' | 'default';
}

// Presentational body shared by the launch and planned cards.
export const AppCardContent: FC<AppCardContentProps> = ({
  name,
  description,
  statusLabel,
  statusColor,
}) => (
  <CardContent>
    <Stack sx={{ gap: 1 }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        <Typography variant="h5" component="h2">
          {name}
        </Typography>
        <Chip label={statusLabel} color={statusColor} size="small" />
      </Stack>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {description}
      </Typography>
    </Stack>
  </CardContent>
);
