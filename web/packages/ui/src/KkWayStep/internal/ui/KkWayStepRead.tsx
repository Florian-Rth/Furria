import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { redInk } from '../../../internal/red-ink';
import { kkTokens } from '../../../tokens';

interface KkWayStepReadProps {
  eyebrow: string;
  text: string;
}

export const KkWayStepRead: FC<KkWayStepReadProps> = ({ eyebrow, text }) => (
  <Stack sx={{ gap: 1, maxWidth: kkTokens.measure.text }}>
    <Typography
      variant="overline"
      component="p"
      sx={(theme) => ({
        fontWeight: kkTokens.eyebrow.fontWeight,
        letterSpacing: kkTokens.type.tracking.label,
        lineHeight: 1.3,
        ...redInk(theme),
      })}
    >
      {eyebrow}
    </Typography>
    <Typography variant="body1" sx={{ textWrap: 'pretty' }}>
      {text}
    </Typography>
  </Stack>
);
