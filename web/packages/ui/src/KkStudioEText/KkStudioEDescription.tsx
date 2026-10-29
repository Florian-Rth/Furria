import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { KkSx } from '../kk-sx';
import { KkStudioEFade } from './internal/ui/KkStudioEFade';

const LINE = '1.25rem';
const SHORT = '@container kk-studio-e (max-height: 40rem)';

interface KkStudioEDescriptionProps {
  stepKey: string;
  text: string | null;
  sx?: KkSx;
}

export const KkStudioEDescription: FC<KkStudioEDescriptionProps> = ({ stepKey, text, sx }) => (
  <KkStudioEFade
    fadeKey={stepKey}
    sx={[{ height: LINE, [SHORT]: { display: 'none' } }, ...(Array.isArray(sx) ? sx : [sx])]}
  >
    <Typography
      variant="body2"
      data-kk-studio-e-description
      sx={{
        display: 'block',
        color: 'text.secondary',
        lineHeight: LINE,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
    >
      {text}
    </Typography>
  </KkStudioEFade>
);
