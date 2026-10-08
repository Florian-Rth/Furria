import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { SiteFormFallback } from '../../site-form-types';

interface SiteFormFallbackMailProps {
  fallback: SiteFormFallback | null;
}

export const SiteFormFallbackMail: FC<SiteFormFallbackMailProps> = ({ fallback }) => {
  if (fallback === null) {
    return null;
  }

  return (
    <>
      <Typography variant="body2">{fallback.lead}</Typography>
      <Button href={fallback.href} variant="outlined" color="inherit" size="small">
        {fallback.label}
      </Button>
    </>
  );
};
