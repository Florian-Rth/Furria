import { PageLayout } from '@furria/ui';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { AppLaunchCard } from './internal/AppLaunchCard';
import { AppPlannedCard } from './internal/AppPlannedCard';

export const DevHomePage: FC = () => (
  <PageLayout>
    <PageLayout.Header>
      <Stack direction="row" sx={{ alignItems: 'center', gap: 2 }}>
        <Typography variant="h3" component="h1">
          Interner Testbereich
        </Typography>
        <Chip label="In Arbeit" color="warning" size="small" />
      </Stack>
      <Typography variant="body1" sx={{ color: 'text.secondary' }}>
        Willkommen hinter den Kulissen! Hier siehst du immer den neuesten Entwicklungsstand der
        FURRIA-Plattform. Alles kann sich jederzeit ändern — genau dafür ist dieser Bereich da.
      </Typography>
    </PageLayout.Header>
    <PageLayout.Content gap={2}>
      <AppLaunchCard
        name="Website"
        description="Der öffentliche Auftritt: Programm, Tickets, Neuigkeiten und der Weg in den Verein."
        to="/"
      />
      <AppPlannedCard
        name="Club-App"
        description="Die interne App für Mitglieder: Mitgliederverwaltung, Beiträge, Veranstaltungsplanung, Live-Regie und Getränkekasse."
      />
      <AppPlannedCard
        name="Event-App"
        description="Für Gäste bei Veranstaltungen: Fotos vom Tisch hochladen, Live-Fotowand und das digitale Programmheft."
      />
    </PageLayout.Content>
  </PageLayout>
);
