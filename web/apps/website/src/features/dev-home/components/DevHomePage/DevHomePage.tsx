import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { useDevHomeContent } from '../../hooks/use-dev-home-content';
import { AppStatusCard } from './internal/AppStatusCard';
import { DevHomeLayout } from './internal/DevHomeLayout';

export const DevHomePage: FC = () => {
  const content = useDevHomeContent();

  return (
    <DevHomeLayout>
      <DevHomeLayout.Header>
        <Stack direction="row" sx={{ alignItems: 'center', gap: 2 }}>
          <Typography variant="h3" component="h1">
            {content.title}
          </Typography>
          <Chip label={content.badgeLabel} color="warning" size="small" />
        </Stack>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          {content.intro}
        </Typography>
      </DevHomeLayout.Header>
      <DevHomeLayout.Apps>
        {content.apps.map((app) => (
          <AppStatusCard key={app.name} app={app} />
        ))}
      </DevHomeLayout.Apps>
    </DevHomeLayout>
  );
};
