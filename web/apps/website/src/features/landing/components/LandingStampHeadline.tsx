import { KkFanBurst } from '@furria/ui/KkFanBurst';
import { stampDownOf, stampJoltOf } from '@furria/ui/stamp-down';
import { kkTokens } from '@furria/ui/tokens';
import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';

const LEAD_AT_MS = 250;
const ANSWER_AT_MS = LEAD_AT_MS + 480;
const BURST_AT_MS = ANSWER_AT_MS + 230;
const BURST_SEED = 31;

interface LandingStampHeadlineProps {
  line1Color?: string;
  posterShadow?: boolean;
}

export const LandingStampHeadline: FC<LandingStampHeadlineProps> = ({
  line1Color = 'text.primary',
  posterShadow = false,
}) => {
  const answerShadowOf = (theme: Theme): CSSObject =>
    posterShadow
      ? { textShadow: `${kkTokens.shadow.posterOffset} ${theme.palette.text.primary}` }
      : {};

  return (
    <Typography variant="poster" component="h1" sx={stampJoltOf(ANSWER_AT_MS)}>
      <Box component="span" sx={{ ...stampDownOf(LEAD_AT_MS), color: line1Color }}>
        GROSS
      </Box>
      <Box
        component="span"
        sx={(theme) => ({
          ...stampDownOf(ANSWER_AT_MS),
          display: 'inline-block',
          position: 'relative',
          color: 'primary.main',
          ...answerShadowOf(theme),
        })}
      >
        FURRIA!
        <KkFanBurst
          seed={BURST_SEED}
          atMs={BURST_AT_MS}
          fan="side"
          sx={{ left: '100%', top: '45%' }}
        />
      </Box>
    </Typography>
  );
};
