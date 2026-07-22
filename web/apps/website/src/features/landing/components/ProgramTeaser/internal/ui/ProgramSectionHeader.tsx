import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from '@tanstack/react-router';
import type { FC } from 'react';

export const ProgramSectionHeader: FC = () => (
  <Stack
    direction="row"
    sx={{ alignItems: 'flex-end', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}
  >
    <Typography variant="h2" component="h2">
      DAS PROGRAMM
    </Typography>
    <Link
      component={RouterLink}
      to="/program"
      underline="hover"
      sx={{ color: 'primary.main', fontWeight: 700 }}
    >
      Alle Termine →
    </Link>
  </Stack>
);
