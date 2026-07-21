import { KkTicker } from '@furria/ui';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { Fragment } from 'react';
import { currentSession } from '@/lib/club';
import { buildTickerPhrases } from '../ticker-content';

const phrases = buildTickerPhrases(currentSession.yearsLabel);

const tickerContent = (
  <Stack direction="row" component="span" sx={{ alignItems: 'center', gap: 3, px: 3 }}>
    {phrases.map((phrase) => (
      <Fragment key={phrase}>
        <Box component="span">{phrase}</Box>
        <Box component="span" aria-hidden sx={{ color: 'warning.main' }}>
          ✶
        </Box>
      </Fragment>
    ))}
  </Stack>
);

export const LandingTicker: FC = () => <KkTicker content={tickerContent} />;
