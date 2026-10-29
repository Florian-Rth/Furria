import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { lineClamp } from '../internal/line-clamp';
import type { KkSx } from '../kk-sx';
import { KkStudioEFade } from './internal/ui/KkStudioEFade';

const LINES = 3;
const LINE_HEIGHT = 1.45;

interface KkStudioEDescriptionProps {
  stepKey: string;
  text: string | null;
  sx?: KkSx;
}

export const KkStudioEDescription: FC<KkStudioEDescriptionProps> = ({ stepKey, text, sx }) => (
  <KkStudioEFade
    fadeKey={stepKey}
    sx={[
      (theme) => ({
        height: `calc(${theme.typography.body2.fontSize} * ${LINE_HEIGHT * LINES})`,
        [theme.breakpoints.up('desktop')]: {
          height: `calc(${theme.typography.body1.fontSize} * ${LINE_HEIGHT * LINES})`,
        },
      }),
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    <Typography
      variant="body2"
      data-kk-studio-e-description
      sx={(theme) => ({
        color: 'text.secondary',
        lineHeight: LINE_HEIGHT,
        textWrap: 'pretty',
        ...lineClamp(LINES),
        [theme.breakpoints.up('desktop')]: { ...theme.typography.body1, lineHeight: LINE_HEIGHT, textAlign: 'center' },
      })}
    >
      {text}
    </Typography>
  </KkStudioEFade>
);
