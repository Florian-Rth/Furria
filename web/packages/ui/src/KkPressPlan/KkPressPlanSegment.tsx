import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { KkPressPlanSegmentData } from './KkPressPlan';
import { KkPressPlanTick } from './KkPressPlanTick';

const TICK_STAGGER_SECONDS = 0.05;
const SEGMENT_DELAY_SECONDS = 0.18;

interface KkPressPlanSegmentProps {
  segment: KkPressPlanSegmentData;
  order: number;
  onReveal: (id: string) => void;
}

export const KkPressPlanSegment: FC<KkPressPlanSegmentProps> = ({ segment, order, onReveal }) => {
  const ticks = segment.ticks.map((tick, index) => (
    <KkPressPlanTick
      key={tick.id}
      tick={tick}
      delaySeconds={order * SEGMENT_DELAY_SECONDS + index * TICK_STAGGER_SECONDS}
      onReveal={onReveal}
    />
  ));

  return (
    <Stack
      direction="row"
      data-kk-press-plan-segment
      sx={(theme: Theme) => ({
        flex: '1 0 auto',
        alignItems: 'center',
        columnGap: 1.5,
        minWidth: { xs: `calc(100vw - ${theme.spacing(4)})`, sm: '24rem', md: 0 },
        px: 1.5,
        py: 0.5,
        borderLeft: 1,
        borderColor: 'divider',
        '&:first-of-type': { borderLeft: 0, pl: 0 },
      })}
    >
      <Stack sx={{ flexShrink: 0 }}>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 900,
            lineHeight: 1.2,
            fontVariantNumeric: 'tabular-nums',
            color: segment.isPresent ? 'primary.main' : 'text.primary',
          }}
        >
          {segment.label}
        </Typography>
        <Typography
          variant="caption"
          sx={{ lineHeight: 1.2, color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}
        >
          {segment.meta}
        </Typography>
      </Stack>
      <Box sx={(theme: Theme) => ({ position: 'relative', flex: 1, height: theme.spacing(4.5) })}>
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: '62%',
            borderTop: 1,
            borderColor: 'text.disabled',
          }}
        />
        {ticks}
      </Box>
    </Stack>
  );
};
