import { KkNote } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';

export const ProfileSkeleton: FC = () => (
  <Stack role="status" aria-busy sx={{ minWidth: 0 }}>
    <KkNote>Wird geladen …</KkNote>
  </Stack>
);
