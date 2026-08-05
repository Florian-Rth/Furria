import { kkTokens } from '@furria/ui';
import Button from '@mui/material/Button';
import type { LinkProps } from '@tanstack/react-router';
import { Link as RouterLink } from '@tanstack/react-router';
import type { FC, ReactNode } from 'react';

type BandCtaEmphasis = 'solid' | 'outlined';

interface BandCtaProps {
  to: LinkProps['to'];
  emphasis?: BandCtaEmphasis;
  children: ReactNode;
}

export const BandCta: FC<BandCtaProps> = ({ to, emphasis = 'solid', children }) => (
  <Button
    component={RouterLink}
    to={to}
    variant={emphasis === 'solid' ? 'contained' : 'outlined'}
    size="large"
    data-kk-band-cta
    sx={(theme) => ({
      position: 'relative',
      zIndex: 1,
      flexShrink: 0,
      alignSelf: { xs: 'stretch', sm: 'flex-start', md: 'auto' },
      ...(emphasis === 'solid'
        ? {
            bgcolor: 'primary.contrastText',
            color: 'primary.main',
            '&:hover': { bgcolor: 'primary.contrastText', opacity: kkTokens.opacity.onAccent },
          }
        : {
            color: 'primary.contrastText',
            borderColor: 'primary.contrastText',
            '&:hover': {
              borderColor: 'primary.contrastText',
              bgcolor: theme.alpha(
                theme.palette.primary.contrastText,
                kkTokens.opacity.onAccentWash,
              ),
            },
          }),
    })}
  >
    {children}
  </Button>
);
