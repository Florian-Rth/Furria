import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { KkSx } from '../kk-sx';
import { KkPracticeFade } from './internal/ui/KkPracticeFade';

const LINE = '1.25rem';
const SHORT = '@container kk-practice (max-height: 40rem)';

interface KkPracticeDescriptionProps {
  stepKey: string;
  text: string | null;
  sx?: KkSx;
}

export const KkPracticeDescription: FC<KkPracticeDescriptionProps> = ({ stepKey, text, sx }) => (
  <KkPracticeFade
    fadeKey={stepKey}
    sx={[{ height: LINE, [SHORT]: { display: 'none' } }, ...(Array.isArray(sx) ? sx : [sx])]}
  >
    <Typography
      variant="body2"
      data-kk-practice-description
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
  </KkPracticeFade>
);
