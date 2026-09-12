import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { keyframes } from '@mui/material/styles';
import type { FC, ReactNode } from 'react';
import { kkTokens } from './tokens';

const scroll = keyframes`
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
`;

interface KkTickerProps {
  content: ReactNode;
  speedSeconds?: number;
}

export const KkTicker: FC<KkTickerProps> = ({ content, speedSeconds = 30 }) => (
  <Box data-kk-ticker sx={{ overflow: 'hidden', bgcolor: 'primary.main', py: 1.5 }}>
    <Stack
      direction="row"
      data-kk-ticker-track
      sx={{
        width: 'max-content',
        animation: `${scroll} ${speedSeconds}s linear infinite`,
        '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
      }}
    >
      {[0, 1].map((segment) => (
        <Box
          key={segment}
          component="span"
          data-kk-ticker-segment
          aria-hidden={segment === 1 || undefined}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            flexShrink: 0,
            whiteSpace: 'nowrap',
            fontFamily: kkTokens.font.display,
            fontSize: { xs: '0.9375rem', md: '1.25rem' },
            letterSpacing: kkTokens.type.tracking.label,
            color: 'primary.contrastText',
          }}
        >
          {content}
        </Box>
      ))}
    </Stack>
  </Box>
);
