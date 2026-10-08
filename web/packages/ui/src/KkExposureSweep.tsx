import Box from '@mui/material/Box';
import { keyframes } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

const { sweep } = kkTokens.gallery;
const BAND_PERCENT = sweep.band * 100;
const TRAVEL_PERCENT = (100 / sweep.band) * 100;

const pass = keyframes`
  0% { transform: translateY(-100%); opacity: 1; }
  88% { opacity: 1; }
  100% { transform: translateY(${TRAVEL_PERCENT}%); opacity: 0; }
`;

interface KkExposureSweepProps extends PropsWithChildren {
  delaySeconds?: number;
  scope?: KkExposureScope;
  sx?: KkSx;
}

type KkExposureScope = 'block' | 'viewport';

const scopePosition: Record<KkExposureScope, 'absolute' | 'fixed'> = {
  block: 'absolute',
  viewport: 'fixed',
};

export const KkExposureSweep: FC<KkExposureSweepProps> = ({
  delaySeconds = 0,
  scope = 'block',
  sx,
  children,
}) => (
  <Box
    data-kk-exposure-sweep
    sx={[{ position: 'relative', minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
  >
    {children}
    <Box
      aria-hidden
      sx={{
        position: scopePosition[scope],
        inset: 0,
        zIndex: 1,
        pointerEvents: 'none',
        clipPath: 'inset(0)',
        '@media (prefers-reduced-motion: reduce)': { display: 'none' },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: `${BAND_PERCENT}%`,
          transform: 'translateY(-100%)',
          backgroundImage:
            'linear-gradient(to bottom, rgba(255,244,214,0) 0%, rgba(255,244,214,0.42) 62%, rgba(255,214,120,0.9) 97%, rgba(255,196,46,1) 100%)',
          mixBlendMode: 'screen',
          animation: `${pass} ${sweep.seconds}s cubic-bezier(0.45, 0.05, 0.3, 1) ${delaySeconds}s both`,
          willChange: 'transform',
        }}
      />
    </Box>
  </Box>
);
