import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';

interface KkStudioDeskTitleProps {
  text: string;
}

export const KkStudioDeskTitle: FC<KkStudioDeskTitleProps> = ({ text }) => (
  <Typography
    variant="overline"
    sx={{
      fontWeight: kkTokens.eyebrow.fontWeight,
      letterSpacing: kkTokens.eyebrow.letterSpacing,
      lineHeight: 1.2,
      color: 'text.secondary',
    }}
  >
    {text}
  </Typography>
);
