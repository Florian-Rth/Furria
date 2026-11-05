import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { KkFlapCountTone } from '../../../KkFlapCount';
import { KkFlapCount } from '../../../KkFlapCount';
import { kkTokens } from '../../../tokens';

interface KkPlanStatusStripCountProps {
  value: string;
  label: string;
  tone?: KkFlapCountTone;
}

export const KkPlanStatusStripCount: FC<KkPlanStatusStripCountProps> = ({
  value,
  label,
  tone = 'ink',
}) => (
  <Stack
    direction="row"
    data-kk-plan-status-count
    aria-label={`${value} ${label}`}
    sx={{ alignItems: 'baseline', gap: 0.75, minWidth: 0 }}
  >
    <KkFlapCount value={value} variant="h4" tone={tone} />
    <Typography
      aria-hidden
      variant="overline"
      sx={{
        color: 'text.secondary',
        fontWeight: kkTokens.eyebrow.fontWeight,
        letterSpacing: kkTokens.eyebrow.letterSpacing,
        lineHeight: 1,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </Typography>
  </Stack>
);
