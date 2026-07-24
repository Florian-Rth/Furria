import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { Link as RouterLink } from '@tanstack/react-router';
import type { FC } from 'react';
import { recruitBandContent } from '@/features/club/recruit-content';

export const RecruitActions: FC = () => (
  <Stack
    direction={{ xs: 'column', sm: 'row' }}
    sx={{
      position: 'relative',
      zIndex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
    }}
  >
    <Button
      component={RouterLink}
      to={recruitBandContent.primaryTo}
      variant="contained"
      size="large"
      sx={{
        alignSelf: { xs: 'stretch', sm: 'auto' },
        bgcolor: 'primary.contrastText',
        color: 'primary.main',
        '&:hover': { bgcolor: 'primary.contrastText', opacity: 0.92 },
      }}
    >
      {recruitBandContent.primaryLabel}
    </Button>
    <Button
      component={RouterLink}
      to={recruitBandContent.secondaryTo}
      variant="outlined"
      size="large"
      sx={(theme) => ({
        alignSelf: { xs: 'stretch', sm: 'auto' },
        color: 'primary.contrastText',
        borderColor: 'primary.contrastText',
        '&:hover': {
          borderColor: 'primary.contrastText',
          bgcolor: theme.alpha(theme.palette.primary.contrastText, 0.12),
        },
      })}
    >
      {recruitBandContent.secondaryLabel}
    </Button>
  </Stack>
);
