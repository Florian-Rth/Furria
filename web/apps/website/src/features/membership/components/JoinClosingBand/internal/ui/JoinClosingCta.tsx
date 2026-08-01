import Button from '@mui/material/Button';
import { Link as RouterLink } from '@tanstack/react-router';
import type { FC } from 'react';
import { joinClosingBandContent } from '@/features/membership/closing-content';

export const JoinClosingCta: FC = () => (
  <Button
    component={RouterLink}
    to={joinClosingBandContent.ctaHref}
    variant="contained"
    size="large"
    sx={{
      flexShrink: 0,
      alignSelf: { xs: 'stretch', sm: 'flex-start', md: 'auto' },
      bgcolor: 'primary.contrastText',
      color: 'primary.main',
      '&:hover': { bgcolor: 'primary.contrastText', opacity: 0.92 },
    }}
  >
    {joinClosingBandContent.ctaLabel}
  </Button>
);
