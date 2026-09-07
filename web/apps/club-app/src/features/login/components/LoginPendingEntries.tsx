import { KkButton, KkNote } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';

export const LoginPendingEntries: FC = () => (
  <Stack sx={{ gap: 1.5 }}>
    <KkButton variant="outlined" fullWidth disabled>
      Einladungs-Code einlösen
    </KkButton>
    <KkButton variant="text" fullWidth disabled>
      Passwort vergessen?
    </KkButton>
    <KkNote>Noch nicht verfügbar.</KkNote>
  </Stack>
);
