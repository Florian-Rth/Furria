import { PageLayout } from '@furria/ui';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';

interface PlaceholderPageProps {
  title: string;
}

export const PlaceholderPage: FC<PlaceholderPageProps> = ({ title }) => (
  <PageLayout>
    <PageLayout.Header>
      <Chip label="In Arbeit" color="warning" size="small" />
      <Typography variant="h2" component="h1">
        {title}
      </Typography>
    </PageLayout.Header>
    <PageLayout.Content gap={1.5}>
      <Typography variant="h5" component="p">
        Diese Seite entsteht gerade.
      </Typography>
      <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 'sm' }}>
        Wir arbeiten hinter den Kulissen daran. Schau bald wieder vorbei — Gross - Furria!
      </Typography>
    </PageLayout.Content>
  </PageLayout>
);
