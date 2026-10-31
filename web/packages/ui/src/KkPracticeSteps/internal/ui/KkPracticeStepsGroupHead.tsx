import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';

interface KkPracticeStepsGroupHeadProps {
  name: string;
  meta: string;
}

export const KkPracticeStepsGroupHead: FC<KkPracticeStepsGroupHeadProps> = ({ name, meta }) => (
  <Stack
    direction="row"
    sx={(theme) => ({
      position: 'sticky',
      top: 0,
      zIndex: 1,
      alignItems: 'baseline',
      gap: 1,
      px: 1.5,
      py: 0.75,
      backgroundColor: (theme.vars ?? theme).palette.background.paper,
    })}
  >
    <Typography
      variant="overline"
      sx={{
        fontWeight: kkTokens.eyebrow.fontWeight,
        letterSpacing: kkTokens.eyebrow.letterSpacing,
      }}
    >
      {name}
    </Typography>
    <Typography
      variant="caption"
      sx={{ color: 'text.secondary', fontVariantNumeric: 'tabular-nums', fontWeight: 700 }}
    >
      {meta}
    </Typography>
  </Stack>
);
