import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { Fragment } from 'react';
import { KkTicker } from '../../../KkTicker';

const SPEED_SECONDS = 42;
const STAR = '✶';

interface KkPromoStageTickerProps {
  items: readonly string[];
}

export const KkPromoStageTicker: FC<KkPromoStageTickerProps> = ({ items }) => {
  const content = (
    <Stack direction="row" component="span" sx={{ alignItems: 'center', gap: 3, px: 3 }}>
      {[...items, ...items].map((item, index) => (
        <Fragment key={`${item}-${index}`}>
          <Box component="span">{item}</Box>
          <Box component="span" aria-hidden sx={{ color: 'warning.main' }}>
            {STAR}
          </Box>
        </Fragment>
      ))}
    </Stack>
  );

  return <KkTicker content={content} speedSeconds={SPEED_SECONDS} />;
};
