import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { redInk } from '../../../internal/red-ink';
import { KkPracticeFade } from '../../../KkPracticeText/internal/ui/KkPracticeFade';
import { kkTokens } from '../../../tokens';

const EYEBROW_LINE = '1.125rem';
const NAME_LINE = '1.75rem';

interface KkWayStepTitlesProps {
  stepKey: string;
  eyebrow: string;
  name: string;
}

export const KkWayStepTitles: FC<KkWayStepTitlesProps> = ({ stepKey, eyebrow, name }) => (
  <Box sx={{ flex: 1, minWidth: 0 }}>
    <KkPracticeFade fadeKey={`${stepKey}-eyebrow`} sx={{ height: EYEBROW_LINE }}>
      <Typography
        variant="overline"
        component="p"
        data-kk-way-eyebrow
        sx={(theme) => ({
          display: 'block',
          lineHeight: EYEBROW_LINE,
          fontWeight: kkTokens.eyebrow.fontWeight,
          letterSpacing: kkTokens.type.tracking.label,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          ...redInk(theme),
        })}
      >
        {eyebrow}
      </Typography>
    </KkPracticeFade>
    <KkPracticeFade fadeKey={`${stepKey}-name`} sx={{ height: NAME_LINE }}>
      <Typography
        variant="h2"
        component="h1"
        aria-live="polite"
        data-kk-way-name
        sx={{
          display: 'block',
          lineHeight: NAME_LINE,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {name}
      </Typography>
    </KkPracticeFade>
  </Box>
);
