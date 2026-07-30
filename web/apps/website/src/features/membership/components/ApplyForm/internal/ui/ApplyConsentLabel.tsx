import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import {
  applyConsentConjunction,
  applyConsentTail,
  applyPrivacyHref,
  applyPrivacyLabel,
  applySatzungHref,
  applySatzungLabel,
} from '@/features/membership/apply-content';

interface ApplyConsentLabelProps {
  lead: string;
}

export const ApplyConsentLabel: FC<ApplyConsentLabelProps> = ({ lead }) => (
  <Typography variant="body2" sx={{ color: 'text.secondary', textWrap: 'pretty' }}>
    {`${lead} `}
    <Link href={applySatzungHref} color="primary">
      {applySatzungLabel}
    </Link>
    {` ${applyConsentConjunction} `}
    <Link href={applyPrivacyHref} color="primary">
      {applyPrivacyLabel}
    </Link>
    {` ${applyConsentTail}`}
  </Typography>
);
