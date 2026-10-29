import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { lineClamp } from '../internal/line-clamp';
import type { KkSx } from '../kk-sx';
import { KkStudioEFade } from './internal/ui/KkStudioEFade';

const LINES = 3;
const LINE_HEIGHT = 1.45;
const BOX_HEIGHT = { xs: `${0.875 * LINE_HEIGHT * LINES}rem`, desktop: `${LINE_HEIGHT * 2}rem` };

interface KkStudioEDescriptionProps {
  stepKey: string;
  text: string | null;
  sx?: KkSx;
}

export const KkStudioEDescription: FC<KkStudioEDescriptionProps> = ({ stepKey, text, sx }) => (
  <KkStudioEFade
    fadeKey={stepKey}
    sx={[{ height: BOX_HEIGHT }, ...(Array.isArray(sx) ? sx : [sx])]}
  >
    <Typography
      data-kk-studio-e-description
      sx={{
        typography: { xs: 'body2', desktop: 'body1' },
        color: 'text.secondary',
        lineHeight: LINE_HEIGHT,
        textAlign: { desktop: 'center' },
        textWrap: 'pretty',
        ...lineClamp(LINES),
        WebkitLineClamp: { xs: LINES, desktop: 2 },
      }}
    >
      {text}
    </Typography>
  </KkStudioEFade>
);
