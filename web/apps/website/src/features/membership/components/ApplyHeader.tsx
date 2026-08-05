import { KkEyebrow, KkLead } from '@furria/ui';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { BackLink } from '@/components/BackLink';
import {
  applyBackHref,
  applyBackLabel,
  applyEyebrow,
  applyLead,
  applyTitle,
} from '@/features/membership/apply-content';

export const ApplyHeader: FC = () => (
  <Stack sx={{ gap: { xs: 2, md: 3 } }}>
    <BackLink to={applyBackHref} sx={{ alignSelf: 'flex-start' }}>
      {applyBackLabel}
    </BackLink>
    <Stack sx={{ gap: 1 }}>
      <KkEyebrow>{applyEyebrow}</KkEyebrow>
      <Typography variant="h2" component="h1" sx={{ textTransform: 'uppercase' }}>
        {applyTitle}
      </Typography>
    </Stack>
    <KkLead>{applyLead}</KkLead>
  </Stack>
);
