import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import {
  applyThanksHomeHref,
  applyThanksHomeLabel,
  applyThanksProgramHref,
  applyThanksProgramLabel,
} from '@/features/membership/apply-content';

export const ApplyThanksActions: FC = () => (
  <Stack
    direction="row"
    data-kk-apply-thanks-actions
    sx={{ gap: { xs: 1.5, md: 2 }, flexWrap: 'wrap' }}
  >
    <Button href={applyThanksProgramHref} variant="contained" color="primary" size="large">
      {applyThanksProgramLabel}
    </Button>
    <Button href={applyThanksHomeHref} variant="outlined" size="large">
      {applyThanksHomeLabel}
    </Button>
  </Stack>
);
