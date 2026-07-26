import Button from '@mui/material/Button';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { newsProgramBandContent } from '@/features/news/news-content';

export const NewsProgramCta: FC = () => (
  <Button
    component={Link}
    to={newsProgramBandContent.ctaTo}
    variant="outlined"
    size="large"
    sx={(theme) => ({
      flexShrink: 0,
      alignSelf: { xs: 'stretch', sm: 'flex-start', md: 'auto' },
      color: 'primary.contrastText',
      borderColor: 'primary.contrastText',
      '&:hover': {
        borderColor: 'primary.contrastText',
        bgcolor: theme.alpha(theme.palette.primary.contrastText, 0.12),
      },
    })}
  >
    {newsProgramBandContent.ctaLabel}
  </Button>
);
