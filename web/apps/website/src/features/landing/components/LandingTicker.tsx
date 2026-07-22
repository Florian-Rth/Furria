import { KkTicker } from '@furria/ui';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { Fragment } from 'react';
import { currentSession } from '@/lib/club';
import { buildTickerPhrases } from '../ticker-content';

const phrases = buildTickerPhrases(currentSession.yearsLabel);

const REPEAT_COUNT = 8;
const BASE_SPEED_SECONDS = 30;

const tickerItems = Array.from({ length: REPEAT_COUNT }, (_, repeat) => repeat).flatMap((repeat) =>
  phrases.map((phrase) => ({ key: `${repeat}-${phrase}`, phrase })),
);

const tickerContent = (
  <Stack direction="row" component="span" sx={{ alignItems: 'center', gap: 3, px: 3 }}>
    {tickerItems.map(({ key, phrase }) => (
      <Fragment key={key}>
        <Box component="span">{phrase}</Box>
        <Box component="span" aria-hidden sx={{ color: 'warning.main' }}>
          ✶
        </Box>
      </Fragment>
    ))}
  </Stack>
);

export const LandingTicker: FC = () => (
  <KkTicker content={tickerContent} speedSeconds={BASE_SPEED_SECONDS * REPEAT_COUNT} />
);
