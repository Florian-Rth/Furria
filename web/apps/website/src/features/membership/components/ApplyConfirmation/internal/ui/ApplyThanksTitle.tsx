import { KkEyebrow } from '@furria/ui';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { applyThanksEyebrow, buildApplyThanksHeadline } from '@/features/membership/apply-content';

interface ApplyThanksTitleProps {
  firstName: string;
}

export const ApplyThanksTitle: FC<ApplyThanksTitleProps> = ({ firstName }) => (
  <Stack sx={{ gap: 1 }}>
    <KkEyebrow>{applyThanksEyebrow}</KkEyebrow>
    <Typography variant="h2" component="h1" sx={{ textTransform: 'uppercase' }}>
      {buildApplyThanksHeadline(firstName)}
    </Typography>
  </Stack>
);
