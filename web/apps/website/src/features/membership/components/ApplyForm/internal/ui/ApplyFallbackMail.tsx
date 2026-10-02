import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { applyFallbackLabel, applyFallbackLead } from '@/features/membership/apply-content';

interface ApplyFallbackMailProps {
  mailHref: string | null;
}

export const ApplyFallbackMail: FC<ApplyFallbackMailProps> = ({ mailHref }) => {
  if (mailHref === null) {
    return null;
  }

  return (
    <>
      <Typography variant="body2">{applyFallbackLead}</Typography>
      <Button href={mailHref} variant="outlined" color="inherit" size="small">
        {applyFallbackLabel}
      </Button>
    </>
  );
};
