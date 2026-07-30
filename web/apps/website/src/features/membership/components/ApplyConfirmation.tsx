import { KkEyebrow, KkSection } from '@furria/ui';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import {
  applyThanksEyebrow,
  applyThanksText,
  buildApplyThanksHeadline,
} from '@/features/membership/apply-content';

interface ApplyConfirmationProps {
  firstName: string;
}

export const ApplyConfirmation: FC<ApplyConfirmationProps> = ({ firstName }) => (
  <KkSection>
    <Stack sx={{ gap: 1 }}>
      <KkEyebrow>{applyThanksEyebrow}</KkEyebrow>
      <Typography variant="h2" component="h1" sx={{ textTransform: 'uppercase' }}>
        {buildApplyThanksHeadline(firstName)}
      </Typography>
    </Stack>
    <Typography
      variant="body1"
      sx={{ color: 'text.secondary', fontWeight: 500, maxWidth: '44rem', textWrap: 'pretty' }}
    >
      {applyThanksText}
    </Typography>
  </KkSection>
);
