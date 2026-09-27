import Box from '@mui/material/Box';
import type { FC } from 'react';
import type { KkSx } from './kk-sx';
import { toQrModules } from './qr-modules';
import { kkTokens } from './tokens';

const SCANNABLE_INK = kkTokens.color.light.ink;
const SCANNABLE_PAPER = kkTokens.color.light.panel2;

interface KkQrCodeProps {
  value: string;
  label: string;
  dimmed?: boolean;
  sx?: KkSx;
}

export const KkQrCode: FC<KkQrCodeProps> = ({ value, label, dimmed = false, sx }) => {
  const { size, path } = toQrModules(value);

  return (
    <Box
      data-kk-qr-code
      role="img"
      aria-label={label}
      sx={[
        {
          width: '100%',
          aspectRatio: '1',
          borderRadius: `${kkTokens.radius.base}px`,
          backgroundColor: SCANNABLE_PAPER,
          opacity: dimmed ? 0.18 : 1,
          transition: 'opacity 240ms ease',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box
        component="svg"
        viewBox={`0 0 ${size} ${size}`}
        shapeRendering="crispEdges"
        aria-hidden
        sx={{ display: 'block', width: '100%', height: '100%' }}
      >
        <path d={path} fill={SCANNABLE_INK} />
      </Box>
    </Box>
  );
};
