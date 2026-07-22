import Button from '@mui/material/Button';
import { Link as RouterLink } from '@tanstack/react-router';
import type { FC } from 'react';
import { mitmachenBandContent } from '@/features/landing/mitmachen-content';

export const MitmachenCta: FC = () => (
  <Button
    component={RouterLink}
    to="/join"
    variant="contained"
    size="large"
    sx={{
      position: 'relative',
      zIndex: 1,
      flexShrink: 0,
      alignSelf: { xs: 'stretch', md: 'auto' },
      bgcolor: 'primary.contrastText',
      color: 'primary.main',
      '&:hover': { bgcolor: 'primary.contrastText', opacity: 0.92 },
    }}
  >
    {mitmachenBandContent.ctaLabel}
  </Button>
);
