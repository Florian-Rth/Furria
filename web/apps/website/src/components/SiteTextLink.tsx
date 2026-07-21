import { KkConfettiBurst } from '@furria/ui';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import type { LinkProps } from '@tanstack/react-router';
import { Link as RouterLink } from '@tanstack/react-router';
import type { FC, ReactNode } from 'react';
import { useState } from 'react';

interface SiteTextLinkProps {
  to: LinkProps['to'];
  burstOnClick?: boolean;
  children: ReactNode;
}

export const SiteTextLink: FC<SiteTextLinkProps> = ({ to, burstOnClick = false, children }) => {
  const [burstKey, setBurstKey] = useState(0);

  const handleClick = (): void => {
    if (burstOnClick) {
      setBurstKey((current) => current + 1);
    }
  };

  return (
    <Box component="span" sx={{ position: 'relative', display: 'inline-flex' }}>
      <Link
        component={RouterLink}
        to={to}
        onClick={handleClick}
        underline="none"
        variant="body2"
        sx={{
          position: 'relative',
          color: 'text.primary',
          fontWeight: 700,
          whiteSpace: 'nowrap',
          transition: 'color 0.28s ease',
          '&::after': {
            content: '""',
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: -2,
            height: 2,
            bgcolor: 'currentColor',
            transform: 'scaleX(0)',
            transformOrigin: 'right center',
            transition: 'transform 0.28s ease',
          },
          '&:hover, &:focus-visible': {
            color: 'primary.main',
          },
          '&:hover::after, &:focus-visible::after': {
            transform: 'scaleX(1)',
            transformOrigin: 'left center',
          },
          '&.active': {
            color: 'primary.main',
          },
          '&.active::after': {
            transform: 'scaleX(1)',
            transformOrigin: 'left center',
          },
        }}
      >
        {children}
      </Link>
      {burstOnClick ? <KkConfettiBurst fireKey={burstKey} /> : null}
    </Box>
  );
};
