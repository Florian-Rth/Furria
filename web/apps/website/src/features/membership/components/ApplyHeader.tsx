import { KkEyebrow } from '@furria/ui';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import {
  applyBackHref,
  applyBackLabel,
  applyEyebrow,
  applyLead,
  applyTitle,
} from '@/features/membership/apply-content';

export const ApplyHeader: FC = () => (
  <Stack sx={{ gap: { xs: 2, md: 3 } }}>
    <Link
      href={applyBackHref}
      underline="none"
      sx={{
        alignSelf: 'flex-start',
        color: 'primary.main',
        fontWeight: 800,
        fontSize: '0.875rem',
        minHeight: '2.75rem',
        display: 'inline-flex',
        alignItems: 'center',
      }}
    >
      {applyBackLabel}
    </Link>
    <Stack sx={{ gap: 1 }}>
      <KkEyebrow>{applyEyebrow}</KkEyebrow>
      <Typography variant="h2" component="h1" sx={{ textTransform: 'uppercase' }}>
        {applyTitle}
      </Typography>
    </Stack>
    <Typography
      variant="body1"
      sx={{ color: 'text.secondary', fontWeight: 500, maxWidth: '44rem', textWrap: 'pretty' }}
    >
      {applyLead}
    </Typography>
  </Stack>
);
