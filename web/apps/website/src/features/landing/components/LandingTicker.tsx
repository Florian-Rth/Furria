import { KkTicker } from '@furria/ui';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { Fragment } from 'react';
import { useTickerItems } from '../hooks/use-ticker-items';
import { TICKER_REPEAT_COUNT } from '../ticker-content';

const BASE_SPEED_SECONDS = 30;

export const LandingTicker: FC = () => {
  const tickerItems = useTickerItems();

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

  return (
    <KkTicker content={tickerContent} speedSeconds={BASE_SPEED_SECONDS * TICKER_REPEAT_COUNT} />
  );
};
