import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';

interface KkStudioIDetailTitleProps {
  eyebrow: string;
  title: string;
}

export const KkStudioIDetailTitle: FC<KkStudioIDetailTitleProps> = ({ eyebrow, title }) => (
  <Stack sx={{ flex: 1, minWidth: 0 }}>
    <Typography
      variant="overline"
      sx={{
        fontWeight: kkTokens.eyebrow.fontWeight,
        letterSpacing: kkTokens.eyebrow.letterSpacing,
        lineHeight: 1.3,
        color: 'text.secondary',
        whiteSpace: 'nowrap',
      }}
    >
      {eyebrow}
    </Typography>
    <Typography
      variant="h4"
      component="h3"
      data-kk-studio-i-detail-title
      sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
    >
      {title}
    </Typography>
  </Stack>
);
