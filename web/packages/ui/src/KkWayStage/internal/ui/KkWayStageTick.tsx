import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { redInk } from '../../../internal/red-ink';
import { kkTokens } from '../../../tokens';
import { placeAt, UNZOOMED_SCALE, unzoomed } from '../logic/way-zoom';

const NAMED = '1.25rem';
const PLAIN = '0.5rem';

interface KkWayStageTickProps {
  x: number;
  y: number;
  count: number | null;
}

export const KkWayStageTick: FC<KkWayStageTickProps> = ({ x, y, count }) => {
  const size = unzoomed(count === null ? PLAIN : NAMED);
  const number =
    count === null ? null : (
      <Typography
        component="span"
        variant="caption"
        sx={{
          scale: UNZOOMED_SCALE,
          lineHeight: 1,
          fontWeight: 900,
          fontVariantNumeric: 'tabular-nums',
          color: 'inherit',
        }}
      >
        {count}
      </Typography>
    );

  return (
    <Box
      data-kk-way-tick
      style={placeAt(x, y)}
      sx={(theme) => ({
        position: 'absolute',
        left: 0,
        top: 0,
        zIndex: 1,
        width: size,
        height: size,
        display: 'grid',
        placeItems: 'center',
        borderRadius: '50%',
        backgroundColor:
          count === null
            ? (theme.vars ?? theme).palette.primary.main
            : (theme.vars ?? theme).palette.background.paper,
        boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${(theme.vars ?? theme).palette.primary.main}`,
        ...redInk(theme),
      })}
    >
      {number}
    </Box>
  );
};
